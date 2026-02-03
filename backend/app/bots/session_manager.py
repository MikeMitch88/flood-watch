import json
import redis
from typing import Optional, Dict, Any
from datetime import timedelta
from app.config import get_settings

settings = get_settings()


class SessionManager:
    """Manage conversation sessions using Redis (or in-memory fallback)"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            self.use_redis = True
            print("✅ Redis connected successfully")
        except Exception as e:
            print(f"⚠️  Redis not available ({e}), using in-memory session storage")
            self.redis_client = None
            self.use_redis = False
            self._memory_store = {}  # Fallback to in-memory dict
        
        self.session_ttl = timedelta(hours=24)  # Sessions expire after 24 hours
    
    def _get_session_key(self, user_id: str, platform: str) -> str:
        """Generate Redis key for session"""
        return f"session:{platform}:{user_id}"
    
    def get_session(self, user_id: str, platform: str) -> Optional[Dict[str, Any]]:
        """Get user's conversation session"""
        key = self._get_session_key(user_id, platform)
        
        if self.use_redis:
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
        else:
            return self._memory_store.get(key)
        
        return None
    
    def set_session(self, user_id: str, platform: str, session_data: Dict[str, Any]) -> None:
        """Save user's conversation session"""
        key = self._get_session_key(user_id, platform)
        
        if self.use_redis:
            self.redis_client.setex(
                key,
                self.session_ttl,
                json.dumps(session_data)
            )
        else:
            self._memory_store[key] = session_data
    
    def update_session(self, user_id: str, platform: str, updates: Dict[str, Any]) -> None:
        """Update specific fields in session"""
        session = self.get_session(user_id, platform) or {}
        session.update(updates)
        self.set_session(user_id, platform, session)
    
    def clear_session(self, user_id: str, platform: str) -> None:
        """Clear user's conversation session"""
        key = self._get_session_key(user_id, platform)
        
        if self.use_redis:
            self.redis_client.delete(key)
        else:
            self._memory_store.pop(key, None)
    
    def get_state(self, user_id: str, platform: str) -> Optional[str]:
        """Get current conversation state"""
        session = self.get_session(user_id, platform)
        return session.get('state') if session else None
    
    def set_state(self, user_id: str, platform: str, state: str) -> None:
        """Set conversation state"""
        self.update_session(user_id, platform, {'state': state})
    
    def store_temp_data(self, user_id: str, platform: str, key: str, value: Any) -> None:
        """Store temporary data during report submission"""
        session = self.get_session(user_id, platform) or {}
        if 'temp_data' not in session:
            session['temp_data'] = {}
        session['temp_data'][key] = value
        self.set_session(user_id, platform, session)
    
    def get_temp_data(self, user_id: str, platform: str, key: str) -> Any:
        """Get temporary data"""
        session = self.get_session(user_id, platform)
        if session and 'temp_data' in session:
            return session['temp_data'].get(key)
        return None
    
    def clear_temp_data(self, user_id: str, platform: str) -> None:
        """Clear temporary data (after report submission)"""
        session = self.get_session(user_id, platform)
        if session:
            session['temp_data'] = {}
            self.set_session(user_id, platform, session)
