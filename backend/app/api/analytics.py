from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Report, Incident, Alert, User, VerificationStatus, IncidentStatus, AdminUser, SeverityLevel
from app.schemas import AnalyticsSummary, ReportsByDate
from app.api.auth import get_current_admin
from app.ml.risk_predictor import risk_predictor
from typing import List

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get overall analytics summary (admin only)"""
    # Organization Segregation
    base_query_report = db.query(Report)
    base_query_incident = db.query(Incident)
    
    if current_admin.organization_id:
        base_query_report = base_query_report.filter(Report.organization_id == current_admin.organization_id)
        base_query_incident = base_query_incident.filter(Incident.organization_id == current_admin.organization_id)
    
    total_reports = base_query_report.count()
    total_incidents = base_query_incident.count()
    active_incidents = base_query_incident.filter(Incident.status == IncidentStatus.active).count()
    
    total_alerts_sent = db.query(func.count(Alert.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    verified_reports = base_query_report.filter(Report.verification_status == VerificationStatus.verified).count()
    pending_reports = base_query_report.filter(Report.verification_status == VerificationStatus.pending).count()
    
    # Calculate an estimated infrastructure impact score
    # Based on the severity of verified reports
    impact_score = 0
    if verified_reports > 0:
        high_severity = base_query_report.filter(
            Report.verification_status == VerificationStatus.verified,
            Report.severity.in_([SeverityLevel.high, SeverityLevel.critical])
        ).count()
        impact_score = min(100, int((high_severity / verified_reports) * 100))
    
    return {
        "total_reports": total_reports,
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "total_alerts_sent": total_alerts_sent,
        "total_users": total_users,
        "verified_reports": verified_reports,
        "pending_reports": pending_reports,
        "infrastructure_impact_score": impact_score
    }


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
    """Get geographic distribution of incidents and AI predictive hotspots"""
    # Organization Segregation
    base_query_incident = db.query(Incident).filter(Incident.status == IncidentStatus.active)
    if current_admin.organization_id:
        base_query_incident = base_query_incident.filter(Incident.organization_id == current_admin.organization_id)
        
    active_incidents = base_query_incident.all()
    
    # Generate predictive hotspots
    predictive_hotspots = []
    
    # Evaluate a few known hotspots for risk prediction
    for hotspot in risk_predictor.known_hotspots:
        center_lat = (hotspot["min_lat"] + hotspot["max_lat"]) / 2
        center_lon = (hotspot["min_lon"] + hotspot["max_lon"]) / 2
        
        prediction = risk_predictor.predict_flood_risk(db, center_lat, center_lon)
        if prediction["probability"] > 0.3:  # Only include if there's some risk
            predictive_hotspots.append({
                "name": hotspot["name"],
                "lat": center_lat,
                "lon": center_lon,
                "risk_probability": prediction["probability"],
                "severity_prediction": prediction["severity_prediction"],
                "factors": prediction["contributing_factors"]
            })
            
    # Serialize active incidents manually since PostGIS coords need parsing
    incident_data = []
    for inc in active_incidents:
        if inc.location:
            # Basic parsing if location is WKBElement; for simplicity return id
            incident_data.append({
                "id": inc.id,
                "severity": inc.severity.value,
                "affected_radius_km": inc.affected_radius_km
            })

    return {
        "active_incidents": incident_data,
        "predictive_hotspots": predictive_hotspots
    }


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
