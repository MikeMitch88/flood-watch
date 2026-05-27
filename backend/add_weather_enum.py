import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL found in .env")
    sys.exit(1)

print(f"Connecting to {db_url.split('@')[-1]}...")
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Connected to database.")
    
    # Add new enum values to verificationtype
    try:
        conn.execute(text("ALTER TYPE verificationtype ADD VALUE IF NOT EXISTS 'weather';"))
        conn.execute(text("ALTER TYPE verificationtype ADD VALUE IF NOT EXISTS 'WEATHER';"))
        print("Successfully updated verificationtype ENUM.")
    except Exception as e:
        print(f"Enum update verificationtype skipped or failed: {e}")

    # Add any missing values to verificationresult
    try:
        conn.execute(text("ALTER TYPE verificationresult ADD VALUE IF NOT EXISTS 'uncertain';"))
        conn.execute(text("ALTER TYPE verificationresult ADD VALUE IF NOT EXISTS 'UNCERTAIN';"))
        print("Successfully updated verificationresult ENUM.")
    except Exception as e:
        print(f"Enum update verificationresult skipped or failed: {e}")

    conn.commit()
    print("Database schema successfully synchronized!")
