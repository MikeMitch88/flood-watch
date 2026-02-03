import requests
import json

# Configuration
BOT_TOKEN = "8380913543:AAHck9VQG8ExNxqc6V5MdhM7b8LLsEITkDU"
NGROK_URL = "https://2a026fce8f38.ngrok-free.app"
WEBHOOK_URL = f"{NGROK_URL}/api/webhooks/telegram"

print("=" * 60)
print("TELEGRAM BOT WEBHOOK SETUP")
print("=" * 60)
print()
print(f"Bot Token: {BOT_TOKEN[:10]}...")
print(f"Webhook URL: {WEBHOOK_URL}")
print()

# Set webhook
print("Setting webhook...")
response = requests.post(
    f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook",
    json={"url": WEBHOOK_URL}
)

result = response.json()
print()
print("Response:")
print(json.dumps(result, indent=2))
print()

if result.get("ok"):
    print("✅ SUCCESS! Webhook set successfully!")
    print()
    print("Next steps:")
    print("1. Open Telegram")
    print("2. Search for your bot")
    print("3. Send: /start")
    print()
    print("Watch your backend terminal for webhook activity!")
else:
    print("❌ ERROR setting webhook")
    print(f"Error: {result.get('description')}")
    print()
    print("Troubleshooting:")
    print("1. Make sure ngrok is running: ngrok http 8000")
    print("2. Check that your backend is running on port 8000")
    print("3. Verify the ngrok URL is correct")

print("=" * 60)

# Get webhook info
print()
print("Checking webhook status...")
info_response = requests.get(
    f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
)
info = info_response.json()
print(json.dumps(info.get("result", {}), indent=2))
