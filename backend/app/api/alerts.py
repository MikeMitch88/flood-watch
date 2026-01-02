from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.api.auth import get_current_admin
from app.schemas import AlertResponse, AlertCreate
from app.services.alert_service import AlertService
from app.models import AdminUser, AlertLevel

router = APIRouter()


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Create and send a new alert
    
    Alert will be automatically delivered to affected users
    """
    # Generate alert from incident
    alert = AlertService.generate_alert_from_incident(
        db,
        incident_id=alert_data.incident_id,
        alert_level=alert_data.severity if alert_data.severity else None
    )
    
    # Deliver alert in background
    background_tasks.add_task(AlertService.deliver_alert, db, alert.id)
    
    return alert


@router.post("/incident/{incident_id}/alert", response_model=AlertResponse)
async def create_alert_for_incident(
    incident_id: str,
    alert_level: Optional[AlertLevel] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Generate and send alert for a specific incident"""
    alert = AlertService.generate_alert_from_incident(db, incident_id, alert_level)
    
    # Deliver in background
    background_tasks.add_task(AlertService.deliver_alert, db, alert.id)
    
    return alert


@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get recent alerts"""
    alerts = AlertService.get_recent_alerts(db, limit)
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """Get specific alert by ID"""
    alert = AlertService.get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert


@router.post("/{alert_id}/retry")
async def retry_alert_delivery(
    alert_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Retry failed alert deliveries"""
    retried = AlertService.retry_failed_deliveries(db, alert_id)
    
    return {
        "alert_id": alert_id,
        "retried_count": retried,
        "status": "success"
    }


@router.get("/incident/{incident_id}/alerts", response_model=List[AlertResponse])
async def get_incident_alerts(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """Get all alerts for a specific incident"""
    alerts = AlertService.get_alerts_for_incident(db, incident_id)
    return alerts


@router.get("/user/{user_id}/alerts", response_model=List[AlertResponse])
async def get_user_alerts(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get alerts received by a specific user"""
    alerts = AlertService.get_user_alerts(db, user_id, limit)
    return alerts


@router.post("/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Mark alert as read by user"""
    success = AlertService.mark_alert_read(db, alert_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert or user not found"
        )
    
    return {"status": "success"}


@router.get("/{alert_id}/recipients")
async def get_alert_recipients(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get delivery status for alert recipients (admin only)"""
    # TODO: Implement recipient status retrieval
    return {"message": "Alert recipients endpoint - to be implemented"}
