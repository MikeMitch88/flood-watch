from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas import ReportCreate, ReportResponse, ReportUpdate
from app.services.report_service import ReportService
from app.services.user_service import UserService
from app.models import VerificationStatus, SeverityLevel, AdminUser
from app.api.auth import get_current_admin

router = APIRouter()


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db)
):
    """Submit a new flood report"""
    # Check if user exists, if not create them (for Supabase users)
    user = UserService.get_user_by_id(db, report_data.user_id)
    if not user:
        # Auto-create user for Supabase users reporting incidents
        try:
            from app.models import User
            from geoalchemy2 import WKTElement
            
            new_user = User(
                id=report_data.user_id,
                platform="web",
                platform_id=report_data.user_id,
                phone_number=report_data.user_id,  # Use user_id as phone (it's unique anyway)
                language_code="en",
                location=WKTElement(f'POINT({report_data.location["lon"]} {report_data.location["lat"]})', srid=4326) if report_data.location else None,
                alert_subscribed=True,
                alert_radius_km=10.0,
                credibility_score=50.0  # Default credibility for new users
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
            print(f"Auto-created user {report_data.user_id} from Supabase")
        except Exception as e:
            # If user creation fails, rollback and try to fetch existing user
            db.rollback()
            print(f"Error creating user: {e}")
            # Try to get existing user one more time (may have been created by another request)
            user = UserService.get_user_by_id(db, report_data.user_id)
            if not user:
                # If still no user, raise error - can't create report without user
                raise HTTPException(status_code=400, detail=f"Unable to create or find user: {str(e)}")
    
    # Create report
    report = ReportService.create_report(db, report_data)
    
    # Trigger automated verification workflow
    try:
        from app.services.verification_service import VerificationService
        
        # Run verification (async in production)
        verification_result = VerificationService.verify_report_automated(db, report.id)
        
        print(f"Verification result for report {report.id}: {verification_result}")
        
        # If verified, create/update incident and trigger alert
        if verification_result.get('decision') == 'verified':
            from app.services.incident_service import IncidentService
            from app.services.alert_service import AlertService
            
            incident = IncidentService.find_or_create_incident(db, report)
            
            if incident:
                print(f"Report {report.id} linked to incident {incident.id}")
                
                # Generate and send alert to affected users
                try:
                    alert = AlertService.generate_alert_from_incident(db, incident.id)
                    delivery_result = AlertService.deliver_alert(db, alert.id)
                    print(f"Alert {alert.id} sent to {delivery_result['recipients']} users")
                except Exception as e:
                    print(f"Alert generation error: {e}")
        
        # If needs community verification
        elif verification_result.get('decision') == 'pending':
            requests_sent = VerificationService.request_community_verification(db, report.id)
            print(f"Sent {requests_sent} community verification requests")
        
    except Exception as e:
        print(f"Verification workflow error: {e}")
        # Don't fail report creation if verification fails
    
    return report


@router.get("/user/{user_id}", response_model=List[ReportResponse])
async def get_user_reports(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get reports for a specific user (public endpoint)"""
    reports = ReportService.get_reports(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id
    )
    return reports


@router.get("/", response_model=List[ReportResponse])
async def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    status: Optional[VerificationStatus] = None,
    severity: Optional[SeverityLevel] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get reports with filtering (admin only)"""
    reports = ReportService.get_reports(
        db,
        skip=skip,
        limit=limit,
        status=status,
        severity=severity,
        user_id=user_id
    )
    return reports


@router.get("/pending", response_model=List[ReportResponse])
async def get_pending_reports(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get pending reports awaiting verification (admin only)"""
    reports = ReportService.get_pending_reports(db, limit=limit)
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific report by ID"""
    report = ReportService.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report


@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update a report (admin only)"""
    report = ReportService.update_report(db, report_id, report_update)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report


@router.post("/{report_id}/verify", response_model=ReportResponse)
async def verify_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Verify a report as legitimate (admin only)"""
    report = ReportService.verify_report(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Trigger incident creation/update
    try:
        from app.services.incident_service import IncidentService
        
        # Find or create incident for this verified report
        incident = IncidentService.find_or_create_incident(db, report)
        
        if incident:
            print(f"✅ Report {report.id} linked to incident {incident.id}")
        else:
            print(f"⚠️ No incident created/found for report {report.id}")
            
    except Exception as e:
        print(f"❌ Incident creation error: {e}")
        # Don't fail the verification if incident creation fails
    
    return report


@router.post("/{report_id}/reject", response_model=ReportResponse)
async def reject_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Reject a report as false/spam (admin only)"""
    report = ReportService.reject_report(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # TODO: Update user credibility score
    
    return report


@router.post("/{report_id}/community-verify")
async def community_verify_report(
    report_id: str,
    user_id: str,
    result: str,
    db: Session = Depends(get_db)
):
    """Community verification of a report"""
    if result not in ["confirmed", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result must be 'confirmed' or 'rejected'"
        )
    
    # Verify user exists
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get report
    report = ReportService.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Increment community verification
    if result == "confirmed":
        ReportService.increment_community_verification(db, report_id)
    
    # TODO: Log verification in verifications table
    # TODO: Check if threshold met for auto-verification
    
    return {"status": "success", "message": "Verification recorded"}
