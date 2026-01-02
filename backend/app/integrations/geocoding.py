import requests
from typing import Optional, Tuple, Dict
from app.config import get_settings

settings = get_settings()


class GeocodingService:
    """Handle location parsing and reverse geocoding"""
    
    def __init__(self):
        self.nominatim_url = "https://nominatim.openstreetmap.org"
        self.headers = {
            'User-Agent': 'FloodWatch/1.0'
        }
    
    def parse_location(self, location_data: Dict) -> Optional[Tuple[float, float]]:
        """Parse location from various formats"""
        # WhatsApp/Telegram location object
        if 'latitude' in location_data and 'longitude' in location_data:
            return (location_data['latitude'], location_data['longitude'])
        
        # Simple lat/lon dict
        if 'lat' in location_data and 'lon' in location_data:
            return (location_data['lat'], location_data['lon'])
        
        return None
    
    def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        """Convert coordinates to human-readable address"""
        try:
            response = requests.get(
                f"{self.nominatim_url}/reverse",
                params={
                    'lat': lat,
                    'lon': lon,
                    'format': 'json',
                    'addressdetails': 1
                },
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('display_name')
            
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return f"{lat}, {lon}"  # Fallback to coordinates
    
    def geocode_address(self, address: str) -> Optional[Tuple[float, float]]:
        """Convert address to coordinates"""
        try:
            response = requests.get(
                f"{self.nominatim_url}/search",
                params={
                    'q': address,
                    'format': 'json',
                    'limit': 1
                },
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    return (float(data[0]['lat']), float(data[0]['lon']))
            
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    def validate_coordinates(self, lat: float, lon: float) -> bool:
        """Validate latitude and longitude"""
        return -90 <= lat <= 90 and -180 <= lon <= 180


# Global instance
geocoding = GeocodingService()
