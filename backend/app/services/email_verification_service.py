"""
Email Verification Service
Handles email verification code generation, storage, and validation
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.models import EmailVerificationCode, AdminUser
from app.auth import get_password_hash, verify_password
from app.services.email_service import email_service
import logging

logger = logging.getLogger(__name__)

# Configuration
VERIFICATION_CODE_EXPIRY_MINUTES = 5
MAX_VERIFICATION_ATTEMPTS = 3
RESEND_COOLDOWN_SECONDS = 60


class EmailVerificationService:
    """Service for managing email verification codes"""
    
    async def create_and_send_verification_code(
        self,
        db: Session,
        admin_user: AdminUser
    ) -> Tuple[bool, str]:
        """
        Generate verification code, save to database, and send email
        
        Args:
            db: Database session
            admin_user: Admin user to verify
            
        Returns:
            Tuple[bool, str]: (Success status, message)
        """
        try:
            # Check if there's a recent unexpired code
            recent_code = db.query(EmailVerificationCode).filter(
                EmailVerificationCode.admin_user_id == admin_user.id,
                EmailVerificationCode.verified == False,
                EmailVerificationCode.expires_at > datetime.utcnow()
            ).order_by(EmailVerificationCode.created_at.desc()).first()
            
            if recent_code:
                # Check cooldown period
                time_since_creation = (datetime.utcnow() - recent_code.created_at).total_seconds()
                if time_since_creation < RESEND_COOLDOWN_SECONDS:
                    cooldown_remaining = int(RESEND_COOLDOWN_SECONDS - time_since_creation)
                    return False, f"Please wait {cooldown_remaining} seconds before requesting a new code"
            
            # Generate new 6-digit code
            code = email_service.generate_verification_code()
            
            # Hash the code before storing
            code_hash = get_password_hash(code)
            
            # Calculate expiration time
            expires_at = datetime.utcnow() + timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES)
            
            # Create verification record
            verification_record = EmailVerificationCode(
                admin_user_id=admin_user.id,
                code_hash=code_hash,
                expires_at=expires_at,
                attempts=0,
                verified=False
            )
            
            db.add(verification_record)
            db.commit()
            
            # Send email
            email_sent = await email_service.send_verification_email(
                to_email=admin_user.email,
                code=code
            )
            
            if email_sent:
                logger.info(f"Verification code sent to {admin_user.email}")
                return True, "Verification code sent to your email"
            else:
                # Email failed but code is stored - log for debugging
                logger.error(f"Failed to send email to {admin_user.email}, but code is stored")
                # In development, we might want to return the code
                if db.query(AdminUser).count() < 5:  # Only in very early dev
                    logger.warning(f"DEV MODE: Verification code for {admin_user.email}: {code}")
                return True, "Verification code generated (email delivery pending)"
                
        except Exception as e:
            logger.error(f"Error creating verification code: {str(e)}")
            db.rollback()
            return False, "Failed to generate verification code"
    
    def verify_code(
        self,
        db: Session,
        admin_user_id: str,
        submitted_code: str
    ) -> Tuple[bool, str]:
        """
        Verify submitted code against stored hash
        
        Args:
            db: Database session
            admin_user_id: Admin user ID
            submitted_code: Code submitted by user
            
        Returns:
            Tuple[bool, str]: (Success status, message)
        """
        try:
            # Find most recent unexpired verification code
            verification_record = db.query(EmailVerificationCode).filter(
                EmailVerificationCode.admin_user_id == admin_user_id,
                EmailVerificationCode.verified == False,
                EmailVerificationCode.expires_at > datetime.utcnow()
            ).order_by(EmailVerificationCode.created_at.desc()).first()
            
            if not verification_record:
                return False, "No valid verification code found. Please request a new code."
            
            # Check if too many attempts
            if verification_record.attempts >= MAX_VERIFICATION_ATTEMPTS:
                return False, "Too many failed attempts. Please request a new code."
            
            # Increment attempts
            verification_record.attempts += 1
            db.commit()
            
            # Verify the code
            if verify_password(submitted_code, verification_record.code_hash):
                # Code is correct - mark as verified
                verification_record.verified = True
                verification_record.verified_at = datetime.utcnow()
                
                # Update admin user email_verified status
                admin_user = db.query(AdminUser).filter(
                    AdminUser.id == admin_user_id
                ).first()
                
                if admin_user:
                    admin_user.email_verified = True
                    
                    # Send welcome email
                    try:
                        await email_service.send_welcome_email(admin_user.email, admin_user.username)
                    except Exception as e:
                        logger.error(f"Failed to send welcome email: {str(e)}")
                
                db.commit()
                
                logger.info(f"Email verified successfully for user {admin_user_id}")
                return True, "Email verified successfully!"
            else:
                # Code is incorrect
                attempts_remaining = MAX_VERIFICATION_ATTEMPTS - verification_record.attempts
                if attempts_remaining > 0:
                    return False, f"Incorrect code. {attempts_remaining} attempts remaining."
                else:
                    return False, "Incorrect code. Maximum attempts reached. Please request a new code."
                    
        except Exception as e:
            logger.error(f"Error verifying code: {str(e)}")
            db.rollback()
            return False, "Verification failed. Please try again."
    
    def cleanup_expired_codes(self, db: Session) -> int:
        """
        Delete expired verification codes (for periodic cleanup)
        
        Args:
            db: Database session
            
        Returns:
            int: Number of codes deleted
        """
        try:
            count = db.query(EmailVerificationCode).filter(
                EmailVerificationCode.expires_at < datetime.utcnow(),
                EmailVerificationCode.verified == False
            ).delete()
            db.commit()
            
            if count > 0:
                logger.info(f"Cleaned up {count} expired verification codes")
            
            return count
        except Exception as e:
            logger.error(f"Error cleaning up expired codes: {str(e)}")
            db.rollback()
            return 0


# Singleton instance
email_verification_service = EmailVerificationService()
