from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Order, OrderAnalytics
from app.schemas import OrderAnalyticsResponse, DashboardStats

router = APIRouter()


@router.get("/dashboard/{user_id}", response_model=DashboardStats)
def get_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    """Get dashboard statistics for a user"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    stats = {
        "total_shipments": len(orders),
        "in_transit": len([o for o in orders if o.status == "In Transit"]),
        "delivered": len([o for o in orders if o.status == "Delivered"]),
        "pending": len([o for o in orders if o.status == "Pending"])
    }
    
    return stats


@router.get("/user-analytics/{user_id}", response_model=OrderAnalyticsResponse)
def get_user_analytics(user_id: int, db: Session = Depends(get_db)):
    """Get detailed analytics for a user"""
    analytics = db.query(OrderAnalytics).filter(OrderAnalytics.user_id == user_id).first()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics not found")
    
    return analytics


@router.get("/order-status-breakdown/{user_id}")
def get_status_breakdown(user_id: int, db: Session = Depends(get_db)):
    """Get order status breakdown"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    breakdown = {
        "delivered": len([o for o in orders if o.status == "Delivered"]),
        "in_transit": len([o for o in orders if o.status == "In Transit"]),
        "pending": len([o for o in orders if o.status == "Pending"])
    }
    
    return breakdown


@router.get("/priority-breakdown/{user_id}")
def get_priority_breakdown(user_id: int, db: Session = Depends(get_db)):
    """Get priority level breakdown"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    breakdown = {
        "critical": len([o for o in orders if o.priority == "critical"]),
        "high": len([o for o in orders if o.priority == "high"]),
        "medium": len([o for o in orders if o.priority == "medium"]),
        "low": len([o for o in orders if o.priority == "low"])
    }
    
    return breakdown


@router.get("/destination-breakdown/{user_id}")
def get_destination_breakdown(user_id: int, db: Session = Depends(get_db)):
    """Get top destinations by order count"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    destinations = {}
    for order in orders:
        if order.destination not in destinations:
            destinations[order.destination] = 0
        destinations[order.destination] += 1
    
    # Sort and return top 5
    sorted_destinations = sorted(destinations.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "destinations": [
            {"name": dest, "orders": count}
            for dest, count in sorted_destinations
        ]
    }


@router.get("/value-metrics/{user_id}")
def get_value_metrics(user_id: int, db: Session = Depends(get_db)):
    """Get shipment value metrics"""
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    total_value = sum(o.value for o in orders)
    avg_value = total_value / len(orders) if orders else 0
    
    return {
        "total_value": total_value,
        "average_value": avg_value,
        "total_orders": len(orders)
    }
