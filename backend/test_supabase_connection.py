"""
Test script to verify Supabase connection
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

def test_connection():
    """Test database connection"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        return False
    
    print(f"📡 Testing connection to database...")
    print(f"   Using: {database_url.split('@')[1] if '@' in database_url else 'unknown'}")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            # Test basic query
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"\n✅ SUCCESS! Connected to PostgreSQL")
            print(f"   Version: {version[:50]}...")
            
            # Test PostGIS
            try:
                result = conn.execute(text("SELECT PostGIS_version();"))
                postgis_version = result.fetchone()[0]
                print(f"✅ PostGIS is available!")
                print(f"   Version: {postgis_version}")
            except Exception as e:
                print(f"⚠️  WARNING: PostGIS not available")
                print(f"   Error: {str(e)}")
                print(f"\n   To fix: Run this in Supabase SQL Editor:")
                print(f"   CREATE EXTENSION IF NOT EXISTS postgis;")
                return False
            
            print(f"\n🎉 Supabase connection verified successfully!")
            return True
            
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED")
        print(f"   Error: {str(e)}")
        print(f"\nTroubleshooting:")
        print(f"1. Check your DATABASE_URL in .env")
        print(f"2. Verify your Supabase password is correct")
        print(f"3. Make sure your Supabase project is running")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
