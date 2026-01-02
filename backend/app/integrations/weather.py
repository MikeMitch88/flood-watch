import requests
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from app.config import get_settings

settings = get_settings()


class WeatherService:
    """Integration with OpenWeatherMap API for weather data correlation"""
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.enabled = bool(self.api_key)
    
    def get_current_weather(self, lat: float, lon: float) -> Optional[Dict]:
        """Get current weather conditions at location"""
        if not self.enabled:
            return self._mock_weather_data(lat, lon)
        
        try:
            response = requests.get(
                f"{self.base_url}/weather",
                params={
                    'lat': lat,
                    'lon': lon,
                    'appid': self.api_key,
                    'units': 'metric'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_current_weather(data)
            
        except Exception as e:
            print(f"Weather API error: {e}")
        
        return None
    
    def get_rainfall_last_24h(self, lat: float, lon: float) -> Optional[float]:
        """Get rainfall amount in last 24 hours (mm)"""
        if not self.enabled:
            # Mock data for development
            return 15.5
        
        try:
            # OpenWeatherMap doesn't provide historical data in free tier
            # In production, use historical API or accumulate real-time data
            
            current = self.get_current_weather(lat, lon)
            if current:
                return current.get('rainfall_1h', 0) * 24  # Rough estimate
            
        except Exception as e:
            print(f"Rainfall API error: {e}")
        
        return None
    
    def check_weather_alerts(self, lat: float, lon: float) -> list:
        """Check for active weather alerts in area"""
        if not self.enabled:
            return []
        
        try:
            response = requests.get(
                f"{self.base_url}/onecall",
                params={
                    'lat': lat,
                    'lon': lon,
                    'appid': self.api_key,
                    'exclude': 'minutely,hourly,daily'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('alerts', [])
            
        except Exception as e:
            print(f"Weather alerts API error: {e}")
        
        return []
    
    def calculate_flood_risk_score(self, lat: float, lon: float) -> float:
        """
        Calculate flood risk score based on weather conditions
        
        Returns: 0.0 - 1.0 (0 = no risk, 1 = high risk)
        """
        current = self.get_current_weather(lat, lon)
        
        if not current:
            return 0.0
        
        score = 0.0
        
        # Rainfall contribution (0-0.5)
        rainfall = current.get('rainfall_1h', 0)
        if rainfall > 50:
            score += 0.5
        elif rainfall > 20:
            score += 0.3
        elif rainfall > 10:
            score += 0.2
        elif rainfall > 5:
            score += 0.1
        
        # Humidity contribution (0-0.2)
        humidity = current.get('humidity', 0)
        if humidity > 90:
            score += 0.2
        elif humidity > 80:
            score += 0.1
        
        # Clouds contribution (0-0.1)
        clouds = current.get('clouds', 0)
        if clouds > 80:
            score += 0.1
        
        # Weather alerts contribution (0-0.2)
        alerts = self.check_weather_alerts(lat, lon)
        if any('flood' in a.get('event', '').lower() for a in alerts):
            score += 0.2
        
        return min(1.0, score)
    
    def correlate_with_report(self, lat: float, lon: float, severity: str) -> Dict:
        """
        Correlate weather data with flood report
        
        Returns correlation data and confidence score
        """
        current = self.get_current_weather(lat, lon)
        rainfall_24h = self.get_rainfall_last_24h(lat, lon)
        risk_score = self.calculate_flood_risk_score(lat, lon)
        
        # Severity thresholds for correlation
        severity_thresholds = {
            'low': 0.2,
            'medium': 0.4,
            'high': 0.6,
            'critical': 0.8
        }
        
        expected_risk = severity_thresholds.get(severity.lower(), 0.5)
        
        # Calculate correlation confidence
        # If weather risk matches reported severity, higher confidence
        risk_diff = abs(risk_score - expected_risk)
        correlation_confidence = max(0.0, 1.0 - risk_diff)
        
        return {
            'weather_data': current,
            'rainfall_24h': rainfall_24h,
            'risk_score': risk_score,
            'expected_risk': expected_risk,
            'correlation_confidence': correlation_confidence,
            'supports_report': correlation_confidence > 0.5
        }
    
    def _parse_current_weather(self, data: Dict) -> Dict:
        """Parse OpenWeatherMap response"""
        return {
            'temperature': data.get('main', {}).get('temp'),
            'humidity': data.get('main', {}).get('humidity'),
            'pressure': data.get('main', {}).get('pressure'),
            'clouds': data.get('clouds', {}).get('all'),
            'rainfall_1h': data.get('rain', {}).get('1h', 0),
            'rainfall_3h': data.get('rain', {}).get('3h', 0),
            'weather_main': data.get('weather', [{}])[0].get('main'),
            'weather_description': data.get('weather', [{}])[0].get('description'),
            'wind_speed': data.get('wind', {}).get('speed'),
            'timestamp': datetime.utcfromtimestamp(data.get('dt'))
        }
    
    def _mock_weather_data(self, lat: float, lon: float) -> Dict:
        """Mock weather data for development"""
        return {
            'temperature': 25.0,
            'humidity': 85,
            'pressure': 1013,
            'clouds': 75,
            'rainfall_1h': 12.5,
            'rainfall_3h': 25.0,
            'weather_main': 'Rain',
            'weather_description': 'heavy intensity rain',
            'wind_speed': 5.5,
            'timestamp': datetime.utcnow()
        }


# Global instance
weather_service = WeatherService()
