from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration using Pydantic Settings"""
    
    # App Info
    APP_NAME: str = "Flood Watch API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    
    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS as a list"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # WhatsApp
    WHATSAPP_API_URL: Optional[str] = None
    WHATSAPP_API_KEY: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    
    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_WEBHOOK_URL: Optional[str] = None
    
    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Africa's Talking
    AFRICAS_TALKING_USERNAME: Optional[str] = None
    AFRICAS_TALKING_API_KEY: Optional[str] = None
    
    # OpenWeatherMap
    OPENWEATHER_API_KEY: Optional[str] = None
    
    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: str = "floodwatch-media"
    AWS_REGION: str = "us-east-1"
    
    # Mapbox
    MAPBOX_ACCESS_TOKEN: Optional[str] = None
    
    # Google Maps
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # SendGrid Email
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: str = "noreply@floodwatch.org"
    SENDGRID_FROM_NAME: str = "Flood Watch"
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    
    # Alert Configuration
    ALERT_RADIUS_BUFFER_KM: float = 2.0
    MIN_REPORTS_FOR_INCIDENT: int = 3
    
    # ML/AI Configuration
    ML_MODEL_PATH: Optional[str] = None
    VERIFICATION_CONFIDENCE_THRESHOLD: float = 0.6
    ML_INFERENCE_URL: Optional[str] = None
    
    # Supabase (Optional - for enhanced features)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    USE_SUPABASE_AUTH: bool = False  # Use Supabase Auth instead of JWT
    USE_SUPABASE_STORAGE: bool = False  # Use Supabase Storage instead of S3
    USE_SUPABASE_REALTIME: bool = False  # Enable realtime subscriptions
    
    class Config:
        env_file = "../.env"  # Look for .env in parent directory
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env (like POSTGRES_USER, etc.)


settings = None

def get_settings() -> Settings:
    global settings
    if settings is None:
        settings = Settings()
    return settings
