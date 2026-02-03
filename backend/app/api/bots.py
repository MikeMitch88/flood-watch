from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.database import get_db
from app.config import get_settings
from app.bots.telegram_api import TelegramAPI
from app.bots.whatsapp_api import WhatsAppAPI
from app.bots.session_manager import SessionManager
from app.models import User, PlatformType

router = APIRouter()
settings = get_settings()


@router.get("/status")
async def get_bot_status() -> Dict[str, Any]:
    """Get connection status for all bot platforms"""
    
    telegram_status = {
        "connected": False,
        "webhook_url": None,
        "last_message": None,
        "error": None
    }
    
    whatsapp_status = {
        "connected": False,
        "webhook_url": None,
        "last_message": None,
        "error": None
    }
    
    # Check Telegram
    if settings.TELEGRAM_BOT_TOKEN:
        try:
            telegram = TelegramAPI()
            # Try to get bot info
            import requests
            response = requests.get(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe",
                timeout=5
            )
            if response.status_code == 200:
                telegram_status["connected"] = True
                
                # Get webhook info
                webhook_response = requests.get(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getWebhookInfo",
                    timeout=5
                )
                if webhook_response.status_code == 200:
                    webhook_data = webhook_response.json()
                    if webhook_data.get("result"):
                        telegram_status["webhook_url"] = webhook_data["result"].get("url")
                        last_error_date = webhook_data["result"].get("last_error_date")
                        if last_error_date:
                            telegram_status["last_message"] = datetime.fromtimestamp(last_error_date).isoformat()
        except Exception as e:
            telegram_status["error"] = str(e)
    
    # Check WhatsApp
    if settings.WHATSAPP_API_KEY:
        try:
            whatsapp = WhatsAppAPI()
            # WhatsApp status check would go here
            whatsapp_status["connected"] = True
        except Exception as e:
            whatsapp_status["error"] = str(e)
    
    return {
        "telegram": telegram_status,
        "whatsapp": whatsapp_status
    }


@router.get("/metrics")
async def get_bot_metrics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get bot usage metrics with real data from database"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.models import BotMessage, Report
    
    # Calculate time ranges
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    
    # Get total unique users by platform
    telegram_users = db.query(User).filter(User.platform == PlatformType.telegram).count()
    whatsapp_users = db.query(User).filter(User.platform == PlatformType.whatsapp).count()
    
    # Get total messages by platform
    telegram_messages = db.query(BotMessage).filter(
        BotMessage.platform == PlatformType.telegram
    ).count()
    whatsapp_messages = db.query(BotMessage).filter(
        BotMessage.platform == PlatformType.whatsapp
    ).count()
    
    # Get total reports by platform from users
    telegram_reports = db.query(Report).join(User).filter(
        User.platform == PlatformType.telegram
    ).count()
    whatsapp_reports = db.query(Report).join(User).filter(
        User.platform == PlatformType.whatsapp
    ).count()
    
    # Get active sessions count from Redis
    session_manager = SessionManager()
    active_sessions = 0
    telegram_sessions = 0
    whatsapp_sessions = 0
    
    if session_manager.use_redis:
        try:
            keys = session_manager.redis_client.keys("session:*")
            active_sessions = len(keys) if keys else 0
            
            # Count by platform
            for key in keys or []:
                if b'telegram' in key or 'telegram' in str(key):
                    telegram_sessions += 1
                elif b'whatsapp' in key or 'whatsapp' in str(key):
                    whatsapp_sessions += 1
        except:
            pass
    else:
        # Count in-memory sessions
        active_sessions = len(session_manager._memory_store)
        for key in session_manager._memory_store.keys():
            if 'telegram' in key:
                telegram_sessions += 1
            elif 'whatsapp' in key:
                whatsapp_sessions += 1
    
    # Calculate average response times
    telegram_avg_response = db.query(func.avg(BotMessage.response_time_ms)).filter(
        BotMessage.platform == PlatformType.telegram,
        BotMessage.response_time_ms.isnot(None)
    ).scalar()
    
    whatsapp_avg_response = db.query(func.avg(BotMessage.response_time_ms)).filter(
        BotMessage.platform == PlatformType.whatsapp,
        BotMessage.response_time_ms.isnot(None)
    ).scalar()
    
    # Get today's activity
    telegram_messages_today = db.query(BotMessage).filter(
        BotMessage.platform == PlatformType.telegram,
        BotMessage.created_at >= today_start
    ).count()
    
    whatsapp_messages_today = db.query(BotMessage).filter(
        BotMessage.platform == PlatformType.whatsapp,
        BotMessage.created_at >= today_start
    ).count()
    
    # Calculate users created today
    users_today = db.query(User).filter(
        User.created_at >= today_start
    ).count()
    
    return {
        "total_users": telegram_users + whatsapp_users,
        "active_sessions": active_sessions,
        "total_messages": telegram_messages + whatsapp_messages,
        "users_today": users_today,
        "by_platform": {
            "telegram": {
                "users": telegram_users,
                "messages": telegram_messages,
                "reports": telegram_reports,
                "active_sessions": telegram_sessions,
                "avg_response_ms": int(telegram_avg_response) if telegram_avg_response else 0,
                "messages_today": telegram_messages_today
            },
            "whatsapp": {
                "users": whatsapp_users,
                "messages": whatsapp_messages,
                "reports": whatsapp_reports,
                "active_sessions": whatsapp_sessions,
                "avg_response_ms": int(whatsapp_avg_response) if whatsapp_avg_response else 0,
                "messages_today": whatsapp_messages_today
            }
        }
    }


@router.get("/sessions")
async def get_active_sessions(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get list of active user sessions"""
    
    session_manager = SessionManager()
    sessions = []
    
    if session_manager.use_redis:
        try:
            # Get all session keys
            keys = session_manager.redis_client.keys("session:*")
            for key in keys:
                # Parse key: session:platform:user_id
                parts = key.split(":")
                if len(parts) == 3:
                    platform = parts[1]
                    user_id = parts[2]
                    
                    session_data = session_manager.get_session(user_id, platform)
                    if session_data:
                        sessions.append({
                            "user_id": user_id,
                            "platform": platform,
                            "state": session_data.get("state"),
                            "last_activity": datetime.utcnow().isoformat()  # Redis doesn't track this
                        })
        except:
            pass
    else:
        # Get from in-memory store
        for key, session_data in session_manager._memory_store.items():
            parts = key.split(":")
            if len(parts) == 3:
                platform = parts[1]
                user_id = parts[2]
                sessions.append({
                    "user_id": user_id,
                    "platform": platform,
                    "state": session_data.get("state") if isinstance(session_data, dict) else None,
                    "last_activity": datetime.utcnow().isoformat()
                })
    
    return {
        "sessions": sessions,
        "total": len(sessions)
    }


@router.get("/config")
async def get_bot_config() -> Dict[str, Any]:
    """Get bot configuration (non-sensitive)"""
    
    return {
        "telegram": {
            "enabled": bool(settings.TELEGRAM_BOT_TOKEN),
            "webhook_configured": bool(settings.TELEGRAM_BOT_TOKEN)
        },
        "whatsapp": {
            "enabled": bool(settings.WHATSAPP_API_KEY),
            "webhook_configured": bool(settings.WHATSAPP_API_KEY)
        },
        "redis": {
            "enabled": bool(settings.REDIS_URL),
            "url_configured": bool(settings.REDIS_URL)
        }
    }


@router.post("/test-connection")
async def test_bot_connection(request: Dict[str, Any]) -> Dict[str, Any]:
    """Test bot API connection"""
    
    platform = request.get("platform", "").lower()
    
    if platform == "telegram":
        if not settings.TELEGRAM_BOT_TOKEN:
            raise HTTPException(status_code=400, detail="Telegram bot token not configured")
        
        try:
            import requests
            response = requests.get(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe",
                timeout=5
            )
            
            if response.status_code == 200:
                bot_info = response.json()
                return {
                    "success": True,
                    "message": f"Connected to bot: @{bot_info['result']['username']}",
                    "bot_info": bot_info["result"]
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to connect: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }
    
    elif platform == "whatsapp":
        if not settings.WHATSAPP_API_KEY:
            raise HTTPException(status_code=400, detail="WhatsApp API token not configured")
        
        return {
            "success": False,
            "message": "WhatsApp connection test not implemented yet"
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown platform: {platform}")

