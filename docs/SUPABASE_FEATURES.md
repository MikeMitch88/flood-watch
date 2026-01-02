# Supabase Features Integration Guide

This guide covers optional Supabase features you can enable in Flood Watch to enhance functionality.

## Overview

Supabase provides several features beyond basic PostgreSQL:
- **Authentication** - Replace custom JWT with Supabase Auth
- **Storage** - Replace AWS S3 with Supabase Storage  
- **Realtime** - Live database subscriptions
- **Edge Functions** - Serverless functions
- **Row Level Security (RLS)** - Multi-tenant data security

---

## 1. Supabase Authentication

### Why Use Supabase Auth?

- Built-in user management
- Magic links, OAuth providers (Google, GitHub, etc.)
- Email verification
- Password reset flows
- Session management

### Setup

**1. Enable in `.env`:**
```bash
USE_SUPABASE_AUTH=true
```

**2. Configure providers in Supabase Dashboard:**
- Go to **Authentication** → **Providers**
- Enable Email provider (enabled by default)
- Optional: Enable OAuth providers

**3. Update authentication endpoints:**

```python
# backend/app/api/auth.py
from app.supabase_client import get_supabase_client

@router.post("/signup")
async def signup(email: str, password: str):
    supabase = get_supabase_client()
    response = supabase.auth.sign_up({
        "email": email,
        "password": password
    })
    return response

@router.post("/login")
async def login(email: str, password: str):
    supabase = get_supabase_client()
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    return response
```

**4. Protect routes:**

```python
from app.supabase_client import get_supabase_client

async def get_current_user(token: str):
    supabase = get_supabase_client()
    user = supabase.auth.get_user(token)
    return user
```

---

## 2. Supabase Storage

### Why Use Supabase Storage?

- No AWS credentials needed
- Built-in image optimization
- Automatic CDN distribution
- Simple API
- Free tier: 1GB storage

### Setup

**1. Create storage bucket:**

In Supabase Dashboard → **Storage**:
```sql
-- Create bucket for flood report media
INSERT INTO storage.buckets (id, name, public)
VALUES ('flood-reports', 'flood-reports', true);
```

Or use the UI to create bucket: `flood-reports`

**2. Enable in `.env`:**
```bash
USE_SUPABASE_STORAGE=true
SUPABASE_STORAGE_BUCKET=flood-reports
```

**3. Update file upload logic:**

```python
# backend/app/api/reports.py
from app.supabase_client import upload_to_supabase_storage

@router.post("/reports")
async def create_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if settings.USE_SUPABASE_STORAGE:
        # Upload to Supabase Storage
        file_data = await file.read()
        file_path = f"reports/{uuid.uuid4()}/{file.filename}"
        
        public_url = await upload_to_supabase_storage(
            bucket="flood-reports",
            file_path=file_path,
            file_data=file_data,
            content_type=file.content_type
        )
        
        # Save URL to database
        report.media_url = public_url
    else:
        # Use AWS S3 (legacy)
        # ... existing S3 upload code
```

**4. Set storage policies (optional):**

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'flood-reports');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'flood-reports' 
  AND auth.role() = 'authenticated'
);
```

---

## 3. Supabase Realtime

### Why Use Supabase Realtime?

- Live flood alerts without polling
- Instant dashboard updates
- WebSocket-based, low latency
- Broadcast to multiple clients

### Setup

**1. Enable Realtime for tables:**

In Supabase Dashboard → **Database** → **Replication**:
- Enable replication for `reports` table
- Enable replication for `incidents` table  
- Enable replication for `alerts` table

Or use SQL:
```sql
-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
```

**2. Enable in `.env`:**
```bash
USE_SUPABASE_REALTIME=true
```

**3. Subscribe to changes (backend):**

```python
# backend/app/services/realtime_service.py
from app.supabase_client import subscribe_to_changes

def on_new_report(payload):
    """Called when a new report is inserted"""
    report_data = payload['record']
    print(f"New report: {report_data}")
    
    # Trigger alert logic
    # Send notifications
    # Update incident clustering

# Start subscription
subscribe_to_changes("reports", on_new_report)
```

**4. Subscribe to changes (frontend):**

```javascript
// frontend/src/services/realtime.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Subscribe to new reports
const subscription = supabase
  .channel('reports')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'reports'
  }, (payload) => {
    console.log('New report:', payload.new)
    // Update UI, show notification
  })
  .subscribe()

// Unsubscribe when component unmounts
subscription.unsubscribe()
```

---

## 4. Row Level Security (RLS)

### Why Use RLS?

- Multi-tenant data isolation
- Fine-grained access control
- Database-level security
- Prevents data leaks

### Setup

**1. Enable RLS on tables:**

```sql
-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

**2. Report access policies:**

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified reports
CREATE POLICY "Public can view verified reports"
ON reports FOR SELECT
USING (status = 'verified');

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  )
);
```

**3. Service role bypass:**

Backend uses `SUPABASE_SERVICE_KEY` which bypasses RLS for admin operations.

---

## 5. Edge Functions (Advanced)

### Use Cases

- SMS sending webhook
- Image processing
- Payment processing
- AI model inference

### Example: Image Verification Function

```typescript
// supabase/functions/verify-image/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { image_url } = await req.json()
  
  // Call AI model
  const response = await fetch('https://ai-model.com/verify', {
    method: 'POST',
    body: JSON.stringify({ url: image_url })
  })
  
  const result = await response.json()
  
  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

Deploy:
```bash
supabase functions deploy verify-image
```

Call from backend:
```python
supabase = get_supabase_client()
response = supabase.functions.invoke('verify-image', {
  'body': {'image_url': report.media_url}
})
```

---

## 6. PostgREST API (Auto-generated REST API)

Supabase auto-generates a REST API for your database.

### Example: Query reports via PostgREST

```python
# Instead of SQL queries, use the PostgREST API
supabase = get_supabase_client()

# Get all verified reports
reports = supabase.table('reports')\
  .select('*')\
  .eq('status', 'verified')\
  .execute()

# Get reports near a location
reports = supabase.rpc('reports_near_location', {
  'lat': -1.2921,
  'lon': 36.8219,
  'radius_km': 5
}).execute()
```

Create RPC function in Supabase:
```sql
CREATE OR REPLACE FUNCTION reports_near_location(
  lat FLOAT,
  lon FLOAT,
  radius_km FLOAT
)
RETURNS SETOF reports AS $$
  SELECT * FROM reports
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    radius_km * 1000
  );
$$ LANGUAGE sql;
```

---

## 7. Database Webhooks

### Trigger webhook on new report

**1. In Supabase Dashboard → Database → Webhooks:**

Create webhook:
- Name: `new-report-alert`
- Table: `reports`
- Events: `INSERT`
- URL: `https://your-backend.com/api/webhooks/new-report`
- Method: `POST`

**2. Handle webhook in backend:**

```python
# backend/app/api/webhooks.py
@router.post("/webhooks/new-report")
async def handle_new_report(payload: dict):
    report_data = payload['record']
    
    # Trigger alert system
    # Send SMS notifications
    # Update incident clustering
    
    return {"status": "processed"}
```

---

## Performance Tips

1. **Use connection pooling** - Supabase provides this by default
2. **Add database indexes** - For frequently queried columns
3. **Optimize queries** - Use `.select()` to fetch only needed columns
4. **Cache frequently accessed data** - Use Redis
5. **Use RPC functions** - For complex queries

---

## Cost Considerations

Supabase Free Tier includes:
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

For production, consider:
- **Pro Plan** ($25/month) - 8GB database, 100GB storage
- **Pay-as-you-go** - Scale as needed

---

## Next Steps

- [ ] Choose which features to enable
- [ ] Update `.env` with feature flags
- [ ] Test each feature in development
- [ ] Deploy to production
- [ ] Monitor usage in Supabase Dashboard

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
