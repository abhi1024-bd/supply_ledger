# Technology Architecture & Integration Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Application (React + TypeScript + Vite)              │
│  ├── Components (React)                                         │
│  ├── State Management (Redux/Zustand)                          │
│  ├── Routing (React Router)                                    │
│  ├── Styling (Tailwind CSS)                                    │
│  └── HTTP Client (Axios)                                       │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP/HTTPS + JSON
                    (CORS Enabled)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Uvicorn ASGI Server (async request handling)                   │
│  CORS Middleware, Request/Response Processing                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FastAPI Framework                                              │
│  ├── Auth Routes (/auth)                                       │
│  │   ├── Login                                                 │
│  │   ├── Logout                                                │
│  │   └── Token Refresh                                         │
│  │                                                              │
│  ├── User Routes (/users)                                      │
│  │   ├── Get Profile                                           │
│  │   ├── Update Profile                                        │
│  │   └── List Users                                            │
│  │                                                              │
│  ├── Order Routes (/orders)                                    │
│  │   ├── Create Order                                          │
│  │   ├── Get Orders                                            │
│  │   └── Update Order Status                                   │
│  │                                                              │
│  ├── Shipment Routes (/shipments)                              │
│  │   ├── Create Shipment                                       │
│  │   ├── Track Shipment                                        │
│  │   └── Verify (Blockchain)                                   │
│  │                                                              │
│  └── Analytics Routes (/analytics)                             │
│      ├── Order Analytics                                        │
│      ├── Shipment Analytics                                     │
│      └── Performance Metrics                                    │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Business Logic & Validation                                   │
│  ├── AuthService                                               │
│  │   ├── User authentication                                   │
│  │   ├── Token generation (JWT)                               │
│  │   └── Permission validation                                 │
│  │                                                              │
│  ├── OrderService                                              │
│  │   ├── Order creation & validation                           │
│  │   ├── Status management                                     │
│  │   └── Cost calculation                                      │
│  │                                                              │
│  ├── ShipmentService                                           │
│  │   ├── Route optimization                                    │
│  │   ├── Tracking updates                                      │
│  │   └── Blockchain recording                                  │
│  │                                                              │
│  ├── UserService                                               │
│  │   ├── User management                                       │
│  │   ├── Role assignment                                       │
│  │   └── Profile updates                                       │
│  │                                                              │
│  └── AnalyticsService                                          │
│      ├── Data aggregation                                       │
│      ├── Report generation                                      │
│      └── Metric calculation                                     │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   UTILITY & INTEGRATION LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI & ML Module (app/ai/)                                       │
│  ├── Delay Prediction Engine                                   │
│  └── Traffic Analysis                                           │
│                                                                  │
│  Blockchain Module (app/blockchain/)                           │
│  ├── Ledger Management                                         │
│  ├── Hash Generation (SHA-256)                                 │
│  └── Verification System                                        │
│                                                                  │
│  External Integrations (app/utils/)                            │
│  ├── Maps Integration (OpenRouteService)                      │
│  │   ├── Route calculation                                     │
│  │   ├── Distance estimation                                   │
│  │   └── ETA prediction                                        │
│  │                                                              │
│  ├── Weather Integration (OpenWeatherMap)                     │
│  │   ├── Current weather                                       │
│  │   ├── Forecasts                                             │
│  │   └── Weather impact factors                                │
│  │                                                              │
│  ├── Traffic Analysis                                          │
│  │   ├── Real-time congestion                                  │
│  │   ├── Historical patterns                                   │
│  │   └── Delay factors                                         │
│  │                                                              │
│  └── Utilities                                                 │
│      ├── Hash utilities (SHA-256)                             │
│      ├── City coordinates (Geocoding)                          │
│      └── Data formatting                                        │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SQLAlchemy ORM                                                │
│  ├── Session Management                                        │
│  ├── Query Building                                            │
│  ├── Relationship Handling                                     │
│  └── Transaction Management                                    │
│                                                                  │
│  Models Definition (app/database/models.py)                   │
│  ├── User Model                                                │
│  ├── Order Model                                               │
│  ├── Shipment Model                                            │
│  ├── Blockchain Ledger Model                                   │
│  └── Analytics Data Models                                     │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PostgreSQL Database                                           │
│  ├── Tables (Users, Orders, Shipments, Ledger)               │
│  ├── Relationships (Foreign Keys)                              │
│  ├── Indexes (Performance Optimization)                        │
│  ├── Transactions (ACID Compliance)                            │
│  └── Backups & Recovery                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Map

### Frontend Technologies
```
React (UI Library)
├── TypeScript (Type Safety)
├── Vite (Build Tool)
├── React Router (Routing)
├── Redux/Zustand (State Management)
├── Axios (HTTP Client)
├── Tailwind CSS (Styling)
├── Jest/Vitest (Testing)
└── React Query (Server State)
```

### Backend Technologies
```
FastAPI (Web Framework)
├── Python (Language)
├── Uvicorn (ASGI Server)
├── SQLAlchemy (ORM)
├── PostgreSQL (Database)
├── Pydantic (Validation)
├── JWT (Authentication)
├── SHA-256 (Hashing/Blockchain)
└── External APIs (Maps, Weather, Traffic)
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
Frontend                                Backend
  │                                        │
  ├── User enters credentials             │
  │                                        │
  ├─────── POST /auth/login ─────────────>│
  │        {email, password}              │
  │                                        │
  │                              AuthService
  │                             ├─ Validate input
  │                             ├─ Query user from DB
  │                             ├─ Hash password match
  │                             ├─ Generate JWT token
  │                             └─ Return token + user
  │                                        │
  │<────── 200 OK + Token ────────────────┤
  │        {access_token, user_data}      │
  │                                        │
  ├─ Store token in localStorage          │
  │                                        │
  ├─ Set Authorization header             │
  │  for subsequent requests              │
  │                                        │
  └─ Redirect to Dashboard                │
```

### 2. Shipment Creation & Tracking Flow

```
Frontend                                Backend                        External
  │                                        │                              │
  ├── User creates shipment               │                              │
  │                                        │                              │
  ├─────── POST /shipments ──────────────>│                              │
  │        {source, destination, items}   │                              │
  │                                        │ ShipmentService              │
  │                                        ├─ Validate data              │
  │                                        ├─ Extract coordinates        │
  │                                        │                              │
  │                                        ├─────────────────────────────>│
  │                                        │  Maps API                    │
  │                                        │  Get route & distance        │
  │                                        │<─────────────────────────────┤
  │                                        │                              │
  │                                        ├─────────────────────────────>│
  │                                        │  Weather API                 │
  │                                        │  Get weather conditions      │
  │                                        │<─────────────────────────────┤
  │                                        │                              │
  │                                        ├─ Predict delays (AI)        │
  │                                        │                              │
  │                                        ├─ Create blockchain entry    │
  │                                        ├─ Save to database           │
  │                                        │                              │
  │<────── 201 Created ────────────────────┤                              │
  │        {shipment_id, tracking_number}  │                              │
  │                                        │                              │
  └─ Display tracking dashboard           │                              │
     with real-time updates               │                              │
```

### 3. Delay Prediction Flow

```
Frontend                Backend              AI Module              External APIs
  │                      │                      │                        │
  │  Request tracking    │                      │                        │
  │  with prediction     │                      │                        │
  ├──────────────────────>│                      │                        │
  │                      │                      │                        │
  │                      │ DelayPrediction()    │                        │
  │                      ├─────────────────────>│                        │
  │                      │                      │                        │
  │                      │                      ├──────────────────────> │
  │                      │                      │ Get route data         │
  │                      │                      │<───────────────────────┤
  │                      │                      │ (distance, duration)   │
  │                      │                      │                        │
  │                      │                      ├──────────────────────> │
  │                      │                      │ Get weather data       │
  │                      │                      │<───────────────────────┤
  │                      │                      │ (conditions, wind)     │
  │                      │                      │                        │
  │                      │                      ├─ Calculate factors    │
  │                      │                      ├─ Compute delay (min)   │
  │                      │                      ├─ Determine risk level  │
  │                      │                      │                        │
  │                      │<─────────────────────┤                        │
  │                      │ Delay prediction     │                        │
  │<──────────────────────┤ {delay, risk, ETA}  │                        │
  │                      │                      │                        │
  └─ Update UI with      │                      │                        │
     delay estimate      │                      │                        │
```

### 4. Blockchain Recording Flow

```
Frontend              Backend              Blockchain Module        Database
  │                    │                        │                     │
  ├─ Shipment event    │                        │                     │
  ├──────────────────>│                        │                     │
  │  (status update)   │                        │                     │
  │                    │ RecordToLedger()       │                     │
  │                    ├──────────────────────> │                     │
  │                    │                        │                     │
  │                    │                        ├─ Format data       │
  │                    │                        ├─ Hash using SHA-256 │
  │                    │                        │                     │
  │                    │                        │<─ Link to previous ─┤
  │                    │                        │  block/entry        │
  │                    │                        │                     │
  │                    │                        ├─────────────────────>│
  │                    │                        │  Save ledger entry   │
  │                    │                        │<─────────────────────┤
  │                    │<──────────────────────┤                     │
  │                    │  {block_hash, verified}│                     │
  │                    │                        │                     │
  │<─────────────────ю┤                        │                     │
  │  Confirmation      │                        │                     │
  │                    │                        │                     │
  └─ Update UI         │                        │                     │
     (Verified badge)  │                        │                     │
```

---

## API Request/Response Cycle

### Request Processing

```
1. HTTP Request
   ├─ Method: GET/POST/PUT/DELETE
   ├─ Headers: {Authorization: "Bearer token"}
   ├─ Body: JSON data
   └─ Endpoint: /api/resource

2. Uvicorn (ASGI Server)
   └─ Async request handling

3. Middleware Processing
   ├─ CORS validation
   ├─ Request logging
   └─ Header processing

4. FastAPI Routing
   └─ Match endpoint to handler

5. Dependency Injection
   ├─ Extract JWT token
   ├─ Validate token
   ├─ Get current user
   └─ Get database session

6. Path Operation Handler
   ├─ Validate input (Pydantic)
   ├─ Call service layer
   └─ Prepare response

7. Service Layer
   ├─ Business logic
   ├─ Data access
   └─ External API calls

8. Data Access Layer
   ├─ SQLAlchemy queries
   ├─ Database operations
   └─ Transaction management

9. Response Generation
   ├─ Serialize data
   ├─ Status code
   └─ Headers

10. Return to Client
    └─ JSON response
```

---

## Technology Decision Matrix

### Backend Framework Selection

| Criteria | FastAPI | Django | Flask | Node.js |
|----------|---------|--------|-------|---------|
| **API Development** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Learning Curve** | Easy | Medium | Easy | Medium |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Community** | Growing | Large | Large | Very Large |

**Decision: FastAPI** ✅
- Modern Python framework
- Excellent for REST APIs
- Built-in validation & documentation
- High performance with async support

---

### Frontend Framework Selection

| Criteria | React | Vue | Angular | Svelte |
|----------|-------|-----|---------|--------|
| **Learning** | Medium | Easy | Hard | Easy |
| **Job Market** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Ecosystem** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Community** | Very Large | Large | Large | Growing |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Decision: React** ✅
- Largest ecosystem & community
- Best job market opportunities
- Extensive library options
- Mature and stable

---

## Integration Points

### API Integration
```
Backend Endpoint: http://localhost:8000/api/shipments
Frontend Request: 
  GET /shipments
  Headers: {Authorization: Bearer <JWT_TOKEN>}
  
Backend Response:
  200 OK
  {
    "id": 1,
    "tracking_number": "SL123456",
    "status": "in-transit",
    "estimated_delay": 15,
    "risk_level": "LOW"
  }
```

### Database Interaction
```
Frontend → Backend → SQLAlchemy → PostgreSQL

Example:
1. Frontend requests shipment details
2. FastAPI route handler receives request
3. Validates JWT token
4. Calls ShipmentService
5. ShipmentService uses SQLAlchemy to query
6. SQLAlchemy generates SQL
7. PostgreSQL executes query
8. Results returned through layers
9. Serialized to JSON
10. Sent to frontend
```

### External API Integration
```
Backend → External Services

Maps:
  ShipmentService
  └─ get_route_data()
     └─ requests.get("https://api.openrouteservice.org/...")

Weather:
  DelayPredictionEngine
  └─ get_weather_factor()
     └─ requests.get("https://api.openweathermap.org/...")

Traffic:
  DelayPredictionEngine
  └─ get_traffic_factor()
     └─ Custom algorithm based on distance/time
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend (npm run dev)
│   └── React + Vite + TypeScript
├── Backend (uvicorn app.main:app --reload)
│   └── FastAPI + Python
└── Database (PostgreSQL local)
    └── Port 5432
```

### Production Environment
```
Cloud Platform (AWS/Azure/GCP)
├── Frontend Container
│   ├── Nginx (reverse proxy)
│   ├── React build artifacts
│   └── SSL/TLS certificates
│
├── Backend Container
│   ├── FastAPI application
│   ├── Gunicorn (production server)
│   ├── Environment variables
│   └── Logging & monitoring
│
├── Database
│   ├── Managed PostgreSQL
│   ├── Automated backups
│   ├── High availability
│   └── Read replicas
│
└── Additional Services
    ├── CDN (for static assets)
    ├── Load balancer
    ├── Monitoring & logging
    └── CI/CD pipeline
```

---

## Summary Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Presentation** | React | 18.x | User Interface |
| **Build** | Vite | 4.x | Frontend bundling |
| **Language (FE)** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Utility CSS |
| **Routing** | React Router | 6.x | Client-side navigation |
| **State** | Redux/Zustand | Latest | State management |
| **HTTP** | Axios | Latest | API communication |
| **Framework** | FastAPI | 0.104.1 | REST API |
| **Server** | Uvicorn | 0.24.0 | ASGI server |
| **Language (BE)** | Python | 3.8+ | Backend logic |
| **ORM** | SQLAlchemy | 2.0.23 | Database mapping |
| **Validation** | Pydantic | 2.5.0 | Input validation |
| **Database** | PostgreSQL | 13+ | Data storage |
| **Auth** | JWT | - | Authentication |
| **Blockchain** | SHA-256 | - | Data integrity |

---

For detailed module-specific documentation, refer to individual module guides.
