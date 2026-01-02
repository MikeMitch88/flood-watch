import pytest
from app.services.user_service import UserService
from app.models import PlatformType


@pytest.mark.unit
class TestUserService:
    """Unit tests for UserService"""
    
    def test_create_user(self, db):
        """Test user creation"""
        user = UserService.create_user(
            db,
            phone_number="+254712345678",
            platform=PlatformType.WHATSAPP,
            platform_id="254712345678"
        )
        
        assert user is not None
        assert user.phone_number == "+254712345678"
        assert user.platform == PlatformType.WHATSAPP
        assert user.credibility_score == 100  # Default
        assert user.alert_subscribed is True  # Default
    
    def test_get_user_by_phone(self, db, test_user):
        """Test getting user by phone number"""
        user = UserService.get_user_by_phone(db, test_user.phone_number)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.phone_number == test_user.phone_number
    
    def test_get_user_by_phone_not_found(self, db):
        """Test getting non-existent user"""
        user = UserService.get_user_by_phone(db, "+254700000000")
        assert user is None
    
    def test_update_credibility_score(self, db, test_user):
        """Test credibility score updates"""
        initial_score = test_user.credibility_score
        
        # Increase credibility
        UserService.update_credibility_score(db, test_user.id, +10)
        db.refresh(test_user)
        assert test_user.credibility_score == initial_score + 10
        
        # Decrease credibility
        UserService.update_credibility_score(db, test_user.id, -20)
        db.refresh(test_user)
        assert test_user.credibility_score == initial_score - 10
        
        # Test minimum bound (0)
        UserService.update_credibility_score(db, test_user.id, -200)
        db.refresh(test_user)
        assert test_user.credibility_score == 0
        
        # Test maximum bound (200)
        UserService.update_credibility_score(db, test_user.id, +300)
        db.refresh(test_user)
        assert test_user.credibility_score == 200
    
    def test_toggle_alerts(self, db, test_user):
        """Test alert subscription toggling"""
        initial_status = test_user.alert_subscribed
        
        UserService.toggle_alerts(db, test_user.id)
        db.refresh(test_user)
        assert test_user.alert_subscribed != initial_status
        
        UserService.toggle_alerts(db, test_user.id)
        db.refresh(test_user)
        assert test_user.alert_subscribed == initial_status
    
    def test_update_language(self, db, test_user):
        """Test language preference update"""
        UserService.update_language(db, test_user.id, "sw")
        db.refresh(test_user)
        assert test_user.language_code == "sw"
        
        UserService.update_language(db, test_user.id, "en")
        db.refresh(test_user)
        assert test_user.language_code == "en"
