import pytest
from app.services.report_service import ReportService
from app.models import SeverityLevel, VerificationStatus
from app.schemas import ReportCreate


@pytest.mark.unit
class TestReportService:
    """Unit tests for ReportService"""
    
    def test_create_report(self, db, test_user):
        """Test report creation"""
        report_data = ReportCreate(
            user_id=test_user.id,
            lat=-1.2921,
            lon=36.8219,
            severity=SeverityLevel.HIGH,
            description="Heavy flooding on Main Street",
            address="Main Street, Nairobi",
            water_level_cm=75
        )
        
        report = ReportService.create_report(db, report_data)
        
        assert report is not None
        assert report.user_id == test_user.id
        assert report.severity == SeverityLevel.HIGH
        assert report.description == "Heavy flooding on Main Street"
        assert report.verification_status == VerificationStatus.PENDING
        assert report.water_level_cm == 75
    
    def test_get_report_by_id(self, db, test_report):
        """Test getting report by ID"""
        report = ReportService.get_report_by_id(db, test_report.id)
        
        assert report is not None
        assert report.id == test_report.id
        assert report.description == test_report.description
    
    def test_get_report_by_id_not_found(self, db):
        """Test getting non-existent report"""
        report = ReportService.get_report_by_id(db, "nonexistent_id")
        assert report is None
    
    def test_get_pending_reports(self, db, test_report):
        """Test getting pending reports"""
        reports = ReportService.get_pending_reports(db)
        
        assert len(reports) >= 1
        assert any(r.id == test_report.id for r in reports)
        assert all(r.verification_status == VerificationStatus.PENDING for r in reports)
    
    def test_verify_report(self, db, test_report):
        """Test report verification"""
        confidence = 0.85
        
        ReportService.verify_report(db, test_report.id, confidence)
        db.refresh(test_report)
        
        assert test_report.verification_status == VerificationStatus.VERIFIED
        assert test_report.confidence_score == confidence
        assert test_report.verified_at is not None
    
    def test_reject_report(self, db, test_report):
        """Test report rejection"""
        reason = "Not a flood event"
        
        ReportService.reject_report(db, test_report.id, reason)
        db.refresh(test_report)
        
        assert test_report.verification_status == VerificationStatus.REJECTED
        assert test_report.rejection_reason == reason
    
    def test_get_user_reports(self, db, test_user, test_report):
        """Test getting reports by user"""
        reports = ReportService.get_user_reports(db, test_user.id)
        
        assert len(reports) >= 1
        assert any(r.id == test_report.id for r in reports)
        assert all(r.user_id == test_user.id for r in reports)
