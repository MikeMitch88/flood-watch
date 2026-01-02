# Supabase Setup Guide for Flood Watch

This guide will walk you through setting up Supabase as the database for the Flood Watch project.

## Why Supabase?

Supabase provides:
- **PostgreSQL with PostGIS** - Full geospatial support for flood tracking
- **Built-in Authentication** - Optional replacement for custom JWT
- **Storage** - File storage for report images/videos
- **Realtime** - Live updates for flood alerts
- **Free Tier** - Great for development and small deployments
- **Managed Infrastructure** - No database maintenance needed

---

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
   - Choose a project name (e.g., "flood-watch")
   - Set a secure database password (save this!)
   - Select a region close to your users
   - Wait for project creation (~2 minutes)

---

## Step 2: Enable PostGIS Extension

**CRITICAL**: Flood Watch requires the PostGIS extension for geospatial features.

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Run this SQL:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify installation
SELECT PostGIS_version();
```

4. You should see a version number (e.g., "3.3.2")

---

## Step 3: Get Your Connection Credentials

### Database Connection String

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection String**
3. Select **URI** format
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password

### API Keys (for optional features)

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon/public key**: For client-side operations
   - **service_role key**: For server-side admin operations (keep secret!)

---

## Step 4: Configure Environment Variables

Update your `.env` file with Supabase credentials:

```bash
# Database - Use your Supabase connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project-ref.supabase.co:5432/postgres

# Supabase Optional Features
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Feature Flags (enable as needed)
USE_SUPABASE_AUTH=false      # Set to true to use Supabase Auth
USE_SUPABASE_STORAGE=false   # Set to true to use Supabase Storage
USE_SUPABASE_REALTIME=false  # Set to true for live updates
```

---

## Step 5: Run Database Migrations

Run Alembic migrations to create tables in Supabase:

```bash
# Using docker-compose
docker-compose up -d
docker-compose exec backend alembic upgrade head

# OR using local Python
cd backend
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade -> abc123, Initial schema
INFO  [alembic.runtime.migration] Running upgrade abc123 -> def456, Add reports table
...
```

---

## Step 6: Start the Application

### Option A: Using Supabase-Only Docker Compose

```bash
# Use the Supabase-optimized compose file (no local PostgreSQL)
docker-compose -f docker-compose.supabase.yml up -d

# Check logs
docker-compose -f docker-compose.supabase.yml logs -f backend
```

### Option B: Using Standard Docker Compose (with Supabase)

```bash
# Start without local PostgreSQL (DATABASE_URL in .env points to Supabase)
docker-compose up -d

# Or if you want local PostgreSQL for some reason:
docker-compose --profile local-db up -d
```

---

## Step 7: Verify Connection

Test the database connection:

```bash
# Access backend container
docker-compose exec backend bash

# Test connection
python -c "from app.database import engine; print('✅ Connected to Supabase!' if engine.connect() else '❌ Connection failed')"

# Test PostGIS
python -c "from app.database import engine; print(engine.execute('SELECT PostGIS_version();').fetchone())"
```

---

## Step 8: Create Initial Admin User

```bash
# Access backend container
docker-compose exec backend python

# In Python shell:
from app.database import SessionLocal, init_db
from app.auth import get_password_hash
from app.models import AdminUser, UserRole

init_db()
db = SessionLocal()

admin = AdminUser(
    username="admin",
    email="admin@floodwatch.org",
    password_hash=get_password_hash("admin123"),
    role=UserRole.ADMIN
)

db.add(admin)
db.commit()
print(f"✅ Admin user created: {admin.username}")
```

---

## Optional: Enable Supabase Features

### Supabase Authentication

Instead of custom JWT, use Supabase Auth:

1. Set `USE_SUPABASE_AUTH=true` in `.env`
2. Configure auth providers in Supabase Dashboard → **Authentication** → **Providers**
3. Update your authentication logic to use `supabase_client.py`

### Supabase Storage

Instead of AWS S3, use Supabase Storage:

1. Create a storage bucket in Supabase Dashboard → **Storage**
   - Bucket name: `flood-reports`
   - Make it public or private as needed
2. Set `USE_SUPABASE_STORAGE=true` in `.env`
3. Upload files using `upload_to_supabase_storage()` from `supabase_client.py`

### Supabase Realtime

Enable live updates for flood alerts:

1. Set `USE_SUPABASE_REALTIME=true` in `.env`
2. In Supabase Dashboard → **Database** → **Replication**, enable realtime for tables:
   - `reports`
   - `incidents`
   - `alerts`
3. Use `subscribe_to_changes()` from `supabase_client.py` to listen for updates

---

## Connection Pooling (Production)

For production, use Supabase's connection pooler:

```bash
# Transaction mode (recommended for most apps)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres

# Session mode (for frameworks that need session-level features)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Update this in `.env.production`.

---

## Troubleshooting

### Connection Refused

- Check your database password is correct
- Verify your IP is allowed (Supabase allows all by default)
- Check the PROJECT-REF in the connection string

### PostGIS Functions Not Found

```sql
-- Re-enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Migration Errors

```bash
# Reset migrations (WARNING: drops all data)
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head
```

### Slow Queries

- Enable connection pooling (see above)
- Add indexes in Supabase SQL Editor
- Check Query Performance in Supabase Dashboard

---

## Migrating from Local PostgreSQL

If you have existing data in local PostgreSQL:

```bash
# 1. Dump local database
docker-compose exec postgres pg_dump -U floodwatch floodwatch > backup.sql

# 2. Restore to Supabase (from your local machine)
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
```

---

## Monitoring

Monitor your database in the Supabase Dashboard:

- **Database** → **Database** - live query performance
- **Database** → **Tables** - browse data
- **Storage** → **Usage** - storage metrics
- **Reports** - weekly email reports

---

## Security Best Practices

1. **Never commit** `.env` files with real credentials
2. **Use service_role key** only server-side (never in frontend)
3. **Enable Row Level Security (RLS)** for multi-tenant data
4. **Rotate passwords** regularly
5. **Enable 2FA** on your Supabase account

---

## Next Steps

- ✅ Database is set up with Supabase
- 📱 Continue with [Bot Integration](BOTS.md)
- 🤖 Set up [AI Model](../backend/app/ml/README.md)
- 🎨 Build [Admin Dashboard](../frontend/README.md)
- 🚀 Deploy to production

---

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **PostGIS Docs**: [postgis.net/docs](https://postgis.net/docs)
- **Project Issues**: [GitHub Issues](https://github.com/yourusername/flood-watch/issues)
