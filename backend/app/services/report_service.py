from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from geoalchemy2.functions import ST_GeogFromText, ST_DWithin, ST_Distance
from app.models import Report, User, VerificationStatus, SeverityLevel
from app.schemas import ReportCreate, ReportUpdate


class ReportService:
    """Service for managing flood reports"""
    
    @staticmethod
    def create_report(db: Session, report_data: ReportCreate) -> Report:
        """Create a new flood report"""
        # Convert location dict to WKT
        lat = report_data.location['lat']
        lon = report_data.location['lon']
        location_wkt = f'POINT({lon} {lat})'
        
        report = Report(
            user_id=report_data.user_id,
            location=location_wkt,
            address=report_data.address,
            severity=report_data.severity,
            description=report_data.description,
            water_depth_cm=report_data.water_depth_cm,
            image_urls=report_data.image_urls,
            video_urls=report_data.video_urls
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def get_report_by_id(db: Session, report_id: str) -> Optional[Report]:
        """Get report by ID"""
        return db.query(Report).filter(Report.id == report_id).first()
    
    @staticmethod
    def update_report(db: Session, report_id: str, report_update: ReportUpdate) -> Optional[Report]:
        """Update report information"""
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return None
        
        update_data = report_update.dict(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(report, key, value)
        
        # If status changed to verified, set verified_at
        if 'verification_status' in update_data and update_data['verification_status'] == VerificationStatus.verified:
            report.verified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def verify_report(db: Session, report_id: str, ai_confidence: Optional[float] = None) -> Optional[Report]:
        """Mark report as verified"""
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return None
        
        report.verification_status = VerificationStatus.verified
        report.verified_at = datetime.utcnow()
        
        if ai_confidence is not None:
            report.ai_confidence_score = ai_confidence
        
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def reject_report(db: Session, report_id: str) -> Optional[Report]:
        """Mark report as rejected"""
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return None
        
        report.verification_status = VerificationStatus.rejected
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def increment_community_verification(db: Session, report_id: str) -> Optional[Report]:
        """Increment community verification count"""
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return None
        
        report.community_verifications += 1
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def get_reports(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[VerificationStatus] = None,
        severity: Optional[SeverityLevel] = None,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Report]:
        """Get reports with filtering"""
        query = db.query(Report)
        
        if status:
            query = query.filter(Report.verification_status == status)
        
        if severity:
            query = query.filter(Report.severity == severity)
        
        if user_id:
            query = query.filter(Report.user_id == user_id)
        
        if start_date:
            query = query.filter(Report.created_at >= start_date)
        
        if end_date:
            query = query.filter(Report.created_at <= end_date)
        
        return query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_pending_reports(db: Session, limit: int = 50) -> List[Report]:
        """Get all pending reports awaiting verification"""
        return db.query(Report).filter(
            Report.verification_status == VerificationStatus.pending
        ).order_by(Report.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def find_nearby_reports(
        db: Session,
        lat: float,
        lon: float,
        radius_km: float = 0.5,
        time_window_hours: int = 1
    ) -> List[Report]:
        """Find reports within radius and time window (for duplicate detection)"""
        point_wkt = f'POINT({lon} {lat})'
        time_threshold = datetime.utcnow() - timedelta(hours=time_window_hours)
        
        nearby_reports = db.query(Report).filter(
            and_(
                ST_DWithin(
                    Report.location,
                    ST_GeogFromText(point_wkt),
                    radius_km * 1000  # Convert km to meters
                ),
                Report.created_at >= time_threshold,
                Report.verification_status != VerificationStatus.rejected
            )
        ).all()
        
        return nearby_reports
    
    @staticmethod
    def get_verified_reports_in_area(
        db: Session,
        lat: float,
        lon: float,
        radius_km: float,
        severity_threshold: Optional[SeverityLevel] = None
    ) -> List[Report]:
        """Get verified reports in an area"""
        point_wkt = f'POINT({lon} {lat})'
        
        query = db.query(Report).filter(
            and_(
                ST_DWithin(
                    Report.location,
                    ST_GeogFromText(point_wkt),
                    radius_km * 1000
                ),
                Report.verification_status == VerificationStatus.verified
            )
        )
        
        if severity_threshold:
            # Filter by severity level (assuming enum order: LOW < MEDIUM < HIGH < CRITICAL)
            severity_order = {
                SeverityLevel.low: 1,
                SeverityLevel.medium: 2,
                SeverityLevel.high: 3,
                SeverityLevel.critical: 4
            }
            threshold_value = severity_order[severity_threshold]
            query = query.filter(
                func.array_position(
                    ['low', 'medium', 'high', 'critical'],
                    Report.severity
                ) >= threshold_value
            )
        
        return query.all()
    
    @staticmethod
    def get_reports_count(
        db: Session,
        status: Optional[VerificationStatus] = None,
        severity: Optional[SeverityLevel] = None
    ) -> int:
        """Get count of reports with filters"""
        query = db.query(func.count(Report.id))
        
        if status:
            query = query.filter(Report.verification_status == status)
        
        if severity:
            query = query.filter(Report.severity == severity)
        
        return query.scalar()
    
    @staticmethod
    def get_reports_by_user(db: Session, user_id: str) -> List[Report]:
        """Get all reports by a specific user"""
        return db.query(Report).filter(
            Report.user_id == user_id
        ).order_by(Report.created_at.desc()).all()
