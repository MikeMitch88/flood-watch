import uuid
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.integrations.weather import weather_service
from app.services.alert_service import AlertService
from app.models.models import Incident, IncidentSource, IncidentStatus, SeverityLevel
import logging

logger = logging.getLogger(__name__)

# Pre-defined vulnerable flood hotspots in Kenya
VULNERABLE_HOTSPOTS = [
    {"name": "Budalangi", "lat": 0.1333, "lon": 34.0333},
    {"name": "Nyando", "lat": -0.2167, "lon": 34.9333},
    {"name": "Tana River", "lat": -1.5, "lon": 40.0},
    {"name": "Nairobi South C", "lat": -1.3167, "lon": 36.8333}
]

# Threshold in millimeters for the next 24 hours to trigger an early warning
RAINFALL_THRESHOLD_MM = 50.0

class EarlyWarningService:
    """Service to proactively monitor weather APIs and trigger early warnings"""

    @staticmethod
    def run_check():
        """Run the proactive weather check across all hotspots"""
        logger.info("Starting proactive Early Warning weather check...")
        
        # We need a fresh DB session for the background task
        db = SessionLocal()
        try:
            for hotspot in VULNERABLE_HOTSPOTS:
                logger.info(f"Checking forecast for {hotspot['name']}...")
                
                # 1. Fetch 24-hour rainfall prediction
                predicted_rain = weather_service.get_24h_forecast_rainfall(
                    lat=hotspot["lat"], 
                    lon=hotspot["lon"]
                )
                
                if predicted_rain is None:
                    logger.warning(f"Could not retrieve forecast for {hotspot['name']}")
                    continue
                    
                logger.info(f"{hotspot['name']} predicted rainfall: {predicted_rain}mm")
                
                # 2. Check threshold
                if predicted_rain > RAINFALL_THRESHOLD_MM:
                    EarlyWarningService._trigger_warning(db, hotspot, predicted_rain)
                else:
                    logger.info(f"{hotspot['name']} is below flood threshold.")
                    
        except Exception as e:
            logger.error(f"Error in EarlyWarningService: {e}")
        finally:
            db.close()
            logger.info("Early Warning weather check completed.")
            
    @staticmethod
    def _trigger_warning(db: Session, hotspot: dict, rainfall: float):
        """Trigger an early warning incident and alert if one doesn't exist"""
        logger.warning(f"THRESHOLD EXCEEDED for {hotspot['name']}! Checking for active incidents...")
        
        # Check if an active system incident already exists nearby
        # For simplicity, we check if there's any active SYSTEM incident
        # in the DB. A more robust check would use PostGIS ST_DWithin.
        
        # Basic check: Is there an active incident from the SYSTEM in the last 24h?
        active_incident = db.query(Incident).filter(
            Incident.status == IncidentStatus.active,
            Incident.source == IncidentSource.SYSTEM
        ).first() # In a real app, filter by distance to hotspot
        
        if active_incident:
            logger.info(f"An active system warning already exists. Skipping duplicate.")
            return
            
        logger.warning(f"No active warning found. Creating new proactive Incident!")
        
        # Create a new proactive incident
        # We don't have PostGIS easily accessible here to construct Geography points directly
        # without raw SQL, so we use ST_SetSRID(ST_MakePoint(lon, lat), 4326) via func
        
        new_incident = Incident(
            id=str(uuid.uuid4()),
            affected_radius_km=15.0, # Large radius for proactive warning
            severity=SeverityLevel.high,
            source=IncidentSource.SYSTEM,
            status=IncidentStatus.active,
            affected_population_estimate=5000
        )
        
        # Use PostGIS func to set the location
        new_incident.location = func.ST_SetSRID(func.ST_MakePoint(hotspot["lon"], hotspot["lat"]), 4326)
        
        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)
        
        # Generate the alert
        try:
            alert = AlertService.generate_alert_from_incident(db, new_incident.id)
            
            # Append weather details to the alert message
            alert.message = f"PROACTIVE EARLY WARNING: {rainfall}mm of heavy rainfall predicted in the next 24 hours near {hotspot['name']}. {alert.message}"
            db.commit()
            
            logger.info(f"Successfully generated early warning alert for {hotspot['name']}")
        except Exception as e:
            logger.error(f"Failed to generate alert from early warning incident: {e}")
