import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.database import Base, get_db
from app.main import app
from app.models import AdminUser, User, Report, Incident, Alert, PlatformType, SeverityLevel
from app.auth import get_password_hash
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

from sqlalchemy.ext.compiler import compiles
from geoalchemy2 import Geography
from sqlalchemy import ARRAY
import sqlite3
from sqlalchemy import event

@compiles(Geography, "sqlite")
def compile_geography(element, compiler, **kw):
    return "VARCHAR(255)"

@compiles(ARRAY, "sqlite")
def compile_array(element, compiler, **kw):
    return "TEXT"

def st_dwithin(*args):
    return 1

def st_geogfromtext(*args):
    return args[0] if args else ""

def st_distance(*args):
    return 0

def st_centroid(*args):
    return ""

def st_union(*args):
    return ""

def as_binary(*args):
    return b"\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"

@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    if type(dbapi_connection) is sqlite3.Connection:
        dbapi_connection.create_function("ST_DWithin", 2, st_dwithin)
        dbapi_connection.create_function("ST_GeogFromText", 1, st_geogfromtext)
        dbapi_connection.create_function("ST_Distance", 2, st_distance)
        dbapi_connection.create_function("ST_Centroid", 1, st_centroid)
        dbapi_connection.create_function("ST_Union", 1, st_union)
        dbapi_connection.create_function("AsBinary", 1, as_binary)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Test client with database override"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    """Create test admin user"""
    admin = AdminUser(
        id=str(uuid.uuid4()),
        username="testadmin",
        email="admin@test.com",
        password_hash=get_password_hash("testpass123"),
        role="admin"
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(client, admin_user):
    """Get authentication headers"""
    response = client.post(
        "/api/auth/login",
        data={"username": "testadmin", "password": "testpass123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_user(db):
    """Create test citizen user"""
    user = User(
        id=str(uuid.uuid4()),
        phone_number="+254712345678",
        platform=PlatformType.WHATSAPP,
        platform_id="254712345678",
        language_code="en",
        alert_subscribed=True,
        credibility_score=100
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_report(db, test_user):
    """Create test flood report"""
    report = Report(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        severity=SeverityLevel.HIGH,
        description="Test flood report",
        address="Test Street, Nairobi",
        image_urls=["https://example.com/image.jpg"],
        water_level_cm=50
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@pytest.fixture
def test_incident(db, test_report):
    """Create test incident"""
    incident = Incident(
        id=str(uuid.uuid4()),
        severity=SeverityLevel.HIGH,
        report_count=1,
        affected_radius_km=5.0,
        status="active"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Link report to incident
    test_report.incident_id = incident.id
    db.commit()
    
    return incident


@pytest.fixture
def test_alert(db, test_incident):
    """Create test alert"""
    from app.models import AlertLevel, AlertDeliveryStatus
    
    alert = Alert(
        id=str(uuid.uuid4()),
        incident_id=test_incident.id,
        severity=AlertLevel.WARNING,
        message="Test alert message",
        affected_radius_km=5.0,
        recipients_count=0,
        delivery_status=AlertDeliveryStatus.PENDING
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
