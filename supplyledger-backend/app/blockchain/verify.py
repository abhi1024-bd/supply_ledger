"""
Blockchain Verification Module

Provides functions to verify shipment data integrity using blockchain hashes.
"""

from app.blockchain.ledger import generate_blockchain_hash
from typing import Dict, Any


def verify_shipment_hash(
    stored_hash: str,
    regenerated_hash: str
) -> bool:
    """
    Verify if a stored blockchain hash matches a regenerated one.
    
    Args:
        stored_hash: Hash stored in database
        regenerated_hash: Hash generated from current shipment data
    
    Returns:
        True if hashes match (data is intact), False if tampered
    """
    return stored_hash == regenerated_hash


def verify_shipment_integrity(
    shipment_id: int,
    source: str,
    destination: str,
    distance_km: int,
    status: str,
    stored_hash: str
) -> Dict[str, Any]:
    """
    Comprehensive shipment integrity verification.
    
    This is the main verification function used in the API.
    
    Args:
        shipment_id: Unique shipment identifier
        source: Origin city
        destination: Destination city
        distance_km: Distance in kilometers
        status: Current shipment status
        stored_hash: Hash stored in database
    
    Returns:
        {
            'valid': bool,
            'stored_hash': str,
            'current_hash': str,
            'tampered': bool,
            'message': str
        }
    """
    # Regenerate hash from current data
    current_hash = generate_blockchain_hash(
        shipment_id=shipment_id,
        source=source,
        destination=destination,
        distance_km=distance_km,
        status=status
    )
    
    is_valid = verify_shipment_hash(stored_hash, current_hash)
    
    return {
        'valid': is_valid,
        'stored_hash': stored_hash,
        'current_hash': current_hash,
        'tampered': not is_valid,
        'message': (
            'Shipment data is intact and has not been tampered with.' 
            if is_valid 
            else 'WARNING: Shipment data has been modified. Original hash does not match.'
        )
    }
