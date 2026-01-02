from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.models import PlatformType, AdminUser
from app.api.auth import get_current_admin

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    platform: Optional[PlatformType] = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get all users with pagination (admin only)"""
    users = UserService.get_all_users(db, skip=skip, limit=limit, platform=platform)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific user by ID"""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    user = UserService.update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/{user_id}/reports")
async def get_user_reports(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get all reports by a specific user (admin only)"""
    from app.services.report_service import ReportService
    
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    reports = ReportService.get_reports_by_user(db, user_id)
    return reports


@router.put("/{user_id}/credibility")
async def update_user_credibility(
    user_id: str,
    score_change: int = Query(..., description="Score change (positive or negative)"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update user's credibility score (admin only)"""
    user = UserService.update_credibility_score(db, user_id, score_change)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
