import os
import sys
import logging
from dotenv import load_dotenv

# Ensure we're running from the backend directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.database import SessionLocal
from app.services.early_warning_service import EarlyWarningService

logging.basicConfig(level=logging.INFO, format='%(message)s')

if __name__ == "__main__":
    print("FORCING AN EARLY WARNING TRIGGER FOR DASHBOARD TESTING...")
    
    db = SessionLocal()
    try:
        # We manually pass a high rainfall amount (150mm) to bypass the weather check 
        # and force the system to trigger the alert for Budalangi
        fake_hotspot = {"name": "Budalangi", "lat": 0.1333, "lon": 34.0333}
        
        EarlyWarningService._trigger_warning(db, fake_hotspot, rainfall=150.5)
        
        print("\n✅ SUCCESS! A proactive 'Code Red' Early Warning has been injected into your database.")
        print("Go to your Dashboard now to see it!")
    except Exception as e:
        print(f"Error forcing trigger: {e}")
    finally:
        db.close()
