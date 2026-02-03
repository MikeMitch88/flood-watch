from fastapi import APIRouter, Request, Header, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.bots.whatsapp_api import whatsapp
from app.bots.telegram_api import telegram
from app.bots.command_handlers import CommandHandler
from app.models import PlatformType

router = APIRouter()


@router.get("/whatsapp")
async def whatsapp_webhook_verification(
    request: Request,
):
    """WhatsApp webhook verification (GET request)"""
    # Facebook sends verification request
    params = request.query_params
    
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    
    # Verify token should match your configured token
    VERIFY_TOKEN = "flood_watch_verify_token_12345"  # Change this!
    
    if mode == "subscribe" and token == VERIFY_TOKEN:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    x_hub_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """WhatsApp Business API webhook"""
    try:
        body = await request.json()
        
        # TODO: Verify webhook signature for production
        # if not verify_signature(x_hub_signature, body):
        #     raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Check if it's a status update (skip these)
        if body.get('entry', [{}])[0].get('changes', [{}])[0].get('value', {}).get('statuses'):
            return {"status": "ok"}
        
        # Parse incoming message
        message_data = whatsapp.parse_webhook_message(body)
        
        if not message_data:
            return {"status": "ok"}
        
        user_id = message_data['user_id']
        message_text = message_data.get('text', '')
        location = message_data.get('location')
        media_urls = message_data.get('media_urls', [])
        
        # Initialize command handler
        handler = CommandHandler(db)
        
        # Check if message is a command
        if message_text and message_text.startswith('/'):
            response = handler.handle_command(
                command=message_text.split()[0],
                user_id=user_id,
                platform=PlatformType.whatsapp,
                message_data=message_data
            )
        else:
            # Handle regular message based on conversation state
            response = handler.handle_message(
                user_id=user_id,
                platform=PlatformType.whatsapp,
                message_text=message_text,
                location=location,
                media_urls=media_urls,
                message_data=message_data
            )
        
        # Send response
        whatsapp.send_message(user_id, response)
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"WhatsApp webhook error: {e}")
        return {"status": "error", "message": str(e)}


@router.post("/telegram")
async def telegram_webhook(request: Request):
    """Telegram Bot API webhook"""
    import time
    from app.models.models import BotMessage, MessageType
    
    try:
        start_time = time.time()
        print("=" * 60)
        print("TELEGRAM WEBHOOK RECEIVED")
        update_data = await request.json()
        print(f"Update data: {update_data}")
        
        # Create database session manually
        from app.database import SessionLocal
        db = SessionLocal()
        
        try:
            # Parse incoming update
            message_data = telegram.parse_webhook_update(update_data)
            print(f"Parsed message data: {message_data}")
            
            if not message_data:
                print("No message data, returning ok")
                return {"ok": True}
            
            user_id = message_data['user_id']
            message_text = message_data.get('text', '')
            location = message_data.get('location')
            media_urls = message_data.get('media_urls', [])
            
            print(f"User ID: {user_id}, Message: {message_text}")
            
            # Initialize command handler
            handler = CommandHandler(db)
            
            # Determine message type
            if message_text and message_text.startswith('/'):
                msg_type = MessageType.command
            elif location:
                msg_type = MessageType.location
            elif media_urls:
                msg_type = MessageType.media
            else:
                msg_type = MessageType.text
            
            # Get current session state
            session_state = handler.session_manager.get_state(user_id, PlatformType.telegram.value)
            
            # Check if message is a command
            if message_text and message_text.startswith('/'):
                print(f"Handling command: {message_text}")
                response = handler.handle_command(
                    command=message_text.split()[0].split('@')[0],  # Remove bot username if present
                    user_id=user_id,
                    platform=PlatformType.telegram,
                    message_data=message_data
                )
            else:
                print(f"Handling regular message")
                # Handle regular message based on conversation state
                response = handler.handle_message(
                    user_id=user_id,
                    platform=PlatformType.telegram,
                    message_text=message_text,
                    location=location,
                    media_urls=media_urls,
                    message_data=message_data
                )
            
            # Calculate response time
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Log message to database for analytics
            try:
                bot_message = BotMessage(
                    platform=PlatformType.telegram,
                    platform_user_id=user_id,
                    message_type=msg_type,
                    message_text=message_text[:500] if message_text else None,  # Limit to 500 chars
                    session_state=session_state,
                    response_time_ms=response_time_ms
                )
                db.add(bot_message)
                db.commit()
            except Exception as log_error:
                print(f"Error logging message: {log_error}")
                db.rollback()
            
            print(f"Response: {response}")
            
            # Send response
            telegram.send_message(user_id, response)
            print("Message sent successfully")
            print("=" * 60)
            
            return {"ok": True}
        finally:
            db.close()
        
    except Exception as e:
        print(f"Telegram webhook error: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        return {"ok": False, "error": str(e)}


@router.post("/weather")
async def weather_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Weather alert webhook (from external services)"""
    try:
        body = await request.json()
        
        # TODO: Process weather alerts
        # TODO: Correlate with active incidents
        # TODO: Trigger preventive alerts if severe weather predicted
        
        print(f"Weather alert received: {body}")
        
        return {"status": "received"}
        
    except Exception as e:
        print(f"Weather webhook error: {e}")
        return {"status": "error", "message": str(e)}
