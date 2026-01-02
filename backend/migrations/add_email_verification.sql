-- Email Verification System Migration
-- Add email_verified column to admin_users and create email_verification_codes table

-- Add email_verified field to admin_users table
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create email_verification_codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id VARCHAR(36) PRIMARY KEY,
    admin_user_id VARCHAR(36) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_admin_user ON email_verification_codes(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON email_verification_codes(expires_at);

-- Add comment to table
COMMENT ON TABLE email_verification_codes IS 'Stores email verification codes sent to admin users during registration';
COMMENT ON COLUMN email_verification_codes.code_hash IS 'Bcrypt hash of the 6-digit verification code';
COMMENT ON COLUMN email_verification_codes.expires_at IS 'Code expires 5 minutes after creation';
COMMENT ON COLUMN email_verification_codes.attempts IS 'Number of times user tried to verify (max 3)';
