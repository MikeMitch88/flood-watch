import pytest
from fastapi import status


@pytest.mark.integration
class TestAuthAPI:
    """Integration tests for Auth API"""
    
    def test_login_success(self, client, admin_user):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            data={"username": "testadmin", "password": "testpass123"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client, admin_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/auth/login",
            data={"username": "testadmin", "password": "wrongpassword"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/api/auth/login",
            data={"username": "nonexistent", "password": "password"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_protected_endpoint_without_auth(self, client):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/reports/")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_protected_endpoint_with_auth(self, client, auth_headers):
        """Test accessing protected endpoint with valid token"""
        response = client.get("/api/reports/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.integration
class TestReportsAPI:
    """Integration tests for Reports API"""
    
    def test_create_report(self, client, test_user):
        """Test creating a flood report"""
        report_data = {
            "user_id": test_user.id,
            "lat": -1.2921,
            "lon": 36.8219,
            "severity": "high",
            "description": "Heavy flooding",
            "address": "Test Street",
            "water_level_cm": 50
        }
        
        response = client.post("/api/reports/", json=report_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["user_id"] == test_user.id
        assert data["severity"] == "high"
        assert data["description"] == "Heavy flooding"
    
    def test_get_reports(self, client, auth_headers, test_report):
        """Test getting all reports"""
        response = client.get("/api/reports/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_report_by_id(self, client, auth_headers, test_report):
        """Test getting specific report"""
        response = client.get(
            f"/api/reports/{test_report.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_report.id
    
    def test_get_report_not_found(self, client, auth_headers):
        """Test getting non-existent report"""
        response = client.get(
            "/api/reports/nonexistent_id",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_verify_report(self, client, auth_headers, test_report):
        """Test report verification"""
        response = client.post(
            f"/api/reports/{test_report.id}/verify",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify the report was updated
        get_response = client.get(
            f"/api/reports/{test_report.id}",
            headers=auth_headers
        )
        data = get_response.json()
        assert data["verification_status"] == "verified"
    
    def test_reject_report(self, client, auth_headers, test_report):
        """Test report rejection"""
        response = client.post(
            f"/api/reports/{test_report.id}/reject",
            headers=auth_headers,
            json={"reason": "Not a flood"}
        )
        
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.integration
class TestIncidentsAPI:
    """Integration tests for Incidents API"""
    
    def test_get_incidents(self, client, auth_headers, test_incident):
        """Test getting all incidents"""
        response = client.get("/api/incidents/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_active_incidents(self, client, test_incident):
        """Test getting active incidents (public endpoint)"""
        response = client.get("/api/incidents/active")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert all(inc["status"] == "active" for inc in data)
    
    def test_get_incident_by_id(self, client, auth_headers, test_incident):
        """Test getting specific incident"""
        response = client.get(
            f"/api/incidents/{test_incident.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_incident.id


@pytest.mark.integration
class TestAlertsAPI:
    """Integration tests for Alerts API"""
    
    def test_get_alerts(self, client, auth_headers, test_alert):
        """Test getting all alerts"""
        response = client.get("/api/alerts/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_alert_by_id(self, client, test_alert):
        """Test getting specific alert"""
        response = client.get(f"/api/alerts/{test_alert.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_alert.id
    
    def test_create_alert_for_incident(self, client, auth_headers, test_incident):
        """Test creating alert from incident"""
        response = client.post(
            f"/api/alerts/incident/{test_incident.id}/alert",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["incident_id"] == test_incident.id


@pytest.mark.integration
class TestAnalyticsAPI:
    """Integration tests for Analytics API"""
    
    def test_get_summary(self, client, auth_headers):
        """Test getting analytics summary"""
        response = client.get("/api/analytics/summary", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_reports" in data
        assert "active_incidents" in data
        assert "total_users" in data
    
    def test_get_reports_by_date(self, client, auth_headers):
        """Test getting reports trend"""
        response = client.get(
            "/api/analytics/reports-by-date?days=30",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
