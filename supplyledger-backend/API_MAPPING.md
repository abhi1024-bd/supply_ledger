# Supply Ledger API Mapping Guide

## Complete API Endpoints

### 1. Authentication Endpoints (`/auth`)

#### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "secure-token-xxx",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company_name": "ABC Corp",
    "phone": "123-456-7890",
    "address": "New York, NY",
    "account_type": "Standard",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "role": "MSME"
}
```

#### POST `/auth/logout`
No request body needed.

---

### 2. User Management Endpoints (`/users`)

#### POST `/users/register`
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "Jane Smith",
  "company_name": "XYZ Industries",
  "phone": "987-654-3210",
  "address": "Los Angeles, CA"
}
```
**Response:** Same as user object above

#### GET `/users/profile/{user_id}`
Returns full user profile information.

#### PUT `/users/profile/{user_id}`
**Request:**
```json
{
  "name": "Jane Smith",
  "company_name": "XYZ Industries",
  "phone": "987-654-3210",
  "address": "Los Angeles, CA"
}
```

#### GET `/users/search?email=user@example.com`
Search for users by email.

---

### 3. Order Management Endpoints (`/orders`)

#### POST `/orders/create?user_id=1`
**Request:**
```json
{
  "origin": "New York, NY",
  "destination": "Los Angeles, CA",
  "weight": 100.5,
  "priority": "medium",
  "due_date": "2024-02-15T00:00:00"
}
```
**Response:**
```json
{
  "id": 1,
  "order_id": "ORD-ABC12345",
  "user_id": 1,
  "origin": "New York, NY",
  "destination": "Los Angeles, CA",
  "weight": 100.5,
  "priority": "medium",
  "status": "Pending",
  "due_date": "2024-02-15T00:00:00",
  "value": 10050.0,
  "created_at": "2024-01-10T00:00:00",
  "updated_at": "2024-01-10T00:00:00"
}
```

#### GET `/orders/list/{user_id}`
Returns all orders for a specific user.

#### GET `/orders/detail/{order_id}`
Returns details for a specific order by order ID.

#### PUT `/orders/update/{order_id}`
**Request:**
```json
{
  "status": "In Transit",
  "priority": "high",
  "due_date": "2024-02-20T00:00:00"
}
```

#### GET `/orders/stats/{user_id}`
Returns order statistics:
```json
{
  "total_orders": 10,
  "delivered": 8,
  "in_transit": 1,
  "pending": 1,
  "total_value": 50000.0,
  "average_value": 5000.0
}
```

#### DELETE `/orders/delete/{order_id}`
Deletes an order and updates analytics.

---

### 4. Shipment Endpoints (`/shipments`)

#### POST `/shipments/create`
**Request:**
```json
{
  "order_id": "ORD-ABC12345",
  "source": "New York, NY",
  "destination": "Los Angeles, CA",
  "distance_km": 4500
}
```

#### GET `/shipments/{shipment_id}`
Returns shipment details.

#### GET `/shipments/order/{order_id}`
Get shipment for a specific order.

#### PUT `/shipments/{shipment_id}`
**Request:**
```json
{
  "status": "IN_TRANSIT",
  "estimated_delivery": "2024-02-15T00:00:00"
}
```

#### POST `/shipments/{shipment_id}/predict-delay`
Predicts delivery delay using AI.

---

### 5. Analytics Endpoints (`/analytics`)

#### GET `/analytics/dashboard/{user_id}`
**Response:**
```json
{
  "total_shipments": 10,
  "in_transit": 2,
  "delivered": 7,
  "pending": 1
}
```

#### GET `/analytics/user-analytics/{user_id}`
Returns detailed user analytics with all metrics.

#### GET `/analytics/order-status-breakdown/{user_id}`
**Response:**
```json
{
  "delivered": 8,
  "in_transit": 1,
  "pending": 1
}
```

#### GET `/analytics/priority-breakdown/{user_id}`
**Response:**
```json
{
  "critical": 2,
  "high": 3,
  "medium": 4,
  "low": 1
}
```

#### GET `/analytics/destination-breakdown/{user_id}`
**Response:**
```json
{
  "destinations": [
    {"name": "Los Angeles, CA", "orders": 5},
    {"name": "New York, NY", "orders": 3},
    {"name": "Chicago, IL", "orders": 2}
  ]
}
```

#### GET `/analytics/value-metrics/{user_id}`
**Response:**
```json
{
  "total_value": 50000.0,
  "average_value": 5000.0,
  "total_orders": 10
}
```

---

## Frontend to Backend Mapping

### Dashboard Page (`/dashboard`)
**APIs Used:**
- `GET /analytics/dashboard/{user_id}` - For stats cards
- `GET /orders/list/{user_id}` - For recent orders table

### Create Order Page (`/create-order`)
**APIs Used:**
- `POST /orders/create?user_id={user_id}` - To create order
- `POST /shipments/create` - To create shipment for order

### Orders List Page (`/orders`)
**APIs Used:**
- `GET /orders/list/{user_id}` - Fetch all orders
- `PUT /orders/update/{order_id}` - Update order status
- `DELETE /orders/delete/{order_id}` - Delete order
- `GET /orders/detail/{order_id}` - View order details

### Analytics Page (`/analytics`)
**APIs Used:**
- `GET /analytics/dashboard/{user_id}` - KPI cards
- `GET /analytics/order-status-breakdown/{user_id}` - Status pie chart
- `GET /analytics/priority-breakdown/{user_id}` - Priority bar chart
- `GET /analytics/destination-breakdown/{user_id}` - Top destinations

### User Profile Page (`/profile`)
**APIs Used:**
- `GET /users/profile/{user_id}` - Get user info
- `PUT /users/profile/{user_id}` - Update profile
- `GET /analytics/user-analytics/{user_id}` - User stats

### Settings Page (`/settings`)
**APIs Used:**
- `PUT /users/profile/{user_id}` - Update settings

### Signup Page (`/signup`)
**APIs Used:**
- `POST /users/register` - Register new user

### Login Page (`/login`)
**APIs Used:**
- `POST /auth/login` - Authenticate user

---

## Database Tables Created

1. **users** - User account information
2. **orders** - Order details and status
3. **shipments** - Shipment tracking and blockchain hashes
4. **order_analytics** - Aggregated analytics per user

## Important Notes

- All timestamps are in UTC format
- User ID is typically extracted from JWT token in production
- Order value is calculated as: `weight * 100`
- Shipment estimated delivery defaults to 5 days from creation
- Analytics are updated automatically when orders are created/modified
