from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from datetime import datetime
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    company_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    account_type = Column(String, default="Standard")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, index=True)
    origin = Column(String)
    destination = Column(String)
    weight = Column(Float)
    priority = Column(String, default="medium")
    status = Column(String, default="Pending")
    due_date = Column(DateTime)
    value = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)
    source = Column(String)
    destination = Column(String)
    source_coords = Column(JSON, nullable=True)  # [longitude, latitude]
    dest_coords = Column(JSON, nullable=True)    # [longitude, latitude]
    distance_km = Column(Integer)
    status = Column(String)
    blockchain_hash = Column(String, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrderAnalytics(Base):
    __tablename__ = "order_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    total_orders = Column(Integer, default=0)
    completed_orders = Column(Integer, default=0)
    in_transit_orders = Column(Integer, default=0)
    pending_orders = Column(Integer, default=0)
    cancelled_orders = Column(Integer, default=0)
    total_shipment_value = Column(Float, default=0)
    average_order_value = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
