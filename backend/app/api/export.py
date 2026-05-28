import csv
import io
import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Incident, IncidentStatus, AdminUser
from app.api.auth import get_current_admin
from app.ml.risk_predictor import risk_predictor

router = APIRouter()


@router.get("/incidents/csv")
async def export_incidents_csv(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Export active incidents as CSV for NGO Disaster Monitoring"""
    # Build query
    query = db.query(Incident).filter(Incident.status == IncidentStatus.active)
    if current_admin.organization_id:
        query = query.filter(Incident.organization_id == current_admin.organization_id)
        
    incidents = query.all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Incident ID", "Severity", "Report Count", 
        "Affected Radius (km)", "Created At", "Updated At"
    ])
    
    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.severity.value,
            inc.report_count,
            inc.affected_radius_km,
            inc.created_at.isoformat() if inc.created_at else "",
            inc.updated_at.isoformat() if inc.updated_at else ""
        ])
        
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=flood_incidents_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return response


@router.get("/hotspots/csv")
async def export_hotspots_csv(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Export predictive hotspots as CSV"""
    predictive_hotspots = []
    
    for hotspot in risk_predictor.known_hotspots:
        center_lat = (hotspot["min_lat"] + hotspot["max_lat"]) / 2
        center_lon = (hotspot["min_lon"] + hotspot["max_lon"]) / 2
        
        prediction = risk_predictor.predict_flood_risk(db, center_lat, center_lon)
        if prediction["probability"] > 0.3:
            predictive_hotspots.append({
                "name": hotspot["name"],
                "lat": center_lat,
                "lon": center_lon,
                "risk_probability": prediction["probability"],
                "severity_prediction": prediction["severity_prediction"],
            })
            
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Hotspot Name", "Latitude", "Longitude", 
        "Risk Probability", "Severity Prediction"
    ])
    
    for hp in predictive_hotspots:
        writer.writerow([
            hp["name"],
            hp["lat"],
            hp["lon"],
            f"{hp['risk_probability'] * 100:.1f}%",
            hp["severity_prediction"]
        ])
        
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=predictive_hotspots_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return response


@router.get("/incidents/json")
async def export_incidents_json(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Export active incidents as JSON for NGO Disaster Monitoring"""
    query = db.query(Incident).filter(Incident.status == IncidentStatus.active)
    if current_admin.organization_id:
        query = query.filter(Incident.organization_id == current_admin.organization_id)
        
    incidents = query.all()
    
    data = []
    for inc in incidents:
        data.append({
            "id": inc.id,
            "severity": inc.severity.value,
            "report_count": inc.report_count,
            "affected_radius_km": inc.affected_radius_km,
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
            "updated_at": inc.updated_at.isoformat() if inc.updated_at else None
        })
        
    response = Response(content=json.dumps(data, indent=2), media_type="application/json")
    response.headers["Content-Disposition"] = f"attachment; filename=flood_incidents_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    return response


@router.get("/hotspots/json")
async def export_hotspots_json(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Export predictive hotspots as JSON"""
    predictive_hotspots = []
    
    for hotspot in risk_predictor.known_hotspots:
        center_lat = (hotspot["min_lat"] + hotspot["max_lat"]) / 2
        center_lon = (hotspot["min_lon"] + hotspot["max_lon"]) / 2
        
        prediction = risk_predictor.predict_flood_risk(db, center_lat, center_lon)
        if prediction["probability"] > 0.3:
            predictive_hotspots.append({
                "name": hotspot["name"],
                "lat": center_lat,
                "lon": center_lon,
                "risk_probability": prediction["probability"],
                "severity_prediction": prediction["severity_prediction"],
                "factors": prediction["contributing_factors"]
            })
            
    response = Response(content=json.dumps(predictive_hotspots, indent=2), media_type="application/json")
    response.headers["Content-Disposition"] = f"attachment; filename=predictive_hotspots_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    return response
