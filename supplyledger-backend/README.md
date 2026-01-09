# SupplyLedger Backend - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Setup & Installation](#setup--installation)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Key Features](#key-features)
8. [Module Documentation](#module-documentation)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**SupplyLedger** is a blockchain-powered, AI-enabled supply chain management system designed for MSMEs (Micro, Small & Medium Enterprises). It provides:

- **Real-time Shipment Tracking** with blockchain-based verification
- **AI-powered Delay Prediction** using live traffic and weather data
- **Supply Chain Analytics** for data-driven decision making
- **User Management** with role-based access (Supplier, Distributor, Retailer)
- **Order Management** with real-time status updates

### Key Benefits
- **Zero-Cost Verification**: Blockchain principles without transaction fees
- **Tamper Detection**: SHA-256 hashing ensures data integrity
- **Intelligent Routing**: Real-time delay predictions help optimize logistics
- **Regulatory Compliance**: Immutable audit trails for disputes and insurance claims

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI 0.104.1 |
| **Server** | Uvicorn (ASGI) |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy 2.0.23 |
| **Validation** | Pydantic 2.5.0 |
| **Authentication** | JWT (Bearer tokens) |
| **External APIs** | OpenRouteService, OpenWeatherMap |
| **Blockchain** | SHA-256 hashing for immutability |
| **Python Version** | 3.8+ |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│               Frontend (React/Vite)                 │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────┐
│          FastAPI Backend (Python)                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │   Route Layer (Routers)                     │   │
│  │  - Auth Routes     - Order Routes           │   │
│  │  - User Routes     - Shipment Routes        │   │
│  │  - Analytics Routes                         │   │
│  └─────────────────────────────────────────────┘   │
│                     │                                │
│  ┌─────────────────▼─────────────────────────┐    │
│  │   Service Layer (Business Logic)          │    │
│  │  - Auth Service     - Order Service       │    │
│  │  - User Service     - Shipment Service    │    │
│  └─────────────────────────────────────────────┘   │
│                     │                                │
│  ┌─────────────────▼─────────────────────────┐    │
│  │   Utility Layer                            │    │
│  │  - Blockchain (ledger.py, verify.py)      │    │
│  │  - Maps & Routes (maps.py)                │    │
│  │  - Weather (weather.py)                   │    │
│  │  - Traffic (traffic.py)                   │    │
│  │  - AI/Delay Prediction (delay_pred.py)   │    │
│  └─────────────────────────────────────────────┘   │
│                     │                                │
│  ┌─────────────────▼─────────────────────────┐    │
│  │   Data Layer (SQLAlchemy ORM)              │    │
│  │  - Models    - Database Connection        │    │
│  └─────────────────────────────────────────────┘   │
│                     │                                │
└────────────────────┼────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐    ┌────▼──┐    ┌────▼────┐
   │  PostgreSQL  │ ORS API  │ OWM API  │
   │  Database    │ (Maps)   │ (Weather)│
   └─────────────┘ └─────────┘ └─────────┘
```

### Data Flow Example: Order Creation → Shipment Tracking → Delay Prediction

```
1. User Creates Order (Frontend)
   ↓
2. POST /orders → OrderService.create_order()
   - Validates order data
   - Creates Order record in DB
   - Generates unique order_id
   ↓
3. Shipment Created
   - POST /shipments → ShipmentService.create_shipment()
   - Geocodes source/destination
   - Generates blockchain hash
   ↓
4. Real-Time Delay Prediction
   - GET /shipments/{id}/predict-delay
   - Fetches route data from OpenRouteService
   - Gets weather data from OpenWeatherMap
   - Calculates traffic factor
   - Predicts delay with risk classification
   ↓
5. Analytics & Dashboard
   - GET /analytics/summary
   - Aggregates orders, shipments, delays
   - Returns insights for decision-making
```

---

## Setup & Installation

### Prerequisites
- Python 3.8 or higher
- PostgreSQL 12+ (or compatible database)
- pip package manager
- Virtual environment tool (venv or conda)

### Step 1: Clone & Navigate
```bash
cd supplyledger-backend
```

### Step 2: Create Virtual Environment
```bash
# Using venv
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/supplyledger

# JWT
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRY_MINUTES=30

# External APIs
OPENROUTE_API_KEY=your_openroute_service_key
OPENWEATHER_API_KEY=your_openweather_api_key

# Server
ENVIRONMENT=development
DEBUG=true
```

### Step 5: Initialize Database
```bash
# Run migrations (if using Alembic)
alembic upgrade head

# Or create tables manually
python -c "from app.database.database import engine; from app.database.models import Base; Base.metadata.create_all(bind=engine)"
```

### Step 6: Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### API Documentation
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

---

## Database Schema

### Users Table
```
users
├── id (Primary Key)
├── email (Unique, Indexed)
├── password (Hashed)
├── name
├── company_name
├── phone
├── address
├── account_type (enum: Standard, Premium, Enterprise)
├── is_active (Boolean)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

### Orders Table
```
orders
├── id (Primary Key)
├── order_id (Unique, Indexed) - Human readable ID
├── user_id (Foreign Key → users.id)
├── origin (City name)
├── destination (City name)
├── weight (Float, kg)
├── priority (enum: low, medium, high, urgent)
├── status (enum: Pending, Confirmed, In-Transit, Delivered)
├── due_date (DateTime)
├── value (Float, Currency)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

### Shipments Table
```
shipments
├── id (Primary Key)
├── order_id (Foreign Key → orders.order_id)
├── source (City name)
├── destination (City name)
├── source_coords (JSON: [longitude, latitude])
├── dest_coords (JSON: [longitude, latitude])
├── distance_km (Integer)
├── status (enum: In-Transit, Delayed, Delivered)
├── blockchain_hash (SHA-256 hash)
├── estimated_delivery (DateTime)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

### Relationships
```
User (1) ─────────────── (Many) Order
         user_id

Order (1) ─────────────── (Many) Shipment
         order_id
```

---

## API Endpoints

### Authentication Module (`/auth`)

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response: { "message": "Logout successful" }
```

---

### User Module (`/users`)

#### Register New User
```http
POST /users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "John Doe",
  "company_name": "Doe Logistics",
  "phone": "+91-9999999999",
  "address": "Mumbai, India"
}

Response: { "id": 1, "email": "...", ... }
```

#### Get User Profile
```http
GET /users/profile/{user_id}
Authorization: Bearer {token}

Response: { "id": 1, "email": "...", "name": "...", ... }
```

#### Update Profile
```http
PUT /users/profile/{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+91-8888888888"
}

Response: { "id": 1, "email": "...", ... }
```

---

### Order Module (`/orders`)

#### Create Order
```http
POST /orders/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "origin": "Mumbai",
  "destination": "Delhi",
  "weight": 500.5,
  "priority": "high",
  "due_date": "2026-01-20T18:00:00"
}

Response: { 
  "id": 1,
  "order_id": "ORD-2026-001",
  "status": "Pending",
  ...
}
```

#### Get Order Details
```http
GET /orders/{order_id}
Authorization: Bearer {token}

Response: { "id": 1, "order_id": "ORD-2026-001", ... }
```

#### List User Orders
```http
GET /orders/user/{user_id}
Authorization: Bearer {token}

Response: [
  { "id": 1, "order_id": "ORD-2026-001", ... },
  { "id": 2, "order_id": "ORD-2026-002", ... }
]
```

#### Update Order Status
```http
PUT /orders/{order_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "In-Transit",
  "priority": "urgent"
}

Response: { "id": 1, "status": "In-Transit", ... }
```

---

### Shipment Module (`/shipments`)

#### Create Shipment
```http
POST /shipments/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": "ORD-2026-001",
  "source": "Mumbai",
  "destination": "Delhi",
  "distance_km": 1500,
  "source_coords": [72.8479, 19.0760],
  "dest_coords": [77.2090, 28.7041]
}

Response: { 
  "id": 1,
  "order_id": "ORD-2026-001",
  "blockchain_hash": "a3f2d8c...",
  ...
}
```

#### Get Shipment Details
```http
GET /shipments/{shipment_id}
Authorization: Bearer {token}

Response: { "id": 1, "order_id": "ORD-2026-001", ... }
```

#### Predict Delay
```http
GET /shipments/{shipment_id}/predict-delay
Authorization: Bearer {token}

Response: {
  "shipment_id": 1,
  "order_id": "ORD-2026-001",
  "base_time_minutes": 45,
  "traffic_delay_minutes": 12,
  "weather_delay_minutes": 8,
  "total_delay_minutes": 20,
  "risk_level": "MEDIUM",
  "route_details": {
    "distance_km": 1500,
    "expected_duration": "45 mins",
    "current_traffic": "Moderate"
  },
  "weather_conditions": {
    "condition": "Light Rain",
    "impact_factor": 0.15
  }
}
```

#### Update Shipment Status
```http
PUT /shipments/{shipment_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Delivered",
  "estimated_delivery": "2026-01-18T14:00:00"
}

Response: { "id": 1, "status": "Delivered", ... }
```

#### Verify Blockchain Hash
```http
GET /shipments/{shipment_id}/verify
Authorization: Bearer {token}

Response: {
  "shipment_id": 1,
  "is_valid": true,
  "stored_hash": "a3f2d8c...",
  "calculated_hash": "a3f2d8c...",
  "message": "Shipment data is authentic and unaltered"
}
```

---

### Analytics Module (`/analytics`)

#### Get Summary Analytics
```http
GET /analytics/summary
Authorization: Bearer {token}

Response: {
  "total_orders": 150,
  "completed_orders": 120,
  "pending_orders": 20,
  "in_transit_orders": 10,
  "average_delivery_time": 3.5,
  "on_time_percentage": 94.5,
  "total_shipments": 150,
  "delayed_shipments": 8
}
```

#### Get Order Analytics
```http
GET /analytics/orders/{user_id}
Authorization: Bearer {token}

Response: {
  "user_id": 1,
  "total_orders": 50,
  "completed_orders": 45,
  "completion_rate": 90,
  "average_value": 25000,
  "total_value": 1250000
}
```

#### Get Delay Analytics
```http
GET /analytics/delays/{user_id}
Authorization: Bearer {token}

Response: {
  "user_id": 1,
  "total_shipments": 50,
  "delayed_shipments": 5,
  "delay_rate": 10,
  "average_delay_minutes": 45,
  "risk_distribution": {
    "LOW": 40,
    "MEDIUM": 8,
    "HIGH": 2
  }
}
```

---

## Key Features

### 1. Blockchain-Based Verification ✓
- **SHA-256 Hashing**: Each shipment gets a cryptographic fingerprint
- **Tamper Detection**: Any data modification changes the hash
- **Zero Transaction Cost**: No blockchain fees, instant verification
- **Immutable Audit Trail**: All changes are tracked and logged

**Implementation**: See `app/blockchain/ledger.py` and `app/blockchain/verify.py`

### 2. AI-Powered Delay Prediction ✓
- **Real-Time Data Integration**: OpenRouteService + OpenWeatherMap APIs
- **Multi-Factor Analysis**:
  - Traffic congestion from route data
  - Weather conditions (clear, rain, storm)
  - Seasonal delays
  - Distance and priority weighting
- **Risk Classification**: LOW (<20 min) | MEDIUM (20-45 min) | HIGH (>45 min)

**Implementation**: See `app/ai/delay_prediction.py`

### 3. Multi-Role User Management ✓
- **Account Types**: Standard, Premium, Enterprise
- **Role-Based Access**: Different permissions for suppliers, distributors, retailers
- **JWT Authentication**: Secure token-based authentication
- **User Profiles**: Company info, contact details, address

**Implementation**: See `app/users/` and `app/auth/`

### 4. Order & Shipment Management ✓
- **Full Lifecycle Tracking**: Pending → Confirmed → In-Transit → Delivered
- **Real-Time Status Updates**: WebSocket-ready architecture
- **Priority-Based Routing**: high, medium, low, urgent
- **Geolocation Support**: Source and destination coordinates

**Implementation**: See `app/orders/` and `app/shipments/`

### 5. Advanced Analytics ✓
- **Order Analytics**: Total, completed, pending, in-transit
- **Performance Metrics**: On-time delivery %, average delivery time
- **Delay Analytics**: Risk distribution, delay patterns
- **User-Level Insights**: Per-company metrics and KPIs

**Implementation**: See `app/analytics/`

---

## Module Documentation

### Authentication & Authorization (`app/auth/`)

**Purpose**: Secure user login and JWT token generation

**Files**:
- `auth_routes.py` - API endpoints
- `auth_service.py` - Business logic

**Key Functions**:
```python
def login_user(email, password) -> dict
  # Validates credentials, generates JWT token

def verify_token(token) -> dict
  # Validates JWT, returns user info
```

---

### User Management (`app/users/`)

**Purpose**: User registration, profile management

**Files**:
- `user_routes.py` - API endpoints
- `user_service.py` - Business logic

**Key Functions**:
```python
def register_user(email, password, name, ...) -> User
  # Creates new user with hashed password

def get_user_profile(user_id) -> User
  # Retrieves full user profile

def update_profile(user_id, updates) -> User
  # Updates user information
```

---

### Order Management (`app/orders/`)

**Purpose**: Order creation, status tracking, lifecycle management

**Files**:
- `order_routes.py` - API endpoints
- `order_service.py` - Business logic

**Key Functions**:
```python
def create_order(user_id, order_data) -> Order
  # Creates order with validation

def get_order(order_id) -> Order
  # Retrieves order details

def update_order_status(order_id, new_status) -> Order
  # Updates order status with timestamp
```

---

### Shipment Management (`app/shipments/`)

**Purpose**: Shipment tracking, blockchain verification, delay prediction

**Files**:
- `shipment_routes.py` - API endpoints
- `shipment_service.py` - Business logic
- `shipment_model.py` - Data models

**Key Functions**:
```python
def create_shipment(order_id, source, destination, ...) -> Shipment
  # Creates shipment, generates blockchain hash

def predict_delay(shipment_id) -> dict
  # Returns delay prediction with risk level

def verify_shipment(shipment_id) -> bool
  # Verifies blockchain hash integrity
```

---

### Blockchain Module (`app/blockchain/`)

**Purpose**: SHA-256 hashing and immutable record verification

**Files**:
- `ledger.py` - Hash generation
- `verify.py` - Hash verification

**Key Functions**:
```python
def generate_blockchain_hash(shipment_id, source, dest, ...) -> str
  # Generates SHA-256 hash of shipment data

def verify_shipment_integrity(stored_hash, current_data) -> bool
  # Compares stored vs. calculated hash
```

**Example**:
```python
# Generate hash
hash_value = generate_blockchain_hash(
  shipment_id=1,
  source="Mumbai",
  destination="Delhi",
  distance_km=1500,
  status="In-Transit"
)
# Output: "a3f2d8c9e1b4f7a2c5d8e1f4a7b0c3d6..."

# Verify (if data unchanged)
is_valid = verify_shipment_integrity(stored_hash, current_data)
# Output: True
```

---

### Delay Prediction Module (`app/ai/`)

**Purpose**: Intelligent shipping delay prediction using live data

**Files**:
- `delay_prediction.py` - Main prediction logic
- `train_model.py` - Model training (reference)

**Algorithm**:
```
Base Time = Route Duration (from OpenRouteService)
Traffic Delay = Base Time × Traffic Factor (0.0-0.3)
Weather Delay = Base Time × Weather Factor (0.0-0.3)
Total Delay = Traffic Delay + Weather Delay

Risk Classification:
  - LOW: Total Delay < 20 minutes
  - MEDIUM: 20 ≤ Total Delay ≤ 45 minutes
  - HIGH: Total Delay > 45 minutes
```

**Example**:
```python
delay_info = predict_delay(
  source_coords=[72.8479, 19.0760],
  dest_coords=[77.2090, 28.7041],
  destination_city="Delhi"
)
# Returns: {
#   "base_time_minutes": 45,
#   "traffic_delay_minutes": 12,
#   "weather_delay_minutes": 8,
#   "total_delay_minutes": 20,
#   "risk_level": "MEDIUM"
# }
```

---

### Utility Modules (`app/utils/`)

#### Maps & Routes (`maps.py`)
- Integrates with OpenRouteService API
- Returns distance and duration for routes
- Fallback: Haversine formula for estimation

#### Weather (`weather.py`)
- Fetches current weather from OpenWeatherMap
- Maps weather conditions to delay factors
- Returns weather impact multiplier

#### Traffic (`traffic.py`)
- Calculates traffic congestion factor
- Compares actual vs. expected duration
- Returns traffic impact on delivery time

#### Hash Utilities (`hash_utils.py`)
- SHA-256 hashing functions
- Data serialization for hashing

---

### Analytics Module (`app/analytics/`)

**Purpose**: Data aggregation and business intelligence

**Key Endpoints**:
- `/analytics/summary` - Overall system metrics
- `/analytics/orders/{user_id}` - User order statistics
- `/analytics/delays/{user_id}` - Delay analysis and patterns

---

### Database Module (`app/database/`)

**Purpose**: Database connection and ORM configuration

**Files**:
- `database.py` - SQLAlchemy configuration, session management
- `models.py` - SQLAlchemy ORM models

**Configuration**:
```python
# From database.py
DATABASE_URL = "postgresql://user:password@localhost:5432/supplyledger"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

---

## Deployment

### Production Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Use strong `SECRET_KEY` (generate with `openssl rand -hex 32`)
- [ ] Configure PostgreSQL with proper backups
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Enable CORS for your frontend domain only
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t supplyledger-backend .
docker run -p 8000:8000 --env-file .env supplyledger-backend
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: could not connect to server: Connection refused
```
**Solution**:
- Check PostgreSQL is running: `psql --version`
- Verify DATABASE_URL in `.env`
- Check credentials and port 5432

#### 2. API Key Errors
```
Error: Invalid OpenRouteService API key
```
**Solution**:
- Get API key from https://openrouteservice.org
- Add to `.env`: `OPENROUTE_API_KEY=your_key`

#### 3. CORS Errors
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**:
- Already configured in `app/main.py`
- Update `allow_origins` for specific domains in production

#### 4. JWT Token Invalid
```
Error: Could not validate credentials
```
**Solution**:
- Token might be expired (default: 30 minutes)
- User needs to login again
- Check `ACCESS_TOKEN_EXPIRY_MINUTES` in `.env`

#### 5. Port Already in Use
```
Error: Address already in use
```
**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn app.main:app --port 8001
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy ORM Documentation](https://docs.sqlalchemy.org)
- [Pydantic Validation](https://docs.pydantic.dev)
- [OpenRouteService API](https://openrouteservice.org)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [JWT Authentication Guide](https://en.wikipedia.org/wiki/JSON_Web_Token)

---

## Support & Contact

For issues, feature requests, or questions:
- Check existing documentation files
- Review API error messages carefully
- Check logs: `app.log`
- Contact development team

---

**Last Updated**: January 2026
**Version**: 1.0
