from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas import AdminLogin, AdminUserCreate, AdminUserResponse, Token
from app.models import AdminUser
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(
    admin_data: AdminUserCreate,
    db: Session = Depends(get_db)
):
    """Register a new admin user and send verification email"""
    # Check if username or email already exists
    existing_user = db.query(AdminUser).filter(
        (AdminUser.username == admin_data.username) | (AdminUser.email == admin_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new admin user
    hashed_password = get_password_hash(admin_data.password)
    admin_user = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hashed_password,
        email_verified=False,  # Will be verified via email
        role=admin_data.role,
        organization_id=admin_data.organization_id
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    # Send verification email
    from app.services.email_verification_service import email_verification_service
    try:
        success, message = await email_verification_service.create_and_send_verification_code(
            db, admin_user
        )
        if not success:
            # Log error but don't fail registration
            print(f"Failed to send verification email: {message}")
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
    
    return admin_user


@router.post("/login", response_model=Token)
async def login(
    credentials: AdminLogin,
    db: Session = Depends(get_db)
):
    """Admin login"""
    # Find user
    admin_user = db.query(AdminUser).filter(
        AdminUser.username == credentials.username
    ).first()
    
    if not admin_user or not verify_password(credentials.password, admin_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    from datetime import datetime
    admin_user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin_user.username, "user_id": admin_user.id}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """Dependency to get current authenticated admin user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    admin_user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if admin_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return admin_user


@router.get("/me", response_model=AdminUserResponse)
async def get_current_user_info(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get current admin user information"""
    return current_admin


@router.post("/verify-email")
async def verify_email_code(
    code: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Verify email with submitted code
    
    User must be authenticated to verify their email
    """
    from app.services.email_verification_service import email_verification_service
    
    success, message = email_verification_service.verify_code(
        db, current_admin.id, code
    )
    
    if success:
        return {"success": True, "message": message}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )


@router.post("/resend-verification")
async def resend_verification_code(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Resend verification email code"""
    from app.services.email_verification_service import email_verification_service
    
    if current_admin.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    success, message = await email_verification_service.create_and_send_verification_code(
        db, current_admin
    )
    
    if success:
        return {"success": True, "message": message}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
