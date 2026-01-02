from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from datetime import datetime
from geoalchemy2.functions import ST_GeogFromText, ST_DWithin, ST_Distance
from app.models import User, PlatformType
from app.schemas import UserCreate, UserUpdate


class UserService:
    """Service for managing users (citizens using bots)"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Convert location dict to WKT if provided
        location_wkt = None
        if user_data.location:
            lat = user_data.location.get('lat')
            lon = user_data.location.get('lon')
            if lat is not None and lon is not None:
                location_wkt = f'POINT({lon} {lat})'
        
        user = User(
            phone_number=user_data.phone_number,
            platform=user_data.platform,
            platform_id=user_data.platform_id,
            language_code=user_data.language_code,
            location=location_wkt
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_phone(db: Session, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        return db.query(User).filter(User.phone_number == phone_number).first()
    
    @staticmethod
    def get_user_by_platform_id(db: Session, platform: PlatformType, platform_id: str) -> Optional[User]:
        """Get user by platform and platform ID"""
        return db.query(User).filter(
            and_(User.platform == platform, User.platform_id == platform_id)
        ).first()
    
    @staticmethod
    def update_user(db: Session, user_id: str, user_update: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        
        # Handle location update
        if 'location' in update_data and update_data['location']:
            lat = update_data['location'].get('lat')
            lon = update_data['location'].get('lon')
            if lat is not None and lon is not None:
                update_data['location'] = f'POINT({lon} {lat})'
        
        for key, value in update_data.items():
            setattr(user, key, value)
        
        user.last_active = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_credibility_score(db: Session, user_id: str, score_change: int) -> Optional[User]:
        """Update user's credibility score"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        user.credibility_score = max(0, min(200, user.credibility_score + score_change))
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_users_within_radius(
        db: Session,
        lat: float,
        lon: float,
        radius_km: float,
        alert_subscribed_only: bool = True
    ) -> List[User]:
        """Get all users within a radius of a point"""
        point_wkt = f'POINT({lon} {lat})'
        
        query = db.query(User).filter(
            ST_DWithin(
                User.location,
                ST_GeogFromText(point_wkt),
                radius_km * 1000  # Convert km to meters
            )
        )
        
        if alert_subscribed_only:
            query = query.filter(User.alert_subscribed == True)
        
        return query.all()
    
    @staticmethod
    def update_last_active(db: Session, user_id: str) -> None:
        """Update user's last active timestamp"""
        db.query(User).filter(User.id == user_id).update(
            {"last_active": datetime.utcnow()}
        )
        db.commit()
    
    @staticmethod
    def get_all_users(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        platform: Optional[PlatformType] = None
    ) -> List[User]:
        """Get all users with pagination"""
        query = db.query(User)
        
        if platform:
            query = query.filter(User.platform == platform)
        
        return query.offset(skip).limit(limit).all()
