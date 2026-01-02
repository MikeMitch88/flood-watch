import requests
from typing import Dict, Any, List, Optional
from app.config import get_settings
from app.integrations.storage import storage

settings = get_settings()


class WhatsAppAPI:
    """WhatsApp Business API client"""
    
    def __init__(self):
        self.api_url = settings.WHATSAPP_API_URL
        self.api_key = settings.WHATSAPP_API_KEY
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.enabled = bool(self.api_url and self.api_key)
    
    def send_message(self, to: str, message: str) -> bool:
        """Send text message via WhatsApp"""
        if not self.enabled:
            print(f"[WhatsApp Dev Mode] Would send to {to}: {message}")
            return True
        
        try:
            response = requests.post(
                f"{self.api_url}/messages",
                headers={
                    "D360-API-KEY": self.api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "to": to,
                    "type": "text",
                    "text": {
                        "body": message
                    }
                },
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error sending WhatsApp message: {e}")
            return False
    
    def send_location(self, to: str, lat: float, lon: float, name: str = "", address: str = "") -> bool:
        """Send location via WhatsApp"""
        if not self.enabled:
            print(f"[WhatsApp Dev Mode] Would send location to {to}: {lat}, {lon}")
            return True
        
        try:
            response = requests.post(
                f"{self.api_url}/messages",
                headers={
                    "D360-API-KEY": self.api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "to": to,
                    "type": "location",
                    "location": {
                        "latitude": lat,
                        "longitude": lon,
                        "name": name,
                        "address": address
                    }
                },
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error sending WhatsApp location: {e}")
            return False
    
    def download_media(self, media_id: str) -> Optional[str]:
        """Download media file and upload to S3, return S3 URL"""
        if not self.enabled:
            return None
        
        try:
            # Get media URL
            response = requests.get(
               f"{self.api_url}/media/{media_id}",
                headers={"D360-API-KEY": self.api_key},
                timeout=10
            )
            
            if response.status_code == 200:
                media_data = response.json()
                media_url = media_data.get('url')
                
                if media_url:
                    # Download and upload to S3
                    s3_url = storage.upload_from_url(media_url, "image")
                    return s3_url
            
        except Exception as e:
            print(f"Error downloading WhatsApp media: {e}")
        
        return None
    
    def parse_webhook_message(self, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse incoming webhook message"""
        try:
            # WhatsApp Business API webhook structure
            entry = webhook_data.get('entry', [])[0]
            changes = entry.get('changes', [])[0]
            value = changes.get('value', {})
            
            messages = value.get('messages', [])
            if not messages:
                return None
            
            message = messages[0]
            
            # Extract message data
            parsed = {
                'user_id': message.get('from'),
                'message_id': message.get('id'),
                'timestamp': message.get('timestamp'),
                'type': message.get('type'),
                'text': None,
                'location': None,
                'media_urls': []
            }
            
            # Handle different message types
            if message['type'] == 'text':
                parsed['text'] = message.get('text', {}).get('body')
            
            elif message['type'] == 'location':
                location_data = message.get('location', {})
                parsed['location'] = {
                    'latitude': location_data.get('latitude'),
                    'longitude': location_data.get('longitude')
                }
            
            elif message['type'] == 'image':
                media_id = message.get('image', {}).get('id')
                if media_id:
                    media_url = self.download_media(media_id)
                    if media_url:
                        parsed['media_urls'].append(media_url)
            
            elif message['type'] == 'video':
                media_id = message.get('video', {}).get('id')
                if media_id:
                    media_url = self.download_media(media_id)
                    if media_url:
                        parsed['media_urls'].append(media_url)
            
            return parsed
            
        except Exception as e:
            print(f"Error parsing WhatsApp webhook: {e}")
            return None


# Global instance
whatsapp = WhatsAppAPI()
