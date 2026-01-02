# Flood Watch API Reference

Complete API documentation for the Flood Watch backend system.

**Base URL**: `http://localhost:8000` (development) | `https://api.floodwatch.org` (production)

**API Docs**: Visit `/docs` for interactive Swagger UI

---

## 🔐 Authentication

All admin endpoints require JWT authentication.

### Login

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Use token in subsequent requests:**
```http
Authorization: Bearer {access_token}
```

---

## 📝 Reports API

### Get All Reports

```http
GET /api/reports/?skip=0&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `skip` (int): Number of records to skip
- `limit` (int): Max records to return

### Get Pending Reports

```http
GET /api/reports/pending
Authorization: Bearer {token}
```

Returns reports awaiting verification.

### Get Report by IDhttp
GET /api/reports/{report_id}
```

### Create Report

```http
POST /api/reports/
Content-Type: application/json

{
  "user_id": "user_123",
  "lat": -1.2921,
  "lon": 36.8219,
  "severity": "high",
  "description": "Heavy flooding on Main Street",
  "address": "Main Street, Nairobi",
  "image_urls": ["https://s3.../image1.jpg"],
  "water_level_cm": 50
}
```

### Verify Report

```http
POST /api/reports/{report_id}/verify
Authorization: Bearer {token}
```

### Reject Report

```http
POST /api/reports/{report_id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Not a flood event"
}
```

---

## 🚨 Incidents API

### Get All Incidents

```http
GET /api/incidents/?skip=0&limit=50
Authorization: Bearer {token}
```

### Get Active Incidents

```http
GET /api/incidents/active
```

Returns currently active flood incidents.

### Get Incident by ID

```http
GET /api/incidents/{incident_id}
```

### Update Incident Status

```http
PUT /api/incidents/{incident_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "resolved"
}
```

### Resolve Incident

```http
POST /api/incidents/{incident_id}/resolve
Authorization: Bearer {token}
```

---

## 🔔 Alerts API

### Get All Alerts

```http
GET /api/alerts/?limit=50
Authorization: Bearer {token}
```

### Get Alert by ID

```http
GET /api/alerts/{alert_id}
```

### Create Alert

```http
POST /api/alerts/
Authorization: Bearer {token}
Content-Type: application/json

{
  "incident_id": "incident_123",
  "severity": "warning"
}
```

**Automatically:**
- Generates alert from incident
- Finds affected users (geofenced)
- Delivers via WhatsApp/Telegram/SMS
- Tracks delivery status

### Create Alert for Incident

```http
POST /api/alerts/incident/{incident_id}/alert
Authorization: Bearer {token}
```

Convenience endpoint that auto-generates and sends alert.

### Retry Failed Deliveries

```http
POST /api/alerts/{alert_id}/retry
Authorization: Bearer {token}
```

### Get Incident's Alerts

```http
GET /api/alerts/incident/{incident_id}/alerts
```

### Get User's Alerts

```http
GET /api/alerts/user/{user_id}/alerts?limit=20
```

### Mark Alert as Read

```http
POST /api/alerts/{alert_id}/read
Content-Type: application/json

{
  "user_id": "user_123"
}
```

---

## 👥 Users API

### Get All Users

```http
GET /api/users/?skip=0&limit=50
Authorization: Bearer {token}
```

### Get User by ID

```http
GET /api/users/{user_id}
```

### Update User Credibility

```http
PUT /api/users/{user_id}/credibility
Authorization: Bearer {token}
Content-Type: application/json

{
  "adjustment": 10
}
```

Adjusts user's credibility score (+/- points).

---

## 📊 Analytics API

### Get Summary Stats

```http
GET /api/analytics/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_reports": 1247,
  "verified_reports": 856,
  "active_incidents": 12,
  "total_alerts_sent": 45689,
  "total_users": 8234
}
```

### Get Reports by Date

```http
GET /api/analytics/reports-by-date?days=30
Authorization: Bearer {token}
```

Returns time series data for reports trend.

### Get Severity Breakdown

```http
GET /api/analytics/severity-breakdown
Authorization: Bearer {token}
```

**Response:**
```json
{
  "low": 234,
  "medium": 456,
  "high": 312,
  "critical": 45
}
```

---

## 🔌 Webhooks API

### WhatsApp Webhook

```http
POST /api/webhooks/whatsapp
X-Hub-Signature: {signature}
Content-Type: application/json

{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "254712345678",
          "text": { "body": "/report" }
        }]
      }
    }]
  }]
}
```

Handles incoming WhatsApp messages.

### Telegram Webhook

```http
POST /api/webhooks/telegram
Content-Type: application/json

{
  "update_id": 123456,
  "message": {
    "message_id": 789,
    "from": { "id": 123, "username": "user123" },
    "text": "/start"
  }
}
```

Handles incoming Telegram updates.

---

## 🌐 Public API

### Get Public Incidents

```http
GET /api/public/incidents
```

Returns anonymized active incidents (no authentication required).

### Get Public Statistics

```http
GET /api/public/stats
```

Public-facing statistics dashboard data.

---

## 📋 Complete Endpoint List

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** ||||
| POST | `/api/auth/login` | Admin login | No |
| POST | `/api/auth/register` | Register admin | No |
| GET | `/api/auth/me` | Get current user | Yes |
| **Reports** ||||
| GET | `/api/reports/` | List all reports | Yes |
| POST | `/api/reports/` | Create report | No |
| GET | `/api/reports/{id}` | Get report | Yes |
| POST | `/api/reports/{id}/verify` | Verify report | Yes |
| POST | `/api/reports/{id}/reject` | Reject report | Yes |
| GET | `/api/reports/pending` | Get pending reports | Yes |
| **Incidents** ||||
| GET | `/api/incidents/` | List incidents | Yes |
| GET | `/api/incidents/active` | Get active incidents | No |
| GET | `/api/incidents/{id}` | Get incident | Yes |
| PUT | `/api/incidents/{id}/status` | Update status | Yes |
| POST | `/api/incidents/{id}/resolve` | Resolve incident | Yes |
| **Alerts** ||||
| GET | `/api/alerts/` | List alerts | Yes |
| POST | `/api/alerts/` | Create alert | Yes |
| GET | `/api/alerts/{id}` | Get alert | No |
| POST | `/api/alerts/{id}/retry` | Retry delivery | Yes |
| POST | `/api/alerts/incident/{id}/alert` | Create from incident | Yes |
| GET | `/api/alerts/incident/{id}/alerts` | Get incident alerts | No |
| GET | `/api/alerts/user/{id}/alerts` | Get user alerts | No |
| POST | `/api/alerts/{id}/read` | Mark as read | No |
| **Users** ||||
| GET | `/api/users/` | List users | Yes |
| GET | `/api/users/{id}` | Get user | Yes |
| PUT | `/api/users/{id}/credibility` | Update credibility | Yes |
| **Analytics** ||||
| GET | `/api/analytics/summary` | Get summary stats | Yes |
| GET | `/api/analytics/reports-by-date` | Reports trend | Yes |
| GET | `/api/analytics/severity-breakdown` | Severity stats | Yes |
| **Webhooks** ||||
| POST | `/api/webhooks/whatsapp` | WhatsApp webhook | No |
| POST | `/api/webhooks/telegram` | Telegram webhook | No |
| GET | `/api/webhooks/whatsapp` | Webhook verification | No |
| **Public** ||||
| GET | `/api/public/incidents` | Public incidents | No |
| GET | `/api/public/stats` | Public statistics | No |
| **System** ||||
| GET | `/health` | Health check | No |

**Total: 35+ distinct endpoints**

---

## 🔒 Rate Limiting

- **Default**: 100 requests/minute per IP
- **Auth endpoints**: 10 requests/minute
- **Webhook endpoints**: 1000 requests/minute

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360600
```

**429 Response:**
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "detail": "Validation error: severity must be one of: low, medium, high, critical"
}
```

### 401 Unauthorized

```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found

```json
{
  "detail": "Report not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error. Please contact support."
}
```

---

## 📦 Response Models

### Report

```typescript
{
  id: string
  user_id: string
  lat: number
  lon: number
  severity: "low" | "medium" | "high" | "critical"
  description: string
  address: string
  image_urls: string[]
  water_level_cm?: number
  verification_status: "pending" | "verified" | "rejected" | "flagged"
  confidence_score?: number
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### Incident

```typescript
{
  id: string
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "monitoring" | "resolved"
  report_count: number
 affected_radius_km: number
  estimated_population_affected?: number
  created_at: string
  updated_at: string
  resolved_at?: string
}
```

### Alert

```typescript
{
  id: string
  incident_id: string
  severity: "advisory" | "watch" | "warning" | "emergency"
  message: string
  affected_radius_km: number
  recipients_count: number
  delivery_status: "pending" | "sent" | "failed"
  created_at: string
  sent_at?: string
}
```

---

## 🧪 Testing with cURL

### Create a Report

```bash
curl -X POST http://localhost:8000/api/reports/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_test_123",
    "lat": -1.2921,
    "lon": 36.8219,
    "severity": "high",
    "description": "Severe flooding",
    "address": "Test Street"
  }'
```

### Get Reports (with auth)

```bash
TOKEN="your_jwt_token"

curl -X GET http://localhost:8000/api/reports/ \
  -H "Authorization: Bearer $TOKEN"
```

### Create Alert

```bash
curl -X POST http://localhost:8000/api/alerts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "incident_123",
    "severity": "warning"
  }'
```

---

## 🔍 Interactive API Docs

Visit the auto-generated Swagger UI:

**Local**: http://localhost:8000/docs

**Features:**
- Try out all endpoints
- See request/response schemas
- Auto-populated examples
- Authentication flows

**Alternative (ReDoc)**:http://localhost:8000/redoc

---

## 🌊 Webhook Setup

### WhatsApp (360Dialog)

1. Set webhook URL in 360Dialog dashboard:
   ```
   https://your-domain.com/api/webhooks/whatsapp
   ```

2. Webhook will receive messages in this format:
   ```json
   {
     "entry": [{
       "changes": [{
         "value": {
           "messages": [{
             "from": "254712345678",
             "text": { "body": "Message text" },
             "location": { "latitude": -1.29, "longitude": 36.82 }
           }]
         }
       }]
     }]
   }
   ```

### Telegram

1. Set webhook via Bot API:
   ```bash
   curl -X POST \
     "https://api.telegram.org/bot{token}/setWebhook" \
     -d "url=https://your-domain.com/api/webhooks/telegram"
   ```

2. Webhook receives updates in this format:
   ```json
   {
     "update_id": 123456,
     "message": {
       "message_id": 789,
       "from": { "id": 123 },
       "text": "/report"
     }
   }
   ```

---

## 💡 Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (httpOnly cookies or secure storage)
3. **Handle rate limits** gracefully with exponential backoff
4. **Validate all inputs** on client side before sending
5. **Monitor API health** and error rates
6. **Cache GET requests** where appropriate
7. **Use pagination** for large datasets

---

## 🆘 Support

- **API Issues**: Check `/health` endpoint
- **Authentication**: Verify token is valid and not expired
- **Rate Limiting**: Wait for reset time in header
- **Errors**: Check backend logs in Docker

**Documentation**: See full docs at `/docs`
