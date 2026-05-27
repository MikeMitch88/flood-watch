import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL found in .env")
    sys.exit(1)

print(f"Connecting to {db_url.split('@')[-1]}...")
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Connected to database.")
    
    # 1. Add new enum values to incidentsource
    try:
        conn.execute(text("ALTER TYPE incidentsource ADD VALUE IF NOT EXISTS 'warden';"))
        conn.execute(text("ALTER TYPE incidentsource ADD VALUE IF NOT EXISTS 'public_cluster';"))
        conn.execute(text("ALTER TYPE incidentsource ADD VALUE IF NOT EXISTS 'system';"))
        conn.execute(text("ALTER TYPE incidentsource ADD VALUE IF NOT EXISTS 'SYSTEM';"))
        print("Successfully updated incidentsource ENUM.")
    except Exception as e:
        print(f"Enum update incidentsource skipped or failed: {e}")

    # Print existing enum values to debug
    res = conn.execute(text("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'incidentsource'::regtype")).fetchall()
    print("incidentsource enum values:", [r[0] for r in res])

    # 2. Add new enum values to smsreportstatus (create type if not exists)
    try:
        # Check if type exists first
        res = conn.execute(text("SELECT 1 FROM pg_type WHERE typname = 'smsreportstatus'")).fetchone()
        if not res:
            conn.execute(text("CREATE TYPE smsreportstatus AS ENUM ('pending', 'clustered', 'verified', 'dismissed');"))
            print("Created smsreportstatus ENUM.")
        else:
            conn.execute(text("ALTER TYPE smsreportstatus ADD VALUE IF NOT EXISTS 'pending';"))
            conn.execute(text("ALTER TYPE smsreportstatus ADD VALUE IF NOT EXISTS 'clustered';"))
            conn.execute(text("ALTER TYPE smsreportstatus ADD VALUE IF NOT EXISTS 'verified';"))
            conn.execute(text("ALTER TYPE smsreportstatus ADD VALUE IF NOT EXISTS 'dismissed';"))
            print("Updated smsreportstatus ENUM.")
    except Exception as e:
        print(f"Enum update smsreportstatus skipped or failed: {e}")

    # Commit enum changes BEFORE using them as DEFAULT in ALTER TABLE
    conn.commit()

    # 3. Add missing columns to existing tables
    try:
        conn.execute(text("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source incidentsource DEFAULT 'SYSTEM';"))
        print("Successfully added 'source' column to incidents table.")
    except Exception as e:
        print(f"Failed to add 'source' column: {e}")
        try:
            conn.commit() # rollback any aborted transaction implicitly if needed by starting fresh
            # fallback
            conn.execute(text("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source incidentsource DEFAULT 'system';"))
            print("Added with 'system' default.")
        except Exception as e2:
            print(f"Failed fallback: {e2}")
        
    conn.commit()

# 4. Create missing tables
from app.models.models import Base
print("Creating any missing tables (like sms_reports, trusted_wardens)...")
Base.metadata.create_all(bind=engine)
print("Database schema successfully synchronized!")
