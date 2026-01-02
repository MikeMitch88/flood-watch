"""
Email Service
Handles sending emails via SendGrid for verification, alerts, and notifications
"""

import secrets
import logging
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SendGrid"""
    
    def __init__(self):
        if not settings.SENDGRID_API_KEY:
            logger.warning("SendGrid API key not configured - emails will not be sent")
            self.client = None
        else:
            self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
    
    def generate_verification_code(self) -> str:
        """
        Generate a cryptographically secure 6-digit verification code
        
        Returns:
            str: 6-digit numeric code
        """
        # Generate random number between 100000 and 999999
        return str(secrets.randbelow(900000) + 100000)
    
    def _render_verification_email_html(self, code: str, user_email: str) -> str:
        """
        Render verification email HTML template
        
        Args:
            code: 6-digit verification code
            user_email: Recipient email address
            
        Returns:
            str: HTML email content
        """
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .logo {{
            font-size: 24px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 10px;
        }}
        .code-container {{
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }}
        .code {{
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
        }}
        .instructions {{
            color: #666;
            margin: 20px 0;
            text-align: center;
        }}
        .warning {{
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌊 Flood Watch</div>
            <h1>Verify Your Email Address</h1>
        </div>
        
        <p>Hi there!</p>
        
        <p>Thank you for signing up for Flood Watch. To complete your registration, please verify your email address by entering the code below:</p>
        
        <div class="code-container">
            <div class="code">{code}</div>
        </div>
        
        <div class="instructions">
            <p><strong>Enter this 6-digit code on the verification page.</strong></p>
            <p>This code will expire in <strong>5 minutes</strong>.</p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this verification code, please ignore this email. Your account security is important to us.
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <div class="footer">
            <p>This is an automated email from Flood Watch.</p>
            <p>Email sent to: {user_email}</p>
        </div>
    </div>
</body>
</html>
        """
    
    def _render_verification_email_text(self, code: str) -> str:
        """
        Render plain text version of verification email
        
        Args:
            code: 6-digit verification code
            
        Returns:
            str: Plain text email content
        """
        return f"""
Flood Watch - Email Verification

Thank you for signing up for Flood Watch!

Your verification code is: {code}

Please enter this code on the verification page to complete your registration.

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

---
Flood Watch Team
        """
    
    async def send_verification_email(
        self,
        to_email: str,
        code: str
    ) -> bool:
        """
        Send verification code email
        
        Args:
            to_email: Recipient email address
            code: 6-digit verification code
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.client:
            logger.error("SendGrid client not initialized - cannot send email")
            # In development, log the code instead
            logger.info(f"VERIFICATION CODE for {to_email}: {code}")
            return False
        
        try:
            from_email = Email(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME)
            to = To(to_email)
            subject = "Verify Your Flood Watch Account"
            
            # HTML content
            html_content = Content("text/html", self._render_verification_email_html(code, to_email))
            
            # Create mail object
            mail = Mail(
                from_email=from_email,
                to_emails=to,
                subject=subject,
                html_content=html_content
            )
            
            # Add plain text alternative
            mail.add_content(Content("text/plain", self._render_verification_email_text(code)))
            
            # Send email
            response = self.client.send(mail)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Verification email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email: {response.status_code} - {response.body}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending verification email to {to_email}: {str(e)}")
            return False
    
    async def send_welcome_email(self, to_email: str, username: str) -> bool:
        """
        Send welcome email after successful verification
        
        Args:
            to_email: Recipient email address
            username: User's username
            
        Returns:
            bool: True if sent successfully
        """
        if not self.client:
            logger.info(f"Would send welcome email to {to_email}")
            return False
        
        try:
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0ea5e9;">Welcome to Flood Watch, {username}! 🎉</h2>
                <p>Your email has been successfully verified.</p>
                <p>You now have full access to the Flood Watch platform:</p>
                <ul>
                    <li>Real-time flood monitoring and alerts</li>
                    <li>Community-driven flood reporting</li>
                    <li>AI-powered verification system</li>
                    <li>Emergency response coordination</li>
                </ul>
                <p>Thank you for joining us in making communities safer!</p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    - The Flood Watch Team
                </p>
            </body>
            </html>
            """
            
            mail = Mail(
                from_email=Email(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
                to_emails=To(to_email),
                subject="Welcome to Flood Watch!",
                html_content=Content("text/html", html_content)
            )
            
            response = self.client.send(mail)
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return False


# Singleton instance
email_service = EmailService()
