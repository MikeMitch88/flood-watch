"""
Check admin users in database
"""
import sys
sys.path.append('.')

from app.database import SessionLocal
from app.models import AdminUser

db = SessionLocal()

try:
    print("=" * 60)
    print("ADMIN USERS IN DATABASE")
    print("=" * 60)
    
    users = db.query(AdminUser).all()
    
    if not users:
        print("❌ No admin users found!")
    else:
        for user in users:
            print(f"\nUsername: {user.username}")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"Email Verified: {user.email_verified}")
            print(f"Created: {user.created_at}")
            print(f"Password hash (first 20 chars): {user.password_hash[:20]}...")
    
    print("\n" + "=" * 60)
    
finally:
    db.close()
