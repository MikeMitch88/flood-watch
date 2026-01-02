# Flood Watch - Testing Guide

Complete testing documentation for the Flood Watch system.

---

## 🧪 Test Suite Overview

### Test Types

| Type | Count | Coverage Target | Duration |
|------|-------|-----------------|----------|
| Unit Tests | 25+ | 90% | <30s |
| Integration Tests | 20+ | 80% | <2min |
| Load Tests | 4 scenarios | N/A | ~5min |
| **Total** | **45+** | **85%+** | **~7min** |

---

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
cd backend
pip install -r requirements-test.txt
```

### 2. Run All Tests

```bash
pytest
```

### 3. Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

View coverage report: `open htmlcov/index.html`

---

## 📋 Test Categories

### Unit Tests

Test individual services and functions in isolation.

**Run unit tests only:**
```bash
pytest -m unit
```

**Coverage:**
- `test_user_service.py` - 7 tests
- `test_report_service.py` - 7 tests
- `test_incident_service.py` - (TODO)
- `test_alert_service.py` - (TODO)
- `test_verification_service.py` - (TODO)

### Integration Tests

Test API endpoints and service interactions.

**Run integration tests only:**
```bash
pytest -m integration
```

**Coverage:**
- `test_api_endpoints.py` - 20+ tests
  - Auth API (5 tests)
  - Reports API (6 tests)
  - Incidents API (3 tests)
  - Alerts API (3 tests)
  - Analytics API (2 tests)

### End-to-End Tests

Test complete user flows.

**Run E2E tests:**
```bash
pytest -m e2e
```

**Scenarios:**
- Report submission → Verification → Incident → Alert
- User registration → Report → Credibility update
- Multi-user community verification flow

---

## 🔥 Load Testing

### Setup k6

```bash
# Install k6
brew install k6  # macOS
# OR
sudo apt-get install k6  # Ubuntu

# Run load test
cd tests
k6 run load-test.js
```

### Load Test Scenarios

**Test Configuration:**
- **Ramp-up**: 30s to 20 users
- **Peak**: 2 minutes at 100 concurrent users
- **Ramp-down**: 30s to 0 users

**Performance Targets:**
- P95 response time: <500ms
- Error rate: <5%
- Request rate: >100 req/s

**Test Endpoints:**
1. Health check
2. Get active incidents (public)
3. Create flood report
4. Get public stats

**Run with custom URL:**
```bash
k6 run --env BASE_URL=https://api.floodwatch.org load-test.js
```

---

## 📊 Test Coverage

### Current Coverage

Run coverage report:
```bash
pytest --cov=app --cov-report=term-missing
```

**Target Coverage:**
- **Overall**: 85%+
- **Services**: 90%+
- **API Routes**: 80%+
- **Models**: 70%+

### View HTML Coverage Report

```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

---

## ✅ Test Checklist

### Unit Tests
- [x] UserService
  - [x] Create user
  - [x] Get user by phone
  - [x] Update credibility score
  - [x] Toggle alerts
  - [x] Update language
- [x] ReportService
  - [x] Create report
  - [x] Get report by ID
  - [x] Verify report
  - [x] Reject report
  - [x] Get user reports
- [ ] IncidentService
- [ ] AlertService
- [ ] VerificationService

### Integration Tests
- [x] Auth API
  - [x] Login success
  - [x] Login failure
  - [x] Protected endpoints
- [x] Reports API
  - [x] Create report
  - [x] Get reports
  - [x] Verify report
  - [x] Reject report
- [x] Incidents API
  - [x] Get incidents
  - [x] Get active incidents
- [x] Alerts API
  - [x] Get alerts
  - [x] Create alert
- [x] Analytics API
  - [x] Get summary
  - [x] Get trends

### Load Tests
- [x] Health check load
- [x] Public endpoints load
- [x] Report creation load
- [x] Stats endpoint load

---

## 🛠️ Writing Tests

### Unit Test Example

```python
import pytest
from app.services.user_service import UserService

@pytest.mark.unit
def test_create_user(db):
    """Test user creation"""
    user = UserService.create_user(
        db,
        phone_number="+254712345678",
        platform="whatsapp",
        platform_id="254712345678"
    )
    
    assert user is not None
    assert user.phone_number == "+254712345678"
```

### Integration Test Example

```python
import pytest
from fastapi import status

@pytest.mark.integration
def test_create_report(client, test_user):
    """Test creating a report via API"""
    response = client.post("/api/reports/", json={
        "user_id": test_user.id,
        "lat": -1.2921,
        "lon": 36.8219,
        "severity": "high",
        "description": "Heavy flooding"
    })
    
    assert response.status_code == status.HTTP_201_CREATED
```

---

## 🐛 Debugging Tests

### Run Specific Test

```bash
pytest tests/test_user_service.py::TestUserService::test_create_user
```

### Run with Print Statements

```bash
pytest -s
```

### Run Failed Tests Only

```bash
pytest --lf
```

### Stop on First Failure

```bash
pytest -x
```

---

## 🔍 Test Fixtures

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `db` | Fresh test database session |
| `client` | FastAPI test client |
| `admin_user` | Test admin user |
| `auth_headers` | JWT authentication headers |
| `test_user` | Test citizen user |
| `test_report` | Test flood report |
| `test_incident` | Test incident |
| `test_alert` | Test alert |

### Using Fixtures

```python
def test_example(client, auth_headers, test_report):
    response = client.get(
        f"/api/reports/{test_report.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
```

---

## 🚨 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt -r requirements-test.txt
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3
```

---

## 📈 Performance Benchmarks

### Response Time Targets

| Endpoint | Target (P95) | Acceptable |
|----------|--------------|------------|
| GET /health | <50ms | <100ms |
| GET /api/incidents/active | <200ms | <500ms |
| POST /api/reports/ | <300ms | <1s |
| POST /api/alerts/ | <500ms | <2s |
| GET /api/analytics/summary | <400ms | <1s |

### Load Test Results

**Successful if:**
- 95% of requests < 500ms
- Error rate < 5%
- Can handle 100 concurrent users
- No memory leaks over 5 minutes

---

## 🎯 Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use fixtures for setup/teardown
3. **Clear Names**: Test names should describe what they test
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Mock External APIs**: Don't call real external services
6. **Fast Tests**: Keep unit tests under 100ms
7. **Meaningful Assertions**: Test behavior, not implementation

---

## 📝 Test Reports

### Generate Test Report

```bash
pytest --html=report.html --self-contained-html
open report.html
```

### JUnit XML (for CI)

```bash
pytest --junitxml=junit.xml
```

---

## 🔐 Security Testing

### Manual Security Checklist

- [ ] SQL Injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting functional
- [ ] JWT validation working
- [ ] Password hashing (bcrypt)
- [ ] HTTPS in production
- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] Proper authorization checks

### Automated Security Scan

```bash
# Install bandit
pip install bandit

# Run security scan
bandit -r app/
```

---

## 🎓 Resources

- **pytest Docs**: https://docs.pytest.org/
- **FastAPI Testing**: https://fastapi.tiangolo.com/tutorial/testing/
- **k6 Documentation**: https://k6.io/docs/
- **Coverage.py**: https://coverage.readthedocs.io/

---

## ✨ Next Steps

1. **Increase Coverage**: Add tests for missing services
2. **E2E Tests**: Implement full user journey tests
3. **Performance**: Optimize slow endpoints
4. **Security**: Run penetration tests
5. **Monitoring**: Set up error tracking (Sentry)
6. **CI/CD**: Automate testing in pipeline
