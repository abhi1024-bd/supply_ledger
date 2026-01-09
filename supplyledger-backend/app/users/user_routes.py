from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate
from app.auth.auth_service import hash_password
import uuid

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password=hash_password(user_data.password),
        company_name=user_data.company_name,
        phone=user_data.phone,
        address=user_data.address,
        account_type="Standard"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/profile/{user_id}", response_model=UserResponse)
def update_user_profile(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.name:
        user.name = user_data.name
    if user_data.company_name:
        user.company_name = user_data.company_name
    if user_data.phone:
        user.phone = user_data.phone
    if user_data.address:
        user.address = user_data.address
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/search")
def search_users(email: str = None, db: Session = Depends(get_db)):
    """Search users by email"""
    if not email:
        raise HTTPException(status_code=400, detail="Email parameter required")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
