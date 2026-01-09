from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    email: str
    name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserResponse(UserBase):
    id: int
    account_type: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    origin: str
    destination: str
    weight: float
    priority: str = "medium"
    due_date: datetime


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


class OrderResponse(OrderBase):
    id: int
    order_id: str
    user_id: int
    status: str
    value: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShipmentBase(BaseModel):
    order_id: str
    source: str
    destination: str
    distance_km: int


class ShipmentCreate(ShipmentBase):
    source_coords: Optional[List[float]] = None  # [longitude, latitude]
    dest_coords: Optional[List[float]] = None    # [longitude, latitude]


class ShipmentUpdate(BaseModel):
    status: Optional[str] = None
    estimated_delivery: Optional[datetime] = None


class ShipmentResponse(ShipmentBase):
    id: int
    status: str
    blockchain_hash: Optional[str]
    estimated_delivery: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderAnalyticsResponse(BaseModel):
    id: int
    user_id: int
    total_orders: int
    completed_orders: int
    in_transit_orders: int
    pending_orders: int
    total_shipment_value: float
    average_order_value: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_shipments: int
    in_transit: int
    delivered: int
    pending: int


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    role: str
