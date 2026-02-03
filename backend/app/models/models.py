from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ARRAY, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape
import enum
import uuid
from app.database import Base


# Enums
class PlatformType(str, enum.Enum):
    whatsapp = "whatsapp"
    telegram = "telegram"
    sms = "sms"
    web = "web"


class SeverityLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    flagged = "flagged"


class IncidentStatus(str, enum.Enum):
    active = "active"
    monitoring = "monitoring"
    resolved = "resolved"


class AlertLevel(str, enum.Enum):
    ADVISORY = "advisory"      # Level 1
    WATCH = "watch"            # Level 2
    WARNING = "warning"        # Level 3
    EMERGENCY = "emergency"    # Level 4


class AlertDeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"


class VerificationType(str, enum.Enum):
    AI = "ai"
    COMMUNITY = "community"
    ADMIN = "admin"
    WEATHER = "weather"


class VerificationResult(str, enum.Enum):
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    UNCERTAIN = "uncertain"


class UserRole(str, enum.Enum):
    admin = "admin"
    responder = "responder"
    analyst = "analyst"
    viewer = "viewer"


class OrganizationType(str, enum.Enum):
    EMERGENCY = "emergency"
    NGO = "ngo"
    GOVERNMENT = "government"


class MessageType(str, enum.Enum):
    command = "command"
    text = "text"
    location = "location"
    media = "media"
    button = "button"


def generate_uuid():
    return str(uuid.uuid4())


# --- Bot Messages Table (for analytics) ---
class BotMessage(Base):
    __tablename__ = "bot_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    platform = Column(Enum(PlatformType), nullable=False, index=True)
    platform_user_id = Column(String(100), nullable=False, index=True)
    message_type = Column(Enum(MessageType), nullable=False)
    message_text = Column(Text)
    session_state = Column(String(50))
    response_time_ms = Column(Integer)  # Time to generate response
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)



# --- Users Table ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    platform = Column(Enum(PlatformType), nullable=False)
    platform_id = Column(String(100), unique=True, nullable=False, index=True)
    language_code = Column(String(10), default="en")
    location = Column(Geography(geometry_type='POINT', srid=4326))
    alert_subscribed = Column(Boolean, default=True)
    alert_radius_km = Column(Integer, default=5)
    credibility_score = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    reports = relationship("Report", back_populates="user")
    verifications = relationship("Verification", back_populates="verifier_user")
    alert_recipients = relationship("AlertRecipient", back_populates="user")


# --- Reports Table ---
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)
    address = Column(Text)
    severity = Column(Enum(SeverityLevel), nullable=False)
    description = Column(Text)
    water_depth_cm = Column(Integer)
    image_urls = Column(ARRAY(Text))
    video_urls = Column(ARRAY(Text))
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.pending, index=True)
    ai_confidence_score = Column(Float)
    community_verifications = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    verified_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="reports")
    incidents = relationship("Incident", secondary="incident_reports", back_populates="reports")
    verifications = relationship("Verification", back_populates="report")


# --- Incidents Table ---
class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)
    affected_radius_km = Column(Float)
    severity = Column(Enum(SeverityLevel), nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.active, index=True)
    report_count = Column(Integer, default=0)
    affected_population_estimate = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    reports = relationship("Report", secondary="incident_reports", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident")


# --- Incident Reports Junction Table ---
class IncidentReport(Base):
    __tablename__ = "incident_reports"
    
    incident_id = Column(String(36), ForeignKey("incidents.id"), primary_key=True)
    report_id = Column(String(36), ForeignKey("reports.id"), primary_key=True)


# --- Alerts Table ---
class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), index=True)
    severity = Column(Enum(AlertLevel, values_callable=lambda x: [e.value for e in x]), nullable=False)
    message = Column(Text, nullable=False)
    affected_radius_km = Column(Float)
    recipients_count = Column(Integer)
    delivery_status = Column(Enum(AlertDeliveryStatus, values_callable=lambda x: [e.value for e in x]), default=AlertDeliveryStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    sent_at = Column(DateTime(timezone=True))
    
    # Relationships
    incident = relationship("Incident", back_populates="alerts")
    recipients = relationship("AlertRecipient", back_populates="alert")


# --- Alert Recipients Table ---
class AlertRecipient(Base):
    __tablename__ = "alert_recipients"
    
    alert_id = Column(String(36), ForeignKey("alerts.id"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime(timezone=True))
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    alert = relationship("Alert", back_populates="recipients")
    user = relationship("User", back_populates="alert_recipients")


# --- Organizations Table ---
class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    type = Column(Enum(OrganizationType), nullable=False)
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    coverage_area = Column(Geography(geometry_type='POLYGON', srid=4326))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    admin_users = relationship("AdminUser", back_populates="organization")


# --- Admin Users Table ---
class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    organization = relationship("Organization", back_populates="admin_users")


# --- Verifications Log Table ---
class Verification(Base):
    __tablename__ = "verifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(36), ForeignKey("reports.id"), nullable=False, index=True)
    verifier_user_id = Column(String(36), ForeignKey("users.id"))
    verification_type = Column(Enum(VerificationType), nullable=False)
    result = Column(Enum(VerificationResult), nullable=False)
    confidence_score = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    report = relationship("Report", back_populates="verifications")
    verifier_user = relationship("User", back_populates="verifications")


# --- Email Verification Codes Table ---
class EmailVerificationCode(Base):
    __tablename__ = "email_verification_codes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_user_id = Column(String(36), ForeignKey("admin_users.id"), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)  # bcrypt hash of the code
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    attempts = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True))
