"""
Run bot_messages table migration
"""
from app.database import engine
from sqlalchemy import text

def run_migration():
    migration_sql = """
    -- Create enum if not exists
    DO $$ BEGIN
        CREATE TYPE message_type AS ENUM ('command', 'text', 'location', 'media', 'button');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Create table
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_bot_messages_platform ON bot_messages(platform);
    CREATE INDEX IF NOT EXISTS idx_bot_messages_platform_user_id ON bot_messages(platform_user_id);
    CREATE INDEX IF NOT EXISTS idx_bot_messages_created_at ON bot_messages(created_at);
    """
    
    with engine.connect() as conn:
        conn.execute(text(migration_sql))
        conn.commit()
    
    print("✅ Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
