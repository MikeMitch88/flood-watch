from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Note: This database configuration works with both:
# - Local PostgreSQL (with PostGIS)
# - Supabase (PostgreSQL with PostGIS)
# Simply change DATABASE_URL in .env to switch between them

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    print("get_db() called - creating session...")
    try:
        db = SessionLocal()
        print("Session created successfully")
        yield db
    except Exception as e:
        print(f"ERROR in get_db: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        print("Closing database session")
        db.close()


def init_db():
    """Initialize database - create all tables"""
    # Import all models to ensure they're registered
    from app.models import models
    Base.metadata.create_all(bind=engine)
