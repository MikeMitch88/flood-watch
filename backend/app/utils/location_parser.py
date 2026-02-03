"""
Location parsing utilities for extracting coordinates from various formats
"""
import re
import requests
from typing import Optional, Tuple
from app.config import get_settings

settings = get_settings()


def parse_plus_code(text: str) -> Optional[Tuple[float, float]]:
    """
    Extract coordinates from Google Plus Codes
    
    Supports formats:
    - PV7V+R2V Nairobi (8-character code with locality)
    - PV7V+R2V (8-character code)
    - 6GCRMQGP+7Q (full 10-character global code)
    
    Uses Google Maps Geocoding API to decode Plus Codes
    """
    # Pattern for Plus Codes: 4-8 alphanumeric chars + "+" + 2-3 alphanumeric chars
    plus_code_pattern = r'\b([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})\b'
    match = re.search(plus_code_pattern, text.upper())
    
    if match:
        plus_code = match.group(1)
        
        # Extract locality if present (text after the plus code)
        locality = ""
        remaining_text = text[match.end():].strip()
        if remaining_text:
            # Take first word/phrase as locality
            locality = remaining_text.split('\n')[0].strip()
        
        try:
            # Use Nominatim to geocode the plus code + locality
            # Plus codes can be geocoded as addresses
            search_query = f"{plus_code} {locality}".strip()
            
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': search_query,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': 'FloodWatch/1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    lat = float(data[0]['lat'])
                    lon = float(data[0]['lon'])
                    print(f"Decoded Plus Code {plus_code} to: {lat}, {lon}")
                    return (lat, lon)
            
            # Fallback: Try Google Maps Geocoding API if available
            if settings.GOOGLE_MAPS_API_KEY:
                gmaps_url = "https://maps.googleapis.com/maps/api/geocode/json"
                gmaps_params = {
                    'address': search_query,
                    'key': settings.GOOGLE_MAPS_API_KEY
                }
                
                gmaps_response = requests.get(gmaps_url, params=gmaps_params, timeout=5)
                if gmaps_response.status_code == 200:
                    gmaps_data = gmaps_response.json()
                    if gmaps_data.get('results'):
                        location = gmaps_data['results'][0]['geometry']['location']
                        lat = float(location['lat'])
                        lon = float(location['lng'])
                        print(f"Decoded Plus Code {plus_code} via Google Maps to: {lat}, {lon}")
                        return (lat, lon)
                        
        except Exception as e:
            print(f"Error decoding Plus Code: {e}")
    
    return None


def parse_google_maps_link(text: str) -> Optional[Tuple[float, float]]:
    """
    Extract coordinates from Google Maps links
    
    Supports formats:
    - https://maps.app.goo.gl/xxxxx (short link)
    - https://www.google.com/maps?q=-1.286389,36.817223
    - https://www.google.com/maps/@-1.286389,36.817223,15z
    - https://www.google.com/maps/place/-1.285380,36.892529/
    - https://maps.google.com/?q=-1.286389,36.817223
    - https://goo.gl/maps/xxxxx (legacy short link)
    """
    
    # Pattern 1: /place/ format - e.g., /place/-1.285380,36.892529/
    place_pattern = r'/place/(-?\d+\.?\d*),(-?\d+\.?\d*)'
    match = re.search(place_pattern, text)
    if match:
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                print(f"Extracted coordinates from /place/ URL: {lat}, {lon}")
                return (lat, lon)
        except ValueError:
            pass
    
    # Pattern 2: Query parameters - e.g., ?q=-1.286389,36.817223 or @-1.286389,36.817223
    coord_pattern = r'[@?q=](-?\d+\.?\d*),\s*(-?\d+\.?\d*)'
    match = re.search(coord_pattern, text)
    if match:
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                print(f"Extracted coordinates from URL parameters: {lat}, {lon}")
                return (lat, lon)
        except ValueError:
            pass
    
    # Pattern 3: Short links - need to follow redirect
    short_link_patterns = [
        r'https://maps\.app\.goo\.gl/[\w-]+',
        r'https://goo\.gl/maps/[\w-]+'
    ]
    
    for pattern in short_link_patterns:
        match = re.search(pattern, text)
        if match:
            try:
                print(f"Following short link: {match.group(0)}")
                # Follow redirect to get full URL
                response = requests.get(
                    match.group(0), 
                    allow_redirects=True, 
                    timeout=10,
                    headers={'User-Agent': 'FloodWatch/1.0'}
                )
                full_url = response.url
                print(f"Redirected to: {full_url}")
                
                # Recursively parse the redirected URL using this same function
                coords = parse_google_maps_link(full_url)
                if coords:
                    return coords
                
                # Try to extract Plus Code from redirected URL
                plus_code_result = parse_plus_code(full_url)
                if plus_code_result:
                    return plus_code_result
                    
            except Exception as e:
                print(f"Error following Google Maps short link: {e}")
                import traceback
                traceback.print_exc()
    
    return None



def parse_coordinates(text: str) -> Optional[Tuple[float, float]]:
    """
    Parse coordinates from text in format: "latitude, longitude"
    Examples: "-1.286389, 36.817223" or "-1.286389,36.817223"
    """
    # Pattern: two numbers separated by comma
    pattern = r'(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)'
    match = re.search(pattern, text)
    
    if match:
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            
            # Validate coordinates
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return (lat, lon)
        except ValueError:
            pass
    
    return None


def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Convert text address to coordinates using Nominatim (OpenStreetMap)
    Free geocoding service, no API key required
    """
    try:
        # Use Nominatim API (free, no key required)
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': address,
            'format': 'json',
            'limit': 1
        }
        headers = {
            'User-Agent': 'FloodWatch/1.0'  # Required by Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                return (lat, lon)
    
    except Exception as e:
        print(f"Error geocoding address: {e}")
    
    return None


def extract_location(text: str) -> Optional[Tuple[float, float]]:
    """
    Main function to extract location from any text format
    
    Tries in order:
    1. Google Maps links (including short links)
    2. Plus Codes (e.g., PV7V+R2V Nairobi)
    3. Direct coordinates
    4. Text address (geocoding)
    
    Returns: (latitude, longitude) or None
    """
    
    # Try Google Maps link first (handles short links and coordinates in URLs)
    coords = parse_google_maps_link(text)
    if coords:
        print(f"Extracted coordinates from Google Maps link: {coords}")
        return coords
    
    # Try Plus Code parsing
    coords = parse_plus_code(text)
    if coords:
        print(f"Extracted coordinates from Plus Code: {coords}")
        return coords
    
    # Try direct coordinates
    coords = parse_coordinates(text)
    if coords:
        print(f"Extracted coordinates from text: {coords}")
        return coords
    
    # Try geocoding as address
    coords = geocode_address(text)
    if coords:
        print(f"Geocoded address to coordinates: {coords}")
        return coords
    
    print(f"Could not extract location from: {text}")
    return None

