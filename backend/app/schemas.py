from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models import (
    PlatformType,
    SeverityLevel,
    VerificationStatus,
    IncidentStatus,
    AlertLevel,
    AlertDeliveryStatus,
    UserRole
)


# --- User Schemas ---
class UserBase(BaseModel):
    phone_number: str
    platform: PlatformType
    language_code: str = "en"


class UserCreate(UserBase):
    platform_id: str
    location: Optional[dict] = None  # {"lat": float, "lon": float}


class UserUpdate(BaseModel):
    language_code: Optional[str] = None
    location: Optional[dict] = None
    alert_subscribed: Optional[bool] = None
    alert_radius_km: Optional[int] = None


class UserResponse(UserBase):
    id: str
    platform_id: str
    location: Optional[dict] = None
    alert_subscribed: bool
    alert_radius_km: Optional[int] = None  # Can be None if not set
    credibility_score: int
    created_at: datetime
    last_active: datetime
    
    @validator('location', pre=True)
    def convert_location(cls, v):
        """Convert PostGIS WKBElement to dict"""
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        # WKBElement from PostGIS
        try:
            from geoalchemy2.shape import to_shape
            point = to_shape(v)
            return {'lat': point.y, 'lon': point.x}
        except:
            return None
    
    class Config:
        from_attributes = True


# --- Report Schemas ---
class ReportBase(BaseModel):
    location: dict  # {"lat": float, "lon": float}
    severity: SeverityLevel
    description: Optional[str] = None
    water_depth_cm: Optional[int] = None


class ReportCreate(ReportBase):
    user_id: str
    address: Optional[str] = None
    image_urls: Optional[List[str]] = []
    video_urls: Optional[List[str]] = []


class ReportUpdate(BaseModel):
    severity: Optional[SeverityLevel] = None
    description: Optional[str] = None
    water_depth_cm: Optional[int] = None
    verification_status: Optional[VerificationStatus] = None


class ReportResponse(ReportBase):
    id: str
    user_id: str
    address: Optional[str] = None
    image_urls: List[str] = []
    video_urls: List[str] = []
    verification_status: VerificationStatus
    ai_confidence_score: Optional[float] = None
    community_verifications: int
    created_at: datetime
    verified_at: Optional[datetime] = None
    
    @validator('location', pre=True)
    def convert_location(cls, v):
        """Convert PostGIS WKBElement to dict"""
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        # WKBElement from PostGIS
        try:
            from geoalchemy2.shape import to_shape
            point = to_shape(v)
            return {'lat': point.y, 'lon': point.x}
        except:
            return None
    
    class Config:
        from_attributes = True


# --- Incident Schemas ---
class IncidentBase(BaseModel):
    location: dict
    severity: SeverityLevel


class IncidentCreate(IncidentBase):
    affected_radius_km: float
    report_count: int = 0


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[SeverityLevel] = None
    affected_radius_km: Optional[float] = None


class IncidentResponse(IncidentBase):
    id: str
    affected_radius_km: float
    status: IncidentStatus
    report_count: int
    affected_population_estimate: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    @validator('location', pre=True)
    def convert_location(cls, v):
        """Convert PostGIS WKBElement to dict"""
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        # WKBElement from PostGIS
        try:
            from geoalchemy2.shape import to_shape
            point = to_shape(v)
            return {'lat': point.y, 'lon': point.x}
        except:
            return None
    
    class Config:
        from_attributes = True


# --- Alert Schemas ---
class AlertBase(BaseModel):
    severity: AlertLevel
    message: str


class AlertCreate(AlertBase):
    incident_id: str
    affected_radius_km: float


class AlertResponse(AlertBase):
    id: str
    incident_id: str
    affected_radius_km: float
    recipients_count: int
    delivery_status: AlertDeliveryStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# --- Authentication Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole
    organization_id: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: str
    username: str
    email: str
    email_verified: bool = False
    role: UserRole
    organization_id: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# --- Email Verification Schemas ---
class EmailVerificationRequest(BaseModel):
    email: str


class VerifyCodeRequest(BaseModel):
    code: str


class VerificationResponse(BaseModel):
    success: bool
    message: str


# --- Verification Schemas ---
class AIVerificationResult(BaseModel):
    is_flood: bool
    confidence: float
    severity: int
    estimated_depth_cm: float


class CommunityVerificationRequest(BaseModel):
    report_id: str
    user_id: str
    result: str  # "confirmed" or "rejected"


# --- Analytics Schemas ---
class AnalyticsSummary(BaseModel):
    total_reports: int
    total_incidents: int
    active_incidents: int
    total_alerts_sent: int
    total_users: int
    verified_reports: int
    pending_reports: int


class ReportsByDate(BaseModel):
    date: str
    count: int
    verified_count: int


# --- Location Schemas ---
class LocationPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    
    @validator('lat')
    def validate_lat(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v
    
    @validator('lon')
    def validate_lon(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v


class BoundingBox(BaseModel):
    """For map queries - get incidents within bounds"""
    north: float
    south: float
    east: float
    west: float
