# Flood Watch Bot Configuration Guide

## WhatsApp Business API Setup

### Option 1: 360Dialog (Recommended for NGOs)

1. **Sign up**: https://hub.360dialog.com/
2. **Get API credentials**:
   - API Key
   - Phone Number ID
   
3. **Configure webhook**:
   ```
   Webhook URL: https://your-domain.com/api/webhooks/whatsapp
   Verify Token: flood_watch_verify_token_12345
   ```

4. **Update .env**:
   ```bash
   WHATSAPP_API_URL=https://waba.360dialog.io/v1
   WHATSAPP_API_KEY=your_api_key_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   ```

### Option 2: Twilio

1. **Sign up**: https://www.twilio.com/whatsapp
2. **Configure WhatsApp sandbox** (for testing)
3. **Update .env** with Twilio credentials

---

## Telegram Bot Setup

### 1. Create Bot via BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to set name and username
4. **Save the bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Set Bot Commands

Send to @BotFather:
```
/setcommands

start - Start or restart bot
report - Report flooding in your area
alerts - Subscribe to flood alerts
status - Check flood status near you
safety - Get safety information
help - Show help menu
language - Change language
```

### 3. Configure Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/webhooks/telegram"}'
```

### 4. Update .env

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/webhooks/telegram
```

---

## Testing Locally with ngrok

For local development, use ngrok to create a public URL:

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Start ngrok tunnel
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Then update webhook URLs:
- WhatsApp: `https://abc123.ngrok.io/api/webhooks/whatsapp`
- Telegram: `https://abc123.ngrok.io/api/webhooks/telegram`

---

## AWS S3 Setup (for media storage)

### 1. Create S3 Bucket

```bash
aws s3 mb s3://floodwatch-media --region us-east-1
```

### 2. Set Bucket Policy

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::floodwatch-media/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy --bucket floodwatch-media --policy file://bucket-policy.json
```

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create new user: `floodwatch-uploader`
3. Attach policy: `AmazonS3FullAccess` (or create custom upload-only policy)
4. Generate access keys

### 4. Update .env

```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=floodwatch-media
AWS_REGION=us-east-1
```

---

## Verification

### Test WhatsApp Bot

1. Send a message to your WhatsApp number: `/start`
2. Bot should respond with welcome message
3. Try `/report` to test flood reporting flow

### Test Telegram Bot

1. Search for your bot on Telegram
2. Send `/start`
3. Bot should respond with welcome message
4. Try `/report` to test flood reporting flow

### Test Media Upload

1. Send a photo to either bot
2. Check S3 bucket for uploaded file
3. Check backend logs for S3 URL

---

## Bot Commands Reference

| Command | Description | Flow |
|---------|-------------|------|
| `/start` | Initialize bot | Creates user, shows welcome |
| `/report` | Report flooding | Multi-step: location → severity → description → photos → confirm |
| `/alerts` | Subscribe to alerts | Multi-step: location → radius → confirm |
| `/status` | Check local status | Shows nearby incidents |
| `/safety` | Safety info | Displays safety guidelines |
| `/help` | Show help | Lists all commands |
| `/language` | Change language | Language selection menu |

---

## Conversation Flow Example

**Flood Report Flow:**

```
User: /report
Bot: 📍 Please share your location where flooding is occurring.

User: [Shares location]
Bot: ⚠️ How severe is the flooding?
     1️⃣ Low - Minor water accumulation
     2️⃣ Medium - Water rising, roads affected
     3️⃣ High - Significant flooding, danger to property
     4️⃣ Critical - Life-threatening, immediate evacuation needed

User: 3
Bot: 📝 Please describe what you're seeing (optional).

User: Main Street is flooded, water up to car wheels
Bot: 📸 You can send photos or videos of the flooding (optional).

User: [Sends photo]
Bot: 📸 Photo received. Send more or type 'done' to continue.

User: done
Bot: ✅ Report Summary:
     📍 Location: Main Street, Nairobi
     ⚠️ Severity: HIGH
     📝 Description: Main Street is flooded, water up to car wheels
     
     Send 'confirm' to submit or 'cancel' to discard.

User: confirm
Bot: ✅ Thank you! Your flood report has been submitted.
     🔍 Our team will verify it shortly.
     📢 Nearby users will be alerted if confirmed.
     
     Report ID: abc12345
```

---

## Troubleshooting

### WhatsApp not receiving messages

Check:
1. Webhook URL is publicly accessible (use ngrok for local)
2. Verify token matches in .env
3. Check backend logs for webhook errors
4. Verify WhatsApp API credentials

### Telegram not responding

Check:
1. Bot token is correct
2. Webhook is set correctly (`getWebhookInfo` endpoint)
3. Backend logs for errors
4. Network connectivity

### Media not uploading

Check:
1. AWS credentials are correct
2. S3 bucket exists and has public read policy
3. Backend logs for S3 errors
4. Network connectivity to AWS

---

## Production Deployment

### Security Checklist

- [ ] Change WhatsApp verify token to strong random value
- [ ] Implement webhook signature verification
- [ ] Enable HTTPS (required for both WhatsApp and Telegram)
- [ ] Set up rate limiting on webhook endpoints
- [ ] Configure S3 bucket CORS if needed
- [ ] Use environment variables for all secrets
- [ ] Set up monitoring for webhook failures
- [ ] Implement retry logic for failed message deliveries

---

## Multi-Language Support

Currently supported:
- ✅ English
- ✅ Swahili (partial)

To add more languages:
1. Edit `backend/app/bots/localization.py`
2. Add translations for your language
3. Update language map in `_handle_language_selection`
4. Test all flows in new language
