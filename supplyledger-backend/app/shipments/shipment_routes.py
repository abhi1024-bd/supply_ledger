from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.database import get_db
from app.database.models import Shipment, Order
from app.schemas import ShipmentCreate, ShipmentResponse, ShipmentUpdate
from app.blockchain.ledger import generate_blockchain_hash
from app.blockchain.verify import verify_shipment_integrity
from app.ai.delay_prediction import predict_delay
from app.utils.city_coords import get_city_coordinates

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str


@router.post("/create", response_model=ShipmentResponse)
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    """
    Create a new shipment with blockchain hash.
    
    The blockchain hash is generated immediately and serves as the immutable 
    fingerprint for this shipment state. Any future tampering will be detected.
    """
    # Auto-detect coordinates from city names if not provided
    source_coords = shipment.source_coords or get_city_coordinates(shipment.source)
    dest_coords = shipment.dest_coords or get_city_coordinates(shipment.destination)

    new_shipment = Shipment(
        order_id=shipment.order_id,
        source=shipment.source,
        destination=shipment.destination,
        source_coords=source_coords,
        dest_coords=dest_coords,
        distance_km=shipment.distance_km,
        status="CREATED",
        estimated_delivery=datetime.utcnow() + timedelta(days=5)  # Default 5 days
    )

    db.add(new_shipment)
    db.commit()
    db.refresh(new_shipment)
    
    # Generate blockchain hash AFTER getting the shipment ID from database
    blockchain_hash = generate_blockchain_hash(
        shipment_id=new_shipment.id,
        source=new_shipment.source,
        destination=new_shipment.destination,
        distance_km=new_shipment.distance_km,
        status=new_shipment.status
    )
    
    # Store the immutable hash
    new_shipment.blockchain_hash = blockchain_hash
    db.commit()
    db.refresh(new_shipment)
    
    # Update order status to "In Transit"
    order = db.query(Order).filter(Order.order_id == shipment.order_id).first()
    if order:
        order.status = "In Transit"
        db.commit()
    
    return new_shipment


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(shipment_id: int, user_id: int, db: Session = Depends(get_db)):
    """Get shipment by ID (only for order owner)"""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Verify user ownership through order
    order = db.query(Order).filter(Order.order_id == shipment.order_id).first()
    if order and order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Shipment belongs to another user")
    
    return shipment


@router.get("/order/{order_id}")
def get_shipment_by_order(order_id: str, db: Session = Depends(get_db)):
    """Get shipment for an order"""
    shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found for order")
    return shipment


@router.put("/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(shipment_id: int, user_id: int, shipment_data: ShipmentUpdate, db: Session = Depends(get_db)):
    """
    Update shipment status (only for order owner).
    
    When status changes, a new blockchain hash is generated to maintain 
    an immutable audit trail of the shipment lifecycle.
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Verify user ownership through order
    order = db.query(Order).filter(Order.order_id == shipment.order_id).first()
    if order and order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Shipment belongs to another user")
    
    if shipment_data.status:
        shipment.status = shipment_data.status
        # ✅ BLOCKCHAIN: Generate new hash on status change
        shipment.blockchain_hash = generate_blockchain_hash(
            shipment_id=shipment.id,
            source=shipment.source,
            destination=shipment.destination,
            distance_km=shipment.distance_km,
            status=shipment.status
        )
    
    if shipment_data.estimated_delivery:
        shipment.estimated_delivery = shipment_data.estimated_delivery
    
    shipment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(shipment)
    
    # Update order status if shipment is delivered
    if shipment_data.status == "DELIVERED":
        order = db.query(Order).filter(Order.order_id == shipment.order_id).first()
        if order:
            order.status = "Delivered"
            db.commit()
    
    return shipment


@router.patch("/{shipment_id}/status")
def update_status(shipment_id: int, update: StatusUpdate, db: Session = Depends(get_db)):
    """
    Update shipment status (patch endpoint).
    
    Generates a new blockchain hash when status changes to maintain 
    immutable audit trail.
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    shipment.status = update.status
    
    # ✅ BLOCKCHAIN: Generate new hash on status change
    shipment.blockchain_hash = generate_blockchain_hash(
        shipment_id=shipment.id,
        source=shipment.source,
        destination=shipment.destination,
        distance_km=shipment.distance_km,
        status=shipment.status
    )
    
    shipment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(shipment)
    
    return shipment


@router.get("/{shipment_id}/predict-delay")
def delay_prediction(shipment_id: int, db: Session = Depends(get_db)):
    """
    Predict delay for a shipment using live maps, traffic, and weather data.
    
    Returns:
        Comprehensive delay prediction including:
        - distance_km: Real route distance
        - base_time_min: Expected travel time
        - traffic_delay_min: Additional delay from congestion
        - weather_delay_min: Additional delay from weather
        - total_delay_min: Total predicted delay
        - risk_level: HIGH, MEDIUM, or LOW
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Check if coordinates are available
    if not shipment.source_coords or not shipment.dest_coords:
        raise HTTPException(
            status_code=400, 
            detail="Shipment coordinates not available for delay prediction"
        )
    
    # Use real-time delay prediction with live APIs
    prediction = predict_delay(
        source_coords=shipment.source_coords,
        dest_coords=shipment.dest_coords,
        destination_city=shipment.destination
    )
    
    # Add shipment context to response
    return {
        "shipment_id": shipment_id,
        "order_id": shipment.order_id,
        "source": shipment.source,
        "destination": shipment.destination,
        "prediction": prediction,
        "estimated_delivery": shipment.estimated_delivery
    }


# ============================================================================
# BLOCKCHAIN VERIFICATION ENDPOINTS
# ============================================================================

@router.get("/ledger/verify/{shipment_id}")
def verify_shipment(shipment_id: int, db: Session = Depends(get_db)):
    """
    Verify shipment integrity using blockchain hash.
    
    This endpoint regenerates the blockchain hash from current shipment data 
    and compares it with the stored hash. If they don't match, it means the 
    shipment data has been tampered with.
    
    Args:
        shipment_id: Unique shipment identifier
    
    Returns:
        {
            'valid': bool - True if shipment is intact, False if tampered
            'stored_hash': str - Hash stored in database
            'current_hash': str - Hash regenerated from current data
            'tampered': bool - True if data has been modified
            'message': str - Human-readable verification result
            'shipment_id': int
            'order_id': str
            'status': str
        }
    
    Example Response (Valid):
        {
            "valid": true,
            "stored_hash": "abc123...",
            "current_hash": "abc123...",
            "tampered": false,
            "message": "Shipment data is intact and has not been tampered with.",
            "shipment_id": 1,
            "order_id": "ORD-001",
            "status": "IN_TRANSIT"
        }
    
    Example Response (Tampered):
        {
            "valid": false,
            "stored_hash": "abc123...",
            "current_hash": "def456...",
            "tampered": true,
            "message": "WARNING: Shipment data has been modified. Original hash does not match.",
            "shipment_id": 1,
            "order_id": "ORD-001",
            "status": "IN_TRANSIT"
        }
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Verify integrity
    verification_result = verify_shipment_integrity(
        shipment_id=shipment.id,
        source=shipment.source,
        destination=shipment.destination,
        distance_km=shipment.distance_km,
        status=shipment.status,
        stored_hash=shipment.blockchain_hash
    )
    
    # Add shipment context to response
    return {
        **verification_result,
        "shipment_id": shipment.id,
        "order_id": shipment.order_id,
        "status": shipment.status
    }


@router.get("/ledger/hash/{shipment_id}")
def get_shipment_hash(shipment_id: int, db: Session = Depends(get_db)):
    """
    Get the blockchain hash for a shipment.
    
    This hash is the immutable fingerprint of the shipment. It changes whenever
    the shipment data (source, destination, distance, or status) changes.
    
    Args:
        shipment_id: Unique shipment identifier
    
    Returns:
        {
            'shipment_id': int,
            'order_id': str,
            'blockchain_hash': str,
            'status': str,
            'source': str,
            'destination': str,
            'distance_km': int,
            'created_at': datetime,
            'updated_at': datetime
        }
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    return {
        "shipment_id": shipment.id,
        "order_id": shipment.order_id,
        "blockchain_hash": shipment.blockchain_hash,
        "status": shipment.status,
        "source": shipment.source,
        "destination": shipment.destination,
        "distance_km": shipment.distance_km,
        "created_at": shipment.created_at,
        "updated_at": shipment.updated_at
    }


@router.get("/ledger/all-hashes/{order_id}")
def get_order_ledger(order_id: str, db: Session = Depends(get_db)):
    """
    Get blockchain hash ledger for all shipments in an order.
    
    This shows the complete immutable audit trail of the order's logistics journey.
    Each shipment with a different status will have a unique hash.
    
    Args:
        order_id: Order identifier
    
    Returns:
        {
            'order_id': str,
            'shipments': [
                {
                    'shipment_id': int,
                    'status': str,
                    'blockchain_hash': str,
                    'created_at': datetime,
                    'updated_at': datetime
                },
                ...
            ],
            'total_shipments': int
        }
    """
    shipments = db.query(Shipment).filter(Shipment.order_id == order_id).all()
    if not shipments:
        raise HTTPException(status_code=404, detail="No shipments found for order")
    
    shipment_hashes = [
        {
            'shipment_id': s.id,
            'status': s.status,
            'blockchain_hash': s.blockchain_hash,
            'source': s.source,
            'destination': s.destination,
            'distance_km': s.distance_km,
            'created_at': s.created_at,
            'updated_at': s.updated_at
        }
        for s in shipments
    ]
    
    return {
        'order_id': order_id,
        'shipments': shipment_hashes,
        'total_shipments': len(shipment_hashes)
    }
