from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import IncidentResponse, IncidentUpdate
from app.services.incident_service import IncidentService
from app.models import IncidentStatus, AdminUser
from app.api.auth import get_current_admin

router = APIRouter()


@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    status: Optional[IncidentStatus] = None,
    db: Session = Depends(get_db)
):
    """Get all incidents with optional filtering"""
    if status:
        # Filter by specific status
        incidents = IncidentService.get_incidents_by_status(db, status, skip=skip, limit=limit)
    else:
        # Return ALL incidents, not just active
        incidents = IncidentService.get_all_incidents(db, skip=skip, limit=limit)
    
    return incidents


@router.get("/active", response_model=List[IncidentResponse])
async def get_active_incidents(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get all active incidents"""
    incidents = IncidentService.get_active_incidents(db, limit=limit)
    return incidents


@router.get("/map")
async def get_incidents_for_map(
    north: float = Query(..., description="North bound latitude"),
    south: float = Query(..., description="South bound latitude"),
    east: float = Query(..., description="East bound longitude"),
    west: float = Query(..., description="West bound longitude"),
    db: Session = Depends(get_db)
):
    """Get incidents within map bounds"""
    incidents = IncidentService.get_incidents_in_bounds(db, north, south, east, west)
    return incidents


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific incident by ID"""
    incident = IncidentService.get_incident_by_id(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return incident


@router.put("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update incident status (admin only)"""
    incident = IncidentService.update_incident(db, incident_id, incident_update)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return incident


@router.post("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Mark incident as resolved (admin only)"""
    incident = IncidentService.resolve_incident(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return incident


@router.get("/{incident_id}/reports")
async def get_incident_reports(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """Get all reports associated with an incident"""
    reports = IncidentService.get_incident_reports(db, incident_id)
    return reports
