import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
engine = create_engine(db_url)

with engine.connect() as conn:
    result = conn.execute(text("SELECT id, source, status, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lon FROM incidents WHERE source = 'SYSTEM';"))
    rows = result.fetchall()
    print("SYSTEM INCIDENTS:")
    for row in rows:
        print(dict(row._mapping))
