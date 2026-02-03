"""
Quick database connection test
"""
import sys
sys.path.append('.')

try:
    from app.database import engine
    from sqlalchemy import text
    
    print("Testing database connection...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        print(f"Result: {result.fetchone()}")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    import traceback
    traceback.print_exc()
