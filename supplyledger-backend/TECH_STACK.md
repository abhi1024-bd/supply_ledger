# SupplyLedger - Complete Tech Stack Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Technologies](#backend-technologies)
3. [Frontend Technologies](#frontend-technologies)
4. [External Integrations](#external-integrations)
5. [Development & Deployment](#development--deployment)
6. [Architecture & Design Patterns](#architecture--design-patterns)
7. [Security & Authentication](#security--authentication)
8. [Technology Comparison & Rationale](#technology-comparison--rationale)

---

## Overview

**SupplyLedger** is a full-stack supply chain management platform combining:
- **Blockchain-based** verification (SHA-256 hashing)
- **AI-powered** delay prediction
- **Real-time** tracking and analytics
- **RESTful API** backend with modern frontend

This document outlines all technologies, frameworks, and tools used in both backend and frontend development.

---

## Backend Technologies

### 1. **Core Framework**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.104.1 | Modern Python web framework for building REST APIs |
| **Uvicorn** | 0.24.0 | ASGI (Asynchronous Server Gateway Interface) web server |
| **Python** | 3.8+ | Programming language |

**Why FastAPI?**
- Fast (high performance comparable to Node.js and Go)
- Easy to learn and use
- Built-in automatic API documentation (Swagger UI)
- Data validation with Pydantic
- Async/await support for concurrent operations
- Type hints support for better code quality

### 2. **Database & ORM**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | Latest | Robust relational database management system |
| **SQLAlchemy** | 2.0.23 | Python SQL toolkit and Object-Relational Mapping (ORM) |
| **psycopg2-binary** | 2.9.9 | PostgreSQL adapter for Python |

**Database Connection:**
```
URL: postgresql://postgres:root@localhost:5432/supplyledger
```

**Why PostgreSQL & SQLAlchemy?**
- PostgreSQL: ACID compliance, robust data integrity, JSON support
- SQLAlchemy: Industry-standard ORM, declarative models, query flexibility

### 3. **Data Validation & Serialization**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Pydantic** | 2.5.0 | Data validation and serialization using Python type annotations |
| **python-multipart** | 0.0.6 | Multipart form data parsing |

### 4. **Configuration & Environment**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **python-dotenv** | 1.0.0 | Load environment variables from .env files |

### 5. **Authentication**
| Technology | Purpose |
|-----------|---------|
| **JWT (JSON Web Tokens)** | Bearer token-based authentication |
| **FastAPI Security** | Built-in security utilities |

### 6. **API Middleware & CORS**
| Component | Purpose |
|-----------|---------|
| **CORS Middleware** | Enable Cross-Origin Resource Sharing |
| **Custom Middleware** | Request/response processing |

---

## Frontend Technologies

> **Note:** The frontend repository is separate from this backend. Below is the recommended tech stack for the SupplyLedger frontend:

### Recommended Frontend Stack
| Technology | Purpose | Alternative |
|-----------|---------|-------------|
| **React** | JavaScript library for building UI | Vue.js, Angular |
| **Vite** | Modern frontend build tool | Webpack, Parcel |
| **TypeScript** | Type-safe JavaScript | JavaScript |
| **Tailwind CSS** | Utility-first CSS framework | Bootstrap, Material-UI |
| **React Router** | Client-side routing | Next.js |
| **Axios** / **Fetch API** | HTTP client for API calls | - |
| **Redux** / **Zustand** | State management | Context API, Jotai |
| **React Query** | Server state management | SWR, RTK Query |

### Frontend Features
- Real-time shipment tracking dashboard
- Order management interface
- User authentication & role-based access
- Analytics visualization
- Mobile-responsive design
- WebSocket support (optional) for real-time updates

---

## External Integrations

### 1. **OpenRouteService API**
- **Purpose:** Maps, routing, and distance calculation
- **Used In:** `app/utils/maps.py`
- **Features:**
  - Route optimization
  - Distance calculation
  - Travel duration estimation

### 2. **OpenWeatherMap API**
- **Purpose:** Real-time weather data for delay prediction
- **Used In:** `app/utils/weather.py`
- **Features:**
  - Current weather conditions
  - Weather impact on shipping delays
  - Climate factor calculation

### 3. **Traffic Data Integration**
- **Purpose:** Real-time traffic congestion analysis
- **Used In:** `app/utils/traffic.py`
- **Features:**
  - Traffic factor calculation
  - Congestion analysis
  - Delay estimation

---

## Development & Deployment

### Development Tools
| Tool | Purpose |
|------|---------|
| **pip** | Python package manager |
| **virtualenv** / **conda** | Python environment management |
| **Postman** / **Insomnia** | API testing |
| **Git** | Version control |
| **pytest** | Unit testing framework |

### Deployment Stack
| Component | Technology |
|-----------|-----------|
| **Containerization** | Docker |
| **Orchestration** | Docker Compose |
| **Cloud Hosting** | AWS / Azure / GCP (Configurable) |
| **Environment** | Linux (Ubuntu/CentOS) |

### Development Workflow
```
Local Development (FastAPI + PostgreSQL)
         ↓
Unit Testing (pytest)
         ↓
API Testing (Postman/Insomnia)
         ↓
Docker Build
         ↓
Docker Compose Deploy
         ↓
Production Server
```

---

## Architecture & Design Patterns

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│         API Layer (Route Handlers)                  │
│  auth_routes, user_routes, order_routes, etc.      │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│      Service Layer (Business Logic)                 │
│  auth_service, user_service, order_service, etc.   │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│   Utility & Integration Layer                       │
│  blockchain/, ai/, utils/ (maps, weather, traffic)  │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│      Data Access Layer (SQLAlchemy ORM)             │
│  models.py, database.py                             │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│          PostgreSQL Database                        │
└─────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **MVC Pattern** (Model-View-Controller variant)
   - Models: SQLAlchemy ORM models
   - Views: API routes/endpoints
   - Controllers: Service layer

2. **Service Layer Pattern**
   - Centralized business logic
   - Reusable across multiple endpoints
   - Example: `OrderService`, `ShipmentService`

3. **Repository Pattern** (via SQLAlchemy)
   - Data access abstraction
   - Session management
   - Query optimization

4. **Dependency Injection**
   - FastAPI's built-in dependency system
   - Database session injection
   - Service injection

5. **Middleware Pattern**
   - CORS handling
   - Request/response processing

---

## Security & Authentication

### Authentication Strategy
| Aspect | Implementation |
|--------|-----------------|
| **Token Type** | JWT (JSON Web Tokens) |
| **Auth Scheme** | Bearer Token |
| **Token Storage** (Frontend) | LocalStorage / SessionStorage |
| **HTTPS** | Enabled in production |
| **CORS** | Configured for frontend origin |
| **Password Security** | Hashed with industry standards |

### Data Security
| Feature | Technology |
|---------|-----------|
| **Data Integrity** | SHA-256 hashing (Blockchain) |
| **Transaction Safety** | ACID compliance (PostgreSQL) |
| **Audit Trail** | Immutable blockchain ledger |
| **Rate Limiting** | Optional (can be added) |

### CORS Configuration
```python
CORSMiddleware(
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Technology Comparison & Rationale

### Why FastAPI over Django/Flask?

| Aspect | FastAPI | Django | Flask |
|--------|---------|--------|-------|
| **Speed** | ⚡⚡⚡ Fast | ⚡⚡ Medium | ⚡⚡ Medium |
| **Learning Curve** | Easy | Medium | Easy |
| **Built-in Features** | Good | Excellent | Minimal |
| **Async Support** | Native | Limited | Requires Extra |
| **API Development** | Excellent | Good | Minimal |
| **Documentation** | Excellent | Excellent | Good |

**Chosen:** FastAPI - Perfect balance of performance, ease of use, and API-first design

### Why PostgreSQL over MySQL/MongoDB?

| Aspect | PostgreSQL | MySQL | MongoDB |
|--------|-----------|-------|---------|
| **ACID** | ✅ Full | ✅ Full | ❌ Limited |
| **Relationships** | ✅ Excellent | ✅ Good | ❌ Not Ideal |
| **Data Integrity** | ✅ Strong | ✅ Good | ⚠️ Document-based |
| **Complex Queries** | ✅ Advanced | ✅ Good | ⚠️ Limited |
| **Use Case** | Relational | Relational | Non-relational |

**Chosen:** PostgreSQL - Strong ACID compliance for supply chain data integrity

### Why SQLAlchemy over Django ORM?

| Aspect | SQLAlchemy | Django ORM |
|--------|-----------|-----------|
| **Framework Coupling** | Independent | Tightly coupled to Django |
| **Flexibility** | High | Medium |
| **Raw SQL** | Easy | Harder |
| **Query Control** | Fine-grained | Limited |

**Chosen:** SQLAlchemy - Works seamlessly with FastAPI, independent framework

---

## Module-Wise Technology Stack

### Authentication Module (`app/auth/`)
- **Technologies:** FastAPI, Pydantic, SQLAlchemy, JWT
- **Responsibilities:** User login, token generation, validation

### User Management Module (`app/users/`)
- **Technologies:** SQLAlchemy, Pydantic, FastAPI
- **Responsibilities:** User CRUD operations, profile management

### Order Management Module (`app/orders/`)
- **Technologies:** SQLAlchemy, Pydantic, FastAPI
- **Responsibilities:** Order creation, status tracking, order history

### Shipment Tracking Module (`app/shipments/`)
- **Technologies:** SQLAlchemy, Pydantic, FastAPI, Blockchain (SHA-256)
- **Responsibilities:** Real-time tracking, blockchain verification

### AI & Prediction Module (`app/ai/`)
- **Technologies:** Custom algorithms, external APIs (Maps, Weather, Traffic)
- **Responsibilities:** Delay prediction, intelligent routing

### Analytics Module (`app/analytics/`)
- **Technologies:** SQLAlchemy, Pandas (optional), FastAPI
- **Responsibilities:** Data aggregation, reporting, insights

### Blockchain Module (`app/blockchain/`)
- **Technologies:** SHA-256 hashing, custom ledger implementation
- **Responsibilities:** Immutable record creation, verification

### Utilities Module (`app/utils/`)
- **Technologies:** Requests (HTTP), APIs, custom algorithms
- **Components:**
  - `maps.py`: OpenRouteService integration
  - `weather.py`: OpenWeatherMap integration
  - `traffic.py`: Traffic analysis
  - `hash_utils.py`: SHA-256 hashing
  - `city_coords.py`: Geocoding utilities

---

## API Documentation

### Auto-Generated Documentation
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

### API Endpoints Overview
```
/auth          → Authentication and authorization
/users         → User management
/orders        → Order operations
/shipments     → Shipment tracking and blockchain
/analytics     → Business analytics
```

---

## Requirements & Dependencies

### Backend Dependencies (Complete List)
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-multipart==0.0.6
python-dotenv==1.0.0
```

### Installation
```bash
pip install -r requirements.txt
```

---

## Environment Setup

### Required Environment Variables
```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/supplyledger
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
OPENWEATHERMAP_API_KEY=your-api-key
OPENROUTESERVICE_API_KEY=your-api-key
```

---

## Summary

| Component | Tech Stack |
|-----------|-----------|
| **Backend Framework** | FastAPI 0.104.1 |
| **Server** | Uvicorn (ASGI) |
| **Language** | Python 3.8+ |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy 2.0.23 |
| **Validation** | Pydantic 2.5.0 |
| **Authentication** | JWT Tokens |
| **API Documentation** | Swagger UI (Auto-generated) |
| **External APIs** | OpenRouteService, OpenWeatherMap |
| **Blockchain** | SHA-256 Hashing |
| **Deployment** | Docker / Docker Compose |

---

## Notes

- All code follows RESTful API principles
- Database migrations are managed through SQLAlchemy
- API is fully documented with Swagger/OpenAPI
- Blockchain verification is optional per request
- Real-time features can be enhanced with WebSocket support

For more information, refer to the individual module documentation files.
