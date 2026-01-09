import hashlib
from datetime import datetime
from typing import Optional


def generate_blockchain_hash(
    shipment_id: int,
    source: str,
    destination: str,
    distance_km: int,
    status: str,
    timestamp: Optional[datetime] = None
) -> str:
    """
    Generate SHA-256 blockchain hash for a shipment.
    
    This creates an immutable fingerprint of the shipment that changes if any data is tampered with.
    
    Args:
        shipment_id: Unique shipment identifier
        source: Origin city
        destination: Destination city
        distance_km: Distance in kilometers
        status: Current shipment status
        timestamp: Optional timestamp (defaults to UTC now)
    
    Returns:
        SHA-256 hash hexdigest (immutable proof)
    
    Security Note:
        - Any change in input → hash changes completely
        - Timestamp ensures uniqueness across status changes
        - No way to reverse-engineer original data from hash
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    # Create a deterministic string from all shipment data
    # Order matters: any permutation will create different hash
    data = f"{shipment_id}|{source}|{destination}|{distance_km}|{status}|{timestamp.isoformat()}"
    
    # SHA-256 produces 256-bit (32-byte) hash, displayed as 64 hex characters
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


def get_hash_for_verification(
    shipment_id: int,
    source: str,
    destination: str,
    distance_km: int,
    status: str
) -> str:
    """
    Generate hash without timestamp for verification purposes.
    Used to check if shipment data was tampered with (excluding timestamp).
    """
    data = f"{shipment_id}|{source}|{destination}|{distance_km}|{status}"
    return hashlib.sha256(data.encode('utf-8')).hexdigest()
