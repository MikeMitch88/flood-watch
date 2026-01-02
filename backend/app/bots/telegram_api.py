import requests
from typing import Dict, Any, Optional
from app.config import get_settings
from app.integrations.storage import storage

settings = get_settings()


class TelegramAPI:
    """Telegram Bot API client"""
    
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None
        self.enabled = bool(self.bot_token)
    
    def send_message(self, chat_id: str, message: str, parse_mode: str = "Markdown") -> bool:
        """Send text message via Telegram"""
        if not self.enabled:
            print(f"[Telegram Dev Mode] Would send to {chat_id}: {message}")
            return True
        
        try:
            response = requests.post(
                f"{self.base_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": message,
                    "parse_mode": parse_mode
                },
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error sending Telegram message: {e}")
            return False
    
    def send_location(self, chat_id: str, lat: float, lon: float) -> bool:
        """Send location via Telegram"""
        if not self.enabled:
            print(f"[Telegram Dev Mode] Would send location to {chat_id}: {lat}, {lon}")
            return True
        
        try:
            response = requests.post(
                f"{self.base_url}/sendLocation",
                json={
                    "chat_id": chat_id,
                    "latitude": lat,
                    "longitude": lon
                },
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error sending Telegram location: {e}")
            return False
    
    def download_file(self, file_id: str) -> Optional[str]:
        """Download file and upload to S3, return S3 URL"""
        if not self.enabled:
            return None
        
        try:
            # Get file path
            response = requests.get(
                f"{self.base_url}/getFile",
                params={"file_id": file_id},
                timeout=10
            )
            
            if response.status_code == 200:
                file_data = response.json()
                file_path = file_data.get('result', {}).get('file_path')
                
                if file_path:
                    file_url = f"https://api.telegram.org/file/bot{self.bot_token}/{file_path}"
                    
                    # Upload to S3
                    s3_url = storage.upload_from_url(file_url, "image")
                    return s3_url
            
        except Exception as e:
            print(f"Error downloading Telegram file: {e}")
        
        return None
    
    def set_webhook(self, webhook_url: str) -> bool:
        """Set webhook URL for bot"""
        if not self.enabled:
            print(f"[Telegram Dev Mode] Would set webhook to {webhook_url}")
            return True
        
        try:
            response = requests.post(
                f"{self.base_url}/setWebhook",
                json={"url": webhook_url},
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error setting Telegram webhook: {e}")
            return False
    
    def parse_webhook_update(self, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse incoming webhook update"""
        try:
            message = update_data.get('message', {})
            
            if not message:
                return None
            
            # Extract message data
            parsed = {
                'user_id': str(message.get('chat', {}).get('id')),
                'username': message.get('from', {}).get('username'),
                'message_id': message.get('message_id'),
                'timestamp': message.get('date'),
                'text': message.get('text'),
                'location': None,
                'media_urls': []
            }
            
            # Handle location
            if 'location' in message:
                parsed['location'] = {
                    'latitude': message['location']['latitude'],
                    'longitude': message['location']['longitude']
                }
            
            # Handle photo
            if 'photo' in message:
                # Get highest resolution photo
                photos = message['photo']
                if photos:
                    largest_photo = max(photos, key=lambda p: p.get('file_size', 0))
                    file_id = largest_photo.get('file_id')
                    if file_id:
                        media_url = self.download_file(file_id)
                        if media_url:
                            parsed['media_urls'].append(media_url)
            
            # Handle video
            if 'video' in message:
                file_id = message['video'].get('file_id')
                if file_id:
                    media_url = self.download_file(file_id)
                    if media_url:
                        parsed['media_urls'].append(media_url)
            
            # Handle document (images sent as files)
            if 'document' in message:
                file_id = message['document'].get('file_id')
                if file_id:
                    media_url = self.download_file(file_id)
                    if media_url:
                        parsed['media_urls'].append(media_url)
            
            return parsed
            
        except Exception as e:
            print(f"Error parsing Telegram webhook: {e}")
            return None


# Global instance
telegram = TelegramAPI()
