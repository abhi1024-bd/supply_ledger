from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.database import get_db
from app.database.models import Order, OrderAnalytics
from app.schemas import OrderCreate, OrderResponse, OrderUpdate
import uuid

router = APIRouter()


def generate_order_id():
    """Generate unique order ID"""
    return f"ORD-{str(uuid.uuid4())[:8].upper()}"


@router.post("/create", response_model=OrderResponse)
def create_order(user_id: int, order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    order_id = generate_order_id()
    
    # Calculate order value: weight * 100 (base price per kg)
    order_value = order_data.weight * 100
    
    new_order = Order(
        order_id=order_id,
        user_id=user_id,
        origin=order_data.origin,
        destination=order_data.destination,
        weight=order_data.weight,
        priority=order_data.priority,
        due_date=order_data.due_date,
        status="Pending",
        value=order_value
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Update analytics
    update_user_analytics(user_id, db)
    
    return new_order


@router.get("/list/{user_id}")
def list_orders(user_id: int, db: Session = Depends(get_db)):
    """Get all orders for a user"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return orders


@router.get("/detail/{order_id}", response_model=OrderResponse)
def get_order_details(order_id: str, user_id: int, db: Session = Depends(get_db)):
    """Get order details by order ID (only for owner)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user ownership
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Order belongs to another user")
    
    return order


@router.put("/update/{order_id}", response_model=OrderResponse)
def update_order(order_id: str, user_id: int, order_data: OrderUpdate, db: Session = Depends(get_db)):
    """Update order status (only for owner)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user ownership
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Order belongs to another user")
    
    if order_data.status:
        order.status = order_data.status
    if order_data.priority:
        order.priority = order_data.priority
    if order_data.due_date:
        order.due_date = order_data.due_date
    
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    
    # Update analytics
    update_user_analytics(order.user_id, db)
    
    return order


@router.get("/stats/{user_id}")
def get_order_stats(user_id: int, db: Session = Depends(get_db)):
    """Get order statistics for a user"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    stats = {
        "total_orders": len(orders),
        "delivered": len([o for o in orders if o.status == "Delivered"]),
        "in_transit": len([o for o in orders if o.status == "In Transit"]),
        "pending": len([o for o in orders if o.status == "Pending"]),
        "total_value": sum(o.value for o in orders),
        "average_value": sum(o.value for o in orders) / len(orders) if orders else 0
    }
    
    return stats


@router.put("/cancel/{order_id}", response_model=OrderResponse)
def cancel_order(order_id: str, user_id: int, db: Session = Depends(get_db)):
    """Cancel an order (only for owner)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user ownership
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Order belongs to another user")
    
    if order.status == "Delivered":
        raise HTTPException(status_code=400, detail="Cannot cancel a delivered order")
    
    if order.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Order is already cancelled")
    
    order.status = "Cancelled"
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    
    # Update analytics
    update_user_analytics(order.user_id, db)
    
    return order


@router.delete("/delete/{order_id}")
def delete_order(order_id: str, user_id: int, db: Session = Depends(get_db)):
    """Delete an order (only for owner)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user ownership
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized - Order belongs to another user")
    
    user_id_temp = order.user_id
    db.delete(order)
    db.commit()
    
    # Update analytics
    update_user_analytics(user_id_temp, db)
    
    return {"message": "Order deleted successfully"}


def update_user_analytics(user_id: int, db: Session):
    """Update user order analytics"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    analytics = db.query(OrderAnalytics).filter(OrderAnalytics.user_id == user_id).first()
    
    total_value = sum(o.value for o in orders)
    
    if analytics:
        analytics.total_orders = len(orders)
        analytics.completed_orders = len([o for o in orders if o.status == "Delivered"])
        analytics.in_transit_orders = len([o for o in orders if o.status == "In Transit"])
        analytics.pending_orders = len([o for o in orders if o.status == "Pending"])
        analytics.cancelled_orders = len([o for o in orders if o.status == "Cancelled"])
        analytics.total_shipment_value = total_value
        analytics.average_order_value = total_value / len(orders) if orders else 0
        analytics.updated_at = datetime.utcnow()
    else:
        analytics = OrderAnalytics(
            user_id=user_id,
            total_orders=len(orders),
            completed_orders=len([o for o in orders if o.status == "Delivered"]),
            in_transit_orders=len([o for o in orders if o.status == "In Transit"]),
            pending_orders=len([o for o in orders if o.status == "Pending"]),
            cancelled_orders=len([o for o in orders if o.status == "Cancelled"]),
            total_shipment_value=total_value,
            average_order_value=total_value / len(orders) if orders else 0
        )
        db.add(analytics)
    
    db.commit()
