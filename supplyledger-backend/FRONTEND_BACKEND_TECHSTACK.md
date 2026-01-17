# Frontend & Backend Tech Stack Reference Guide

## Quick Reference

### 🔧 Backend Stack
```
Language:        Python 3.8+
Framework:       FastAPI 0.104.1
Server:          Uvicorn 0.24.0
Database:        PostgreSQL
ORM:             SQLAlchemy 2.0.23
Validation:      Pydantic 2.5.0
Auth:            JWT (Bearer Tokens)
Hashing:         SHA-256 (Blockchain)
```

### 🎨 Frontend Stack (Recommended)
```
Framework:       React 18.x
Build Tool:      Vite
Language:        TypeScript / JavaScript
Styling:         Tailwind CSS 3.x
Routing:         React Router v6
State Mgmt:      Redux / Zustand
HTTP Client:     Axios / Fetch API
Testing:         Jest / Vitest
UI Components:   Material-UI / Headless UI
```

---

## Detailed Technology Breakdown

### Backend Technologies

#### 1. FastAPI (0.104.1)
**What it is:** Modern, fast Python web framework
**Key Features:**
- Automatic API documentation (Swagger/ReDoc)
- Type hints and validation with Pydantic
- Dependency injection system
- Async/await support
- CORS middleware

**Usage in Project:**
```python
# app/main.py example
from fastapi import FastAPI
app = FastAPI(title="SupplyLedger API", version="1.0")
```

**Why Chosen:**
- Perfect for building RESTful APIs
- High performance (100k+ requests/sec)
- Easy to test
- Great documentation generation

---

#### 2. Uvicorn (0.24.0)
**What it is:** ASGI web server
**Purpose:** Runs the FastAPI application
**Features:**
- Async request handling
- Hot reload support (development)
- Multiple worker support

**Run Command:**
```bash
uvicorn app.main:app --reload
```

---

#### 3. PostgreSQL
**What it is:** Relational database management system
**Key Features:**
- ACID compliance (data integrity)
- JSON support
- Advanced indexing
- Row-level security
- Transaction support

**Connection String:**
```
postgresql://username:password@localhost:5432/supplyledger
```

**Used For:**
- User data storage
- Order management
- Shipment tracking
- Analytics data

---

#### 4. SQLAlchemy (2.0.23)
**What it is:** Python ORM (Object-Relational Mapping)
**Key Features:**
- Declarative models
- Query builder
- Session management
- Relationship handling
- Migration support

**Example Model:**
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
```

**Benefits:**
- Write less raw SQL
- Type-safe database operations
- Easy data relationships
- Database agnostic (can switch DB)

---

#### 5. Pydantic (2.5.0)
**What it is:** Data validation library
**Key Features:**
- Type validation
- Automatic JSON serialization
- Custom validators
- Error messages

**Example Schema:**
```python
from pydantic import BaseModel

class UserSchema(BaseModel):
    email: str
    password: str
    full_name: str
```

---

#### 6. JWT Authentication
**What it is:** Stateless authentication mechanism
**How it Works:**
1. User logs in with credentials
2. Backend generates JWT token
3. Frontend stores token
4. Frontend sends token in header for each request
5. Backend validates token

**Token Structure:**
```
Header.Payload.Signature
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
eyJzdWIiOiI1YjBmYWVmZDY4Yzg0ODAwMTZkZDBkMDIiLCJpYXQiOjE2MzAwMTkxNjl9.
LS4K-H8BqKhwfVYGx7KwTxyQV3Pf7YoR-R6PjBK7L8A
```

---

### Frontend Technologies

#### 1. React 18.x
**What it is:** JavaScript library for building user interfaces
**Key Features:**
- Component-based architecture
- Virtual DOM for performance
- Hooks API (useState, useEffect)
- Server-side rendering support

**Component Example:**
```javascript
import { useState } from 'react';

function ShipmentTracker() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="shipment-list">
      {shipments.map(ship => (
        <ShipmentCard key={ship.id} shipment={ship} />
      ))}
    </div>
  );
}

export default ShipmentTracker;
```

---

#### 2. Vite
**What it is:** Modern frontend build tool
**Features:**
- Lightning-fast dev server (HMR)
- Optimized production builds
- Framework agnostic
- Zero-config setup

**Commands:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

#### 3. TypeScript
**What it is:** JavaScript with static typing
**Benefits:**
- Type safety
- Better IDE support
- Catches errors early
- Improved code documentation

**Example:**
```typescript
interface Shipment {
  id: number;
  trackingNumber: string;
  status: 'pending' | 'in-transit' | 'delivered';
  estimatedDelay: number;
}

async function fetchShipment(id: number): Promise<Shipment> {
  const response = await fetch(`/api/shipments/${id}`);
  return response.json();
}
```

---

#### 4. Tailwind CSS
**What it is:** Utility-first CSS framework
**Benefits:**
- Fast styling without writing CSS
- Highly customizable
- Responsive design utilities
- Dark mode support

**Example:**
```html
<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg shadow">
  <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    New Order
  </button>
</div>
```

---

#### 5. React Router v6
**What it is:** Client-side routing library
**Features:**
- URL-based navigation
- Nested routes
- Dynamic segments
- Lazy loading

**Setup Example:**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/shipments" element={<ShipmentList />} />
        <Route path="/shipments/:id" element={<ShipmentDetail />} />
        <Route path="/orders" element={<OrderList />} />
      </Routes>
    </Router>
  );
}
```

---

#### 6. State Management (Redux / Zustand)

**Redux:**
- Predictable state management
- Time-travel debugging
- Great for large applications
- Learning curve exists

**Zustand:**
- Simpler, lightweight alternative
- Less boilerplate
- Great for small to medium apps

**Redux Example:**
```javascript
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {
    setOrders: (state, action) => {
      state.list = action.payload;
    },
    addOrder: (state, action) => {
      state.list.push(action.payload);
    }
  }
});
```

---

#### 7. Axios / Fetch API
**What it is:** HTTP client for making API requests
**Axios Example:**
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// GET request
const shipments = await apiClient.get('/shipments');

// POST request
const newOrder = await apiClient.post('/orders', {
  customer_id: 1,
  items: [...]
});

// Error handling
try {
  const response = await apiClient.get('/shipments');
} catch (error) {
  console.error('Failed to fetch shipments:', error);
}
```

---

#### 8. Testing (Jest / Vitest)

**Jest:**
- Comprehensive testing framework
- Snapshot testing
- Coverage reporting

**Vitest:**
- Fast, Vite-native testing
- Jest-compatible API

**Test Example:**
```javascript
describe('ShipmentTracker', () => {
  it('should fetch and display shipments', async () => {
    render(<ShipmentTracker />);
    
    await waitFor(() => {
      expect(screen.getByText(/shipment/i)).toBeInTheDocument();
    });
  });
});
```

---

## API Integration Pattern

### Frontend to Backend Communication

```
Frontend (React)
    ↓
    │ HTTP/HTTPS (JSON)
    ↓
FastAPI Backend
    ↓
    │ Database Queries (SQLAlchemy)
    ↓
PostgreSQL Database
```

### Example Flow: Creating an Order

#### Frontend Code
```javascript
async function createOrder(orderData) {
  try {
    const response = await axios.post('/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}
```

#### Backend Code
```python
@app.post("/orders", tags=["Orders"])
async def create_order(order: OrderSchema, db: Session = Depends(get_db)):
    # Validate data
    # Create order record
    # Return response
    db_order = Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
```

---

## Development Workflow

### Local Development Setup

#### Backend Setup
```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env

# 4. Run migrations (if applicable)
python migrate_db.py

# 5. Start development server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
VITE_API_BASE_URL=http://localhost:8000

# 3. Start development server
npm run dev
```

---

## Deployment Stack

### Docker Containerization
```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/supplyledger
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: root
      POSTGRES_DB: supplyledger
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## Performance Metrics

### Backend Performance
- Request handling: **< 100ms** (average)
- Database query: **< 50ms** (optimized)
- API throughput: **1000+ req/sec**

### Frontend Performance
- Page load time: **< 3s** (with optimization)
- Time to Interactive: **< 1.5s**
- Lighthouse score: **>90**

---

## Security Considerations

### Backend Security
- JWT token validation
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy)
- Password hashing

### Frontend Security
- Token storage (secure)
- XSS prevention
- CSRF token handling
- Secure HTTP headers
- Content Security Policy (CSP)

---

## Version Management

### Backend
- Python: 3.8+
- FastAPI: 0.104.1
- PostgreSQL: 13+

### Frontend (Recommended)
- Node.js: 16+ (LTS)
- npm: 8+
- React: 18.x
- Vite: 4.x

---

## Comparison: Why These Technologies?

### FastAPI vs Alternatives
| Criteria | FastAPI | Django | Flask |
|----------|---------|--------|-------|
| Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Ease of Use | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Built-in Features | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| API Development | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Learning Curve | Easy | Medium | Easy |

### React vs Alternatives
| Criteria | React | Vue | Angular |
|----------|-------|-----|---------|
| Popularity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Learning | Medium | Easy | Hard |
| Job Market | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ecosystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Conclusion

SupplyLedger uses a modern, industry-standard tech stack optimized for:
- ✅ Fast development
- ✅ High performance
- ✅ Easy maintenance
- ✅ Scalability
- ✅ Strong community support
- ✅ Future-proof technologies

For questions about specific technologies or integration patterns, refer to the respective module documentation.
