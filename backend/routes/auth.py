from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth_models import User, UserCreate, UserLogin, UserResponse, TokenResponse, ROLE_PERMISSIONS
from auth_models import ForgotPasswordRequest, ResetPasswordRequest
from auth_models import get_password_hash, verify_password
from datetime import datetime, timedelta
import jwt
import os
import secrets
import logging
from typing import List
from services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

db = None

def set_db(database):
    global db
    db = database

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

def require_permission(permission: str):
    async def permission_checker(current_user: User = Depends(get_current_user)):
        if permission not in current_user.permissions:
            raise HTTPException(
                status_code=403,
                detail=f"User does not have '{permission}' permission"
            )
        return current_user
    return permission_checker

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    _current: User = Depends(require_permission("manage_users")),
):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Set permissions based on role
    permissions = ROLE_PERMISSIONS.get(user_data.role, [])
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        permissions=permissions
    )
    
    await db.users.insert_one(user.dict())
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions,
        is_active=user.is_active
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="User account is disabled")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            permissions=user["permissions"],
            is_active=user["is_active"]
        )
    )

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """Always returns a generic success message, whether or not the email exists,
    so this endpoint can't be used to discover which emails have accounts."""
    generic_response = {
        "message": "If an account exists for that email, a reset link has been sent."
    }

    user = await db.users.find_one({"email": payload.email})
    if not user or not user.get("is_active", True):
        return generic_response

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    await db.password_resets.insert_one({
        "token": token,
        "user_id": user["id"],
        "email": user["email"],
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.utcnow(),
    })

    public_url = os.environ.get("PUBLIC_APP_URL", "http://localhost").rstrip("/")
    reset_url = f"{public_url}/admin/reset-password?token={token}"

    try:
        await send_password_reset_email(user["email"], reset_url)
    except Exception as exc:
        logger.warning("Failed to send password reset email: %s", exc)

    return generic_response


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    record = await db.password_resets.find_one({"token": payload.token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if record.get("used"):
        raise HTTPException(status_code=400, detail="This reset link has already been used")
    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This reset link has expired")

    await db.users.update_one(
        {"id": record["user_id"]},
        {"$set": {"hashed_password": get_password_hash(payload.new_password)}}
    )
    await db.password_resets.update_one(
        {"token": payload.token},
        {"$set": {"used": True}}
    )

    return {"message": "Password reset successfully. You can now log in with your new password."}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        permissions=current_user.permissions,
        is_active=current_user.is_active
    )

@router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(require_permission("manage_users"))):
    users = await db.users.find().to_list(100)
    return [UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        permissions=user["permissions"],
        is_active=user["is_active"]
    ) for user in users]

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_permission("manage_users"))
):
    if role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    permissions = ROLE_PERMISSIONS[role]
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role, "permissions": permissions}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_permission("manage_users"))
):
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}
