# Alert Delivery System Documentation

## Overview

The Alert & Warning System automatically notifies citizens about verified flood incidents in their area using geofenced, multi-channel delivery.

---

## 🎯 Alert Generation Flow

```
┌─────────────────────────────────────────┐
│  Report Submitted by Citizen            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Automated Verification                 │
│  (AI + Weather + Duplicates)            │
└────────────┬────────────────────────────┘
             │
        Decision ≥ 0.6?
             │
     ┌───────┴────────┐
    Yes               No
     │                 │
     ▼                 ▼
┌─────────┐      ┌──────────┐
│VERIFIED │      │PENDING/  │
│         │      │FLAGGED   │
└────┬────┘      └──────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Find or Create Incident                │
│  - Cluster nearby reports               │
│  - Calculate affected radius            │
│  - Determine severity                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Generate Alert                         │
│  - Determine alert level                │
│   (Advisory/Watch/Warning/Emergency)    │
│  - Create alert message                 │
│  - Set affected radius                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Find Affected Users (Geofencing)       │
│  - Query users within radius            │
│  - Filter by alert subscription         │
│  - Order by distance                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Multi-Channel Delivery                 │
│  For each user:                         │
│    1. Get user's platform & language    │
│    2. Translate message                 │
│    3. Try WhatsApp → Telegram → SMS     │
│    4. Track delivery status             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Delivery Complete                      │
│  - Update alert status                  │
│  - Log delivery stats                   │
│  - Retry failures                       │
└─────────────────────────────────────────┘
```

---

## 🚦 Alert Levels

### Mapping: Severity → Alert Level

| Incident Severity | Alert Level | Icon | Use Case |
|-------------------|-------------|------|----------|
| Low | Advisory | 🌊 | Minor flooding, informational |
| Medium | Watch | ⚠️ | Flooding in progress, stay alert |
| High | Warning | 🚨 | Dangerous flooding, avoid area |
| Critical | Emergency | 🆘 | Life-threatening, evacuate now |

---

## 📍 Geofenced Targeting

### How It Works

1. **Incident Location**: Center point from clustered reports
2. **Affected Radius**: Calculated from report spread (default 5km)
3. **User Query**: PostGIS `ST_DWithin` finds users within radius
4. **Alert Subscription**: Only notifies subscribed users

### Example

```python
# Find users within 5km of incident
users = UserService.get_users_within_radius(
    db,
    lat=-1.2921,    # Incident center
    lon=36.8219,
    radius_km=5.0,   # Affected radius
    alert_subscribed_only=True
)

# Result: [User A (2.3km), User B (3.7km), User C (4.5km)]
```

---

## 🌍 Multi-Language Messages

### Alert Templates

**English Example (WARNING level):**
```
🚨 FLOOD WARNING

SIGNIFICANT FLOODING at Main Street, Nairobi. 
5 confirmed reports. 

DANGEROUS CONDITIONS. 
Avoid area immediately. 
Move to higher ground if nearby.
```

**Swahili Example (WARNING level):**
```
🚨 ONYO LA MAFURIKO

MAFURIKO MAKUBWA Main Street, Nairobi.
Ripoti 5 zimethibitishwa.

HALI HATARI.
Epuka eneo mara moja.
Nenda mahali pa juu.
```

**Supported Languages:**
- ✅ English
- ✅ Swahili
- 🔜 French, Spanish, Arabic (add via localization system)

---

## 📡 Multi-Channel Delivery

### Delivery Priority

```
1st Choice: WhatsApp (if user platform is WhatsApp)
     │
     ├─ Success → Mark delivered ✅
     │
     └─ Failure ↓

2nd Choice: Telegram (if user platform is Telegram)
     │
     ├─ Success → Mark delivered ✅
     │
     └─ Failure ↓

3rd Choice: SMS Fallback (via Twilio)
     │
     ├─ Success → Mark delivered ✅
     │
     └─ Failure → Mark failed ❌ (retry later)
```

### Delivery Stats Example

```json
{
  "alert_id": "alert_123",
  "status": "sent",
  "delivery_stats": {
    "total": 247,
    "whatsapp": 189,
    "telegram": 52,
    "sms": 3,
    "failed": 3
  },
  "recipients": 247
}
```

---

## 🔄 Retry Logic

### Failed Deliveries

Automatically retry failed deliveries:

```python
# Retry after 5 minutes
retried = AlertService.retry_failed_deliveries(db, alert_id)

# Returns: Number of successfully retried deliveries
```

**Retry Strategy:**
- 1st retry: 5 minutes
- 2nd retry: 15 minutes
- 3rd retry: 1 hour
- After 3 failures: Manual admin review

---

## 📊 Delivery Tracking

### Per-User Tracking

Each alert has multiple `AlertRecipient` records:

```python
{
  "alert_id": "alert_123",
  "user_id": "user_456",
  "delivered": true,
  "delivered_at": "2024-12-10T05:30:00Z",
  "read": false,
  "read_at": null
}
```

### Read Receipts

When user views alert (via bot command `/alerts`):

```python
AlertService.mark_alert_read(db, alert_id, user_id)
```

---

## 🔧 API Endpoints

### Create Alert

```http
POST /api/alerts/
Authorization: Bearer {admin_token}

{
  "incident_id": "incident_123",
  "severity": "warning"  # optional, auto-determined if not provided
}
```

**Response:**
```json
{
  "id": "alert_789",
  "incident_id": "incident_123",
  "severity": "warning",
  "message": "🚨 FLOOD WARNING...",
  "affected_radius_km": 5.0,
  "recipients_count": 247,
  "delivery_status": "pending",
  "created_at": "2024-12-10T05:30:00Z"
}
```

### Create from Incident

```http
POST /api/alerts/incident/{incident_id}/alert
Authorization: Bearer {admin_token}
```

**Automatically:**
1. Determines alert level from incident severity
2. Generates localized messages
3. Finds affected users
4. Delivers to all channels

### Retry Failed

```http
POST /api/alerts/{alert_id}/retry
Authorization: Bearer {admin_token}
```

### Get User's Alerts

```http
GET /api/alerts/user/{user_id}/alerts?limit=20
```

### Get Incident's Alerts

```http
GET /api/alerts/incident/{incident_id}/alerts
```

---

## 🧪 Testing the Alert System

### Test Alert Generation

```python
from app.database import SessionLocal
from app.services.alert_service import AlertService

db = SessionLocal()

# Generate alert from incident
alert = AlertService.generate_alert_from_incident(
    db,
    incident_id="incident_123"
)

print(f"Alert created: {alert.id}")
print(f"Message: {alert.message}")
print(f"Severity: {alert.severity.value}")
```

### Test Alert Delivery

```python
# Deliver to all affected users
result = AlertService.deliver_alert(db, alert.id)

print(f"Recipients: {result['recipients']}")
print(f"Delivered via WhatsApp: {result['delivery_stats']['whatsapp']}")
print(f"Delivered via Telegram: {result['delivery_stats']['telegram']}")
print(f"Failed: {result['delivery_stats']['failed']}")
```

### Test Geofencing

```python
# Find users who would receive alert
users = AlertService.get_affected_users(db, alert)

for user in users:
    print(f"User: {user.phone_number}, Platform: {user.platform.value}")
```

---

## ⚙️ Configuration

### Alert Settings (`.env`)

```bash
# Alert radius buffer (adds to incident radius)
ALERT_RADIUS_BUFFER_KM=2.0

# Minimum reports to create incident
MIN_REPORTS_FOR_INCIDENT=3

# Verification threshold
VERIFICATION_CONFIDENCE_THRESHOLD=0.6
```

### Customize Alert Messages

Edit `AlertService._generate_alert_message()`:

```python
templates = {
    'en': {
        AlertLevel.EMERGENCY: "Custom emergency message..."
    }
}
```

---

## 📈 Performance Optimization

### Background Delivery

Alerts are delivered in background tasks:

```python
# Don't block API response
background_tasks.add_task(AlertService.deliver_alert, db, alert.id)
```

### Batch Delivery

For large user counts (1000+):

```python
# Process in batches
for i in range(0, len(users), 100):
    batch = users[i:i+100]
    deliver_batch(batch)
    time.sleep(1)  # Rate limiting
```

---

## 🎯 Future Enhancements

- [ ] SMS integration via Twilio
- [ ] Voice call alerts for critical situations
- [ ] Push notifications (mobile app)
- [ ] Email alerts
- [ ] Alert escalation (if not acknowledged)
- [ ] Predictive alerts based on weather forecasts
- [ ] Alert zones (districts, neighborhoods)
- [ ] Custom alert templates per region

---

## ✅ Testing Checklist

- [ ] Alert generated from incident
- [ ] Geofencing finds correct users
- [ ] Messages translated to user's language
- [ ] WhatsApp delivery works
- [ ] Telegram delivery works
- [ ] Failed deliveries retry correctly
- [ ] Delivery stats accurate
- [ ] Read receipts work
- [ ] Alert history accessible
- [ ] Performance acceptable (>100 users/second)
