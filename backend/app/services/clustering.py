from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import SmsReport, Incident, IncidentSource, SeverityLevel, SmsReportStatus

def extract_location(message: str) -> Optional[str]:
    """
    Simple keyword extraction for Kenyan locations.
    """
    # Common Kenyan flood-prone regions and counties
    kenyan_locations = [
        "nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "kiambu", 
        "machakos", "thika", "kibera", "mathare", "kawangware", "nyando", 
        "tana river", "garissa", "budalangi", "bomet", "busia", "kakamega",
        "turkana", "mandera", "wajir"
    ]
    
    message_lower = message.lower()
    for loc in kenyan_locations:
        if loc in message_lower:
            return loc.capitalize()
            
    return None

def analyze_sms_cluster(db: Session, location_keyword: str) -> Optional[Incident]:
    """
    Cluster recent pending SMS reports by location keyword and generate an Incident if threshold met.
    """
    if not location_keyword:
        return None

    # Time window: last 2 hours
    time_threshold = datetime.utcnow() - timedelta(hours=2)
    
    # Query pending reports with same location in the time window
    recent_reports = db.query(SmsReport).filter(
        SmsReport.status == SmsReportStatus.PENDING,
        SmsReport.timestamp >= time_threshold,
        SmsReport.extracted_location.ilike(f"%{location_keyword}%")
    ).all()
    
    # Rule: If 5 or more public reports are received for the same location within 2 hours, automatically generate a new Incident
    if len(recent_reports) >= 5:
        # Create incident. Note: For a real system we'd use a geocoding service for exact coordinates.
        # Here we mock a central coordinate for the location keyword.
        new_incident = Incident(
            location=f"POINT(36.8219 -1.2921)", # Mock point for Nairobi center
            affected_radius_km=5.0,
            severity=SeverityLevel.medium,
            source=IncidentSource.PUBLIC_CLUSTER,
            report_count=len(recent_reports)
        )
        db.add(new_incident)
        
        # Mark reports as clustered
        for report in recent_reports:
            report.status = SmsReportStatus.CLUSTERED
            
        db.commit()
        db.refresh(new_incident)
        return new_incident
    
    return None
