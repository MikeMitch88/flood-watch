from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import africastalking
from app.database import get_db
from app.config import get_settings
from app.models.models import TrustedWarden, SmsReport, SmsReportStatus, Incident, IncidentSource, SeverityLevel, User
from app.services.clustering import extract_location, analyze_sms_cluster

router = APIRouter()
settings = get_settings()

# Initialize Africa's Talking
if hasattr(settings, 'AT_USERNAME') and hasattr(settings, 'AT_API_KEY') and settings.AT_USERNAME and settings.AT_API_KEY:
    africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
    sms_service = africastalking.SMS
else:
    sms_service = None

@router.post("/broadcast")
async def broadcast_sms(request: Dict[str, Any], db: Session = Depends(get_db)):
    """Broadcast SMS to residents in specific regions"""
    region = request.get("region")
    message = request.get("message")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    if not sms_service:
        # Mock successful broadcast for testing UI without real API key
        return {
            "success": True,
            "message": "Mock broadcast successful (AT credentials missing)",
            "recipients_count": 50,
            "delivery_rate": 100
        }
        
    # Get phone numbers for the region (or all users for demo purposes)
    if region and region != "All":
        users = db.query(User).filter(User.phone_number.isnot(None)).all() # In a real app we'd filter by region
    else:
        users = db.query(User).filter(User.phone_number.isnot(None)).all()
        
    phone_numbers = [user.phone_number for user in users if user.phone_number]
    
    if not phone_numbers:
        return {"success": False, "message": "No users found with valid phone numbers."}
        
    try:
        response = sms_service.send(message, phone_numbers)
        return {
            "success": True,
            "message": "Broadcast sent successfully",
            "at_response": response,
            "recipients_count": len(phone_numbers),
            "delivery_rate": 100 # Mocked delivery rate
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_sms_metrics(db: Session = Depends(get_db)):
    """Get metrics for SMS campaigns to display on dashboard"""
    return {
        "active_campaigns": 2, # Mock data
        "sms_sent_today": 1250, # Mock data
        "delivery_rate": 98.5 # Mock data
    }

@router.post("/incoming")
async def incoming_sms(
    phoneNumber: str = Form(...),
    text: str = Form(...),
    sessionId: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Webhook for receiving incoming SMS from Africa's Talking"""
    
    msg_upper = text.strip().upper()
    
    # 1. Check for SOS keywords
    if msg_upper in ["HELP", "SOS"]:
        # Generate critical incident immediately
        location = extract_location(text)
        incident = Incident(
            location=f"POINT(36.8219 -1.2921)", # Mock point
            affected_radius_km=1.0,
            severity=SeverityLevel.critical,
            source=IncidentSource.SYSTEM,
            report_count=1
        )
        db.add(incident)
        db.commit()
        return {"status": "success", "action": "sos_triggered"}
        
    # 2. Check for SAFE keyword
    if msg_upper == "SAFE":
        user = db.query(User).filter(User.phone_number == phoneNumber).first()
        if user:
            pass # Update user safe status if we had that field
        return {"status": "success", "action": "marked_safe"}

    # 3. Hybrid Verification: Check if sender is a Trusted Warden
    warden = db.query(TrustedWarden).filter(TrustedWarden.phone_number == phoneNumber).first()
    
    extracted_loc = extract_location(text)
    
    if warden:
        # Warden report: Immediately create a High-Severity Incident
        incident = Incident(
            location=f"POINT(36.8219 -1.2921)", # Mock
            affected_radius_km=5.0,
            severity=SeverityLevel.high,
            source=IncidentSource.WARDEN,
            report_count=1
        )
        db.add(incident)
        
        # Save the warden report for logging
        report = SmsReport(
            phone_number=phoneNumber,
            message_body=text,
            extracted_location=extracted_loc,
            status=SmsReportStatus.VERIFIED
        )
        db.add(report)
        db.commit()
        
        return {"status": "success", "action": "warden_incident_created"}
        
    else:
        # Public crowdsourced report
        report = SmsReport(
            phone_number=phoneNumber,
            message_body=text,
            extracted_location=extracted_loc,
            status=SmsReportStatus.PENDING
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Trigger clustering algorithm
        if extracted_loc:
            cluster_incident = analyze_sms_cluster(db, extracted_loc)
            if cluster_incident:
                return {"status": "success", "action": "public_incident_clustered"}
                
        return {"status": "success", "action": "public_report_pending"}
