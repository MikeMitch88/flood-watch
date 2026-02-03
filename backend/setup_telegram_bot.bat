@echo off
echo ============================================
echo TELEGRAM BOT SETUP - STEP BY STEP
echo ============================================
echo.

echo Step 1: Install ngrok (if not already installed)
echo Download from: https://ngrok.com/download
echo.
pause

echo.
echo Step 2: Start ngrok tunnel
echo Run this command in a NEW terminal:
echo    ngrok http 8000
echo.
echo Copy the HTTPS URL (looks like: https://abc123.ngrok-free.app)
echo.
pause

echo.
echo Step 3: Enter your ngrok HTTPS URL
set /p NGROK_URL="https://298d005c77d4.ngrok-free.app"

echo.
echo Step 4: Get your Telegram bot token from .env
echo.
set /p BOT_TOKEN="8380913543:AAHck9VQG8ExNxqc6V5MdhM7b8LLsEITkDU"

echo.
echo Step 5: Setting webhook...
echo.

curl -X POST "https://api.telegram.org/bot%BOT_TOKEN%/setWebhook" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"%NGROK_URL%/api/webhooks/telegram\"}"

echo.
echo.
echo ============================================
echo SETUP COMPLETE!
echo ============================================
echo.
echo Next steps:
echo 1. Open Telegram
echo 2. Search for your bot
echo 3. Send: /start
echo.
echo Check your backend terminal for webhook activity!
echo.
pause
