from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Report, Incident, Alert, User, VerificationStatus, IncidentStatus, AdminUser
from app.schemas import AnalyticsSummary, ReportsByDate
from app.api.auth import get_current_admin
from typing import List

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get overall analytics summary (admin only)"""
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    total_incidents = db.query(func.count(Incident.id)).scalar() or 0
    active_incidents = db.query(func.count(Incident.id)).filter(
        Incident.status == IncidentStatus.ACTIVE
    ).scalar() or 0
    total_alerts_sent = db.query(func.count(Alert.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    verified_reports = db.query(func.count(Report.id)).filter(
        Report.verification_status == VerificationStatus.verified
    ).scalar() or 0
    pending_reports = db.query(func.count(Report.id)).filter(
        Report.verification_status == VerificationStatus.pending
    ).scalar() or 0
    
    return AnalyticsSummary(
        total_reports=total_reports,
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        total_alerts_sent=total_alerts_sent,
        total_users=total_users,
        verified_reports=verified_reports,
        pending_reports=pending_reports
    )


@router.get("/reports-by-date", response_model=List[ReportsByDate])
async def get_reports_by_date(
    days: int = 30,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get reports grouped by date for time series chart (admin only)"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query reports by date
    results = db.query(
        func.date(Report.created_at).label('date'),
        func.count(Report.id).label('count'),
        func.count(func.nullif(Report.verification_status != VerificationStatus.verified, False)).label('verified_count')
    ).filter(
        Report.created_at >= start_date
    ).group_by(
        func.date(Report.created_at)
    ).order_by(
        func.date(Report.created_at)
    ).all()
    
    return [
        ReportsByDate(
            date=str(r.date),
            count=r.count,
            verified_count=r.verified_count or 0
        )
        for r in results
    ]


@router.get("/geographic")
async def get_geographic_distribution(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get geographic distribution of incidents (admin only)"""
    # TODO: Implement geographic clustering/heat map data
    return {"message": "Geographic analytics - to be implemented"}


@router.get("/severity-breakdown")
async def get_severity_breakdown(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get breakdown of reports by severity (admin only)"""
    results = db.query(
        Report.severity,
        func.count(Report.id).label('count')
    ).group_by(Report.severity).all()
    
    return [
        {"severity": r.severity.value, "count": r.count}
        for r in results
    ]
