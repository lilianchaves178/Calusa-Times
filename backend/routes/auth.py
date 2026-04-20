from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth_models import User, UserCreate, UserLogin, UserResponse, TokenResponse, ROLE_PERMISSIONS
from auth_models import get_password_hash, verify_password
from datetime import datetime, timedelta
import jwt
import os
from typing import List

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
    except jwt.JWTError:
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
async def register(user_data: UserCreate):
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
