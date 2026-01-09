from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User
from app.schemas import LoginRequest, LoginResponse
from app.auth.auth_service import verify_password, generate_token

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """User login endpoint"""
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    # Generate token
    token = generate_token()
    
    return {
        "token": token,
        "user": user,
        "role": "MSME"
    }


@router.post("/logout")
def logout():
    """User logout endpoint"""
    return {"message": "Logout successful"}
