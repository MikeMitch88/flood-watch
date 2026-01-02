from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.incident_service import IncidentService
from app.models import IncidentStatus

router = APIRouter()


@router.get("/incidents")
async def get_public_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """Get public incident data (anonymized, no authentication required)"""
    incidents = IncidentService.get_active_incidents(db, limit=limit)
    
    # Return anonymized data
    return [
        {
            "id": inc.id,
            "severity": inc.severity.value,
            "status": inc.status.value,
            "report_count": inc.report_count,
            "created_at": inc.created_at.isoformat()
            # Location intentionally omitted for privacy in public API
        }
        for inc in incidents
    ]


@router.get("/statistics")
async def get_public_statistics(db: Session = Depends(get_db)):
    """Get public statistics (no authentication required)"""
    from sqlalchemy import func
    from app.models import Report, Incident, User
    
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    total_incidents = db.query(func.count(Incident.id)).scalar() or 0
    active_incidents = db.query(func.count(Incident.id)).filter(
        Incident.status == IncidentStatus.active
    ).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    return {
        "total_reports": total_reports,
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "registered_users": total_users
    }


@router.get("/alerts")
async def get_public_alerts(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db)
):
    """Get recent public alerts (no authentication required)"""
    # TODO: Implement public alert feed
    return {"message": "Public alerts feed - to be implemented"}
