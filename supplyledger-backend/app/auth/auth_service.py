import hashlib
import secrets


def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == hashed_password


def generate_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)
