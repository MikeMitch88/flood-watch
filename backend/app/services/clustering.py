"""
SMS Report Clustering Algorithm

Extracts location keywords from incoming SMS messages and clusters
concurrent reports by location to auto-generate incidents when a
threshold is reached (≥5 reports from the same location within 2 hours).
"""

from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.models import (
    SmsReport, Incident, IncidentSource,
    SeverityLevel, SmsReportStatus, IncidentStatus,
)

# ──────────────────────────────────────────────────────────────
# Kenyan location dictionary  (counties, sub-counties, flood zones)
# ──────────────────────────────────────────────────────────────
KENYAN_LOCATIONS: List[str] = [
    # Major counties
    "nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "kiambu",
    "machakos", "thika", "nyeri", "meru", "embu", "kitale",
    "nanyuki", "malindi", "lamu", "kilifi", "kwale", "voi",
    # Historically flood-prone areas
    "kibera", "mathare", "kawangware", "kangemi", "dandora",
    "nyando", "tana river", "garissa", "budalangi", "bomet",
    "busia", "kakamega", "turkana", "mandera", "wajir",
    "isiolo", "marsabit", "samburu", "baringo", "west pokot",
    "elgeyo marakwet", "nandi", "uasin gishu", "kericho",
    "narok", "kajiado", "laikipia", "kirinyaga", "muranga",
    "nyandarua", "siaya", "homa bay", "migori", "kisii",
    "nyamira", "vihiga", "bungoma", "trans nzoia",
    # Common place references
    "tana delta", "sabaki", "athi river", "mbagathi",
    "nairobi river", "mathioya", "lake victoria", "lake baringo",
]


def extract_location(message: str) -> Optional[str]:
    """
    Simple keyword extraction for Kenyan locations.

    Scans the message body for known Kenyan county / ward / area names
    and returns the first match (title-cased).
    """
    message_lower = message.lower()
    for loc in KENYAN_LOCATIONS:
        if loc in message_lower:
            return loc.title()
    return None


def analyze_sms_cluster(
    db: Session,
    location_keyword: str,
    threshold: int = 5,
    window_hours: int = 2,
) -> Optional[Incident]:
    """
    Cluster recent pending SMS reports by location keyword and
    generate an Incident if the threshold is met.

    Rules
    -----
    * Time window: last ``window_hours`` hours (default 2).
    * Threshold : ``threshold`` pending reports (default 5).
    * Source    : ``IncidentSource.PUBLIC_CLUSTER``.
    * Severity  : ``SeverityLevel.medium``.
    """
    if not location_keyword:
        return None

    time_threshold = datetime.utcnow() - timedelta(hours=window_hours)

    recent_reports = (
        db.query(SmsReport)
        .filter(
            SmsReport.status == SmsReportStatus.PENDING,
            SmsReport.timestamp >= time_threshold,
            SmsReport.extracted_location.ilike(f"%{location_keyword}%"),
        )
        .all()
    )

    if len(recent_reports) >= threshold:
        # Create a new public-cluster incident
        new_incident = Incident(
            location="POINT(36.8219 -1.2921)",  # Default Nairobi; real system geocodes
            affected_radius_km=5.0,
            severity=SeverityLevel.medium,
            source=IncidentSource.PUBLIC_CLUSTER,
            status=IncidentStatus.active,
            report_count=len(recent_reports),
        )
        db.add(new_incident)

        # Mark all clustered reports
        for report in recent_reports:
            report.status = SmsReportStatus.CLUSTERED

        db.commit()
        db.refresh(new_incident)
        return new_incident

    return None
