-- Migration: Add bot_messages table for analytics
-- Created: 2026-01-05

CREATE TYPE message_type AS ENUM ('command', 'text', 'location', 'media', 'button');

CREATE TABLE IF NOT EXISTS bot_messages (
    id VARCHAR(36) PRIMARY KEY,
    platform platform_type NOT NULL,
    platform_user_id VARCHAR(100) NOT NULL,
    message_type message_type NOT NULL,
    message_text TEXT,
    session_state VARCHAR(50),
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_bot_messages_platform ON bot_messages(platform);
CREATE INDEX idx_bot_messages_platform_user_id ON bot_messages(platform_user_id);
CREATE INDEX idx_bot_messages_created_at ON bot_messages(created_at);

-- Add comment
COMMENT ON TABLE bot_messages IS 'Tracks all bot message interactions for analytics and monitoring';
