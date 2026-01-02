# Supabase Connection Test & Migration Guide

## Current Status
✅ Supabase credentials configured in `.env`  
✅ Python virtual environment created  
✅ Basic dependencies installed  

## Next Steps to Verify & Run

### Step 1: Test Supabase Connection

Open a new terminal and run:

```bash
cd d:\MICHAEL_projects_BUCKUPS\flood-watch\backend
.\venv\Scripts\Activate.ps1
python test_supabase_connection.py
```

**Expected Output:**
```
📡 Testing connection to database...
✅ SUCCESS! Connected to PostgreSQL
✅ PostGIS is available!
🎉 Supabase connection verified successfully!
```

**If you see an error about PostGIS:**
1. Go to your Supabase dashboard: https://app.supabase.com
2. Open SQL Editor
3. Run: `CREATE EXTENSION IF NOT EXISTS postgis;`
4. Try the test again

### Step 2: Install All Dependencies

```bash
cd d:\MICHAEL_projects_BUCKUPS\flood-watch\backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

This will install all packages including FastAPI, Alembic, and the Supabase client.

### Step 3: Run Database Migrations

Create all tables in your Supabase database:

```bash
# Still in backend directory with venv activated
alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Running upgrade -> abc123, Initial schema
INFO [alembic.runtime.migration] Running upgrade abc123 -> def456, Add reports table
...
```

### Step 4: Create Admin User

```bash
# Start Python shell
python

# In Python shell, run:
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

Press `Ctrl+Z` then `Enter` to exit Python shell.

### Step 5: Start the Backend Server

```bash
# Still in backend directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 6: Test the API

Open your browser and go to:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

You should see the Swagger UI with all your API endpoints!

### Step 7: Test Authentication

In the browser at http://localhost:8000/docs:

1. Find the `/api/auth/login` endpoint
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Click "Execute"
5. You should get an `access_token` back!

---

## Troubleshooting

### Connection Error
- Check your DATABASE_URL in `.env` matches your Supabase connection string
- Verify your password is correct (no spaces or special characters that need escaping)
- Make sure your Supabase project is not paused (free tier pauses after 7 days of inactivity)

### PostGIS Not Available
Run in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_version();  -- Should return a version number
```

### Import Errors
```bash
pip install -r requirements.txt
```

### Port Already in Use
Change the port:
```bash
uvicorn app.main:app --reload --port 8001
```

---

## What's Next

Once everything is working:

1. ✅ Backend running on port 8000
2. ✅ Database connected to Supabase
3. ✅ Migrations completed
4. ✅ Admin user created

You're ready to:
- Set up WhatsApp/Telegram bot integrations
- Build the frontend dashboard
- Deploy to production

## Notes

- **Without Docker**: You're running the backend directly with Python. You'll need to start Redis and RabbitMQ separately if you want to use those features.
- **Frontend**: To run the frontend, you'll need Node.js installed and run `npm install` and `npm run dev` in the `frontend` directory.
- **Production**: For production deployment, Docker is recommended for easier management.

---

**Need Docker?**  
If you want to use Docker later, download Docker Desktop from:  
https://www.docker.com/products/docker-desktop/

Then you can use the docker-compose commands from the README.
