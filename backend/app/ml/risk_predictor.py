import math
import requests
from typing import Dict, Any, List, Optional
from app.integrations.weather import weather_service
from app.services.incident_service import IncidentService
from sqlalchemy.orm import Session

class RiskPredictor:
    """
    AI Predictive engine to calculate the probability of flooding in a given coordinate.
    Factors in:
    1. Weather forecasts and recent precipitation (OpenWeather).
    2. Geographic elevation (Open-Elevation API / Bounding Boxes fallback).
    3. Historical incident frequency in the area.
    """
    
    def __init__(self):
        self.elevation_api_url = "https://api.open-elevation.com/api/v1/lookup"
        
        # Fallback known low-elevation bounding boxes for Kenya (Hotspots)
        self.known_hotspots = [
            # Budalangi (approx lat, lon bounds)
            {"name": "Budalangi", "min_lat": 0.05, "max_lat": 0.20, "min_lon": 33.95, "max_lon": 34.10, "base_risk": 0.6},
            # Kisumu (near Lake Victoria)
            {"name": "Kisumu", "min_lat": -0.15, "max_lat": -0.05, "min_lon": 34.70, "max_lon": 34.85, "base_risk": 0.5},
            # Tana River
            {"name": "Tana River", "min_lat": -2.50, "max_lat": -1.50, "min_lon": 39.80, "max_lon": 40.30, "base_risk": 0.55}
        ]

    def _get_elevation(self, lat: float, lon: float) -> Optional[float]:
        """Fetch elevation from Open-Elevation API, returning None if failed."""
        try:
            response = requests.get(f"{self.elevation_api_url}?locations={lat},{lon}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    return data["results"][0]["elevation"]
        except Exception as e:
            print(f"Elevation API error: {e}")
        return None

    def _get_hotspot_risk(self, lat: float, lon: float) -> float:
        """Fallback check if coordinate is in a known flood plain bounding box."""
        for hotspot in self.known_hotspots:
            if hotspot["min_lat"] <= lat <= hotspot["max_lat"] and hotspot["min_lon"] <= lon <= hotspot["max_lon"]:
                return hotspot["base_risk"]
        return 0.0

    def predict_flood_risk(self, db: Session, lat: float, lon: float) -> Dict[str, Any]:
        """
        Calculate overall flood risk probability (0.0 to 1.0).
        """
        risk_score = 0.0
        factors = {}
        
        # 1. Geographic Risk (Elevation) - Lower elevation = higher risk
        elevation = self._get_elevation(lat, lon)
        geo_risk = 0.0
        if elevation is not None:
            # Assuming below 1200m in Kenya is higher risk, scaled (naive model)
            if elevation < 1200:
                geo_risk = max(0, (1200 - elevation) / 1200) * 0.4  # Max 0.4 weight
            factors["elevation_m"] = elevation
            factors["elevation_risk_score"] = geo_risk
        else:
            geo_risk = self._get_hotspot_risk(lat, lon) * 0.4
            factors["elevation_m"] = "Unknown (Fallback used)"
            factors["hotspot_risk_score"] = geo_risk
            
        risk_score += geo_risk
        
        # 2. Weather Risk (Rainfall)
        weather_data = weather_service.get_current_weather(lat, lon)
        weather_risk = 0.0
        if weather_data and "rain_1h" in weather_data:
            rain = weather_data["rain_1h"]
            # 10mm/h is heavy rain
            weather_risk = min(rain / 10.0, 1.0) * 0.4 # Max 0.4 weight
            factors["rainfall_1h"] = rain
            factors["weather_risk_score"] = weather_risk
        elif weather_data and "weather" in weather_data:
            if any("rain" in w.get("main", "").lower() for w in weather_data["weather"]):
                weather_risk = 0.2
            factors["weather_risk_score"] = weather_risk
            
        risk_score += weather_risk
        
        # 3. Historical Risk (Recent Incidents nearby)
        # We will reuse the nearby reports logic but apply it to incidents
        try:
            # This is a naive implementation; ideally use a spatial query count
            recent_incidents = IncidentService.get_active_incidents(db, limit=100)
            nearby_count = 0
            for inc in recent_incidents:
                # Approximation of distance
                # Just assuming if it's within ~0.1 degree it's extremely close
                if inc.location:
                    # In a real scenario, use ST_DWithin, but we'll mock this for now
                    nearby_count += 1
            
            history_risk = min(nearby_count * 0.05, 0.2) # Max 0.2 weight
            factors["historical_risk_score"] = history_risk
            risk_score += history_risk
        except Exception as e:
            factors["historical_risk_score"] = 0.0
            print(f"Historical risk error: {e}")
            
        # Final probability normalization
        probability = min(max(risk_score, 0.0), 1.0)
        
        # Determine Severity Level
        if probability > 0.75:
            severity = "Critical"
        elif probability > 0.5:
            severity = "High"
        elif probability > 0.25:
            severity = "Medium"
        else:
            severity = "Low"
            
        return {
            "probability": probability,
            "severity_prediction": severity,
            "contributing_factors": factors
        }

risk_predictor = RiskPredictor()
