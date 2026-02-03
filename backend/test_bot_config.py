"""
Bot Configuration Test Script

Run this script to verify your bot configuration is correct.
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.bots.telegram_api import telegram
from app.bots.whatsapp_api import whatsapp

def test_configuration():
    """Test bot configuration"""
    settings = get_settings()
    
    print("=" * 60)
    print("FLOOD WATCH BOT CONFIGURATION TEST")
    print("=" * 60)
    print()
    
    # Test Telegram
    print("📱 TELEGRAM BOT")
    print("-" * 60)
    if settings.TELEGRAM_BOT_TOKEN:
        token_preview = settings.TELEGRAM_BOT_TOKEN[:10] + "..." if len(settings.TELEGRAM_BOT_TOKEN) > 10 else "***"
        print(f"✅ Bot Token: {token_preview}")
        print(f"✅ Enabled: {telegram.enabled}")
        if settings.TELEGRAM_WEBHOOK_URL:
            print(f"✅ Webhook URL: {settings.TELEGRAM_WEBHOOK_URL}")
        else:
            print(f"⚠️  Webhook URL: Not set (required for production)")
    else:
        print("❌ Bot Token: Not configured")
        print("   Set TELEGRAM_BOT_TOKEN in .env file")
    print()
    
    # Test WhatsApp
    print("💬 WHATSAPP BOT")
    print("-" * 60)
    if settings.WHATSAPP_API_KEY:
        key_preview = settings.WHATSAPP_API_KEY[:10] + "..." if len(settings.WHATSAPP_API_KEY) > 10 else "***"
        print(f"✅ API Key: {key_preview}")
        print(f"✅ API URL: {settings.WHATSAPP_API_URL}")
        print(f"✅ Phone Number ID: {settings.WHATSAPP_PHONE_NUMBER_ID}")
        print(f"✅ Enabled: {whatsapp.enabled}")
    else:
        print("❌ API Key: Not configured")
        print("   Set WHATSAPP_API_KEY in .env file")
    print()
    
    # Test Storage
    print("💾 MEDIA STORAGE")
    print("-" * 60)
    if settings.AWS_ACCESS_KEY_ID:
        key_preview = settings.AWS_ACCESS_KEY_ID[:10] + "..."
        print(f"✅ AWS Access Key: {key_preview}")
        print(f"✅ S3 Bucket: {settings.AWS_S3_BUCKET}")
        print(f"✅ Region: {settings.AWS_REGION}")
    elif settings.USE_SUPABASE_STORAGE:
        print(f"✅ Using Supabase Storage")
        print(f"✅ Supabase URL: {settings.SUPABASE_URL}")
    else:
        print("⚠️  No storage configured")
        print("   Photos/videos from bots won't be saved")
        print("   Set AWS_ACCESS_KEY_ID or USE_SUPABASE_STORAGE=true")
    print()
    
    # Test Redis
    print("🔴 REDIS (Session Management)")
    print("-" * 60)
    print(f"✅ Redis URL: {settings.REDIS_URL}")
    print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    issues = []
    if not settings.TELEGRAM_BOT_TOKEN:
        issues.append("Telegram bot token not set")
    if not settings.WHATSAPP_API_KEY:
        issues.append("WhatsApp API key not set")
    if not settings.AWS_ACCESS_KEY_ID and not settings.USE_SUPABASE_STORAGE:
        issues.append("No media storage configured")
    
    if not issues:
        print("✅ All bot configurations are set!")
        print()
        print("Next steps:")
        print("1. Make sure Redis is running")
        print("2. Set up webhooks (see live_bot_setup_guide.md)")
        print("3. Test your bots by sending /start")
    else:
        print("⚠️  Configuration issues found:")
        for issue in issues:
            print(f"   - {issue}")
        print()
        print("See live_bot_setup_guide.md for setup instructions")
    
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_configuration()
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Make sure you're running this from the backend directory")
        print("and that your .env file is configured correctly")
