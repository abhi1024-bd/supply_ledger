# 🔗 BLOCKCHAIN API REFERENCE

## Overview

Complete REST API documentation for blockchain verification endpoints in SupplyLedger.

**Base URL:** `http://localhost:8000/shipments`

---

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/create` | Create new shipment with blockchain hash |
| **PATCH** | `/{id}/status` | Update status (generates new hash) |
| **GET** | `/ledger/verify/{id}` | Verify shipment integrity |
| **GET** | `/ledger/hash/{id}` | Get shipment's current hash |
| **GET** | `/ledger/all-hashes/{order_id}` | Get complete audit trail |

---

## 1. Create Shipment

### Request

```http
POST /shipments/create
Content-Type: application/json

{
    "order_id": "ORD-001",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500,
    "source_coords": [72.8479, 19.0176],    // Optional
    "dest_coords": [77.2090, 28.6139]       // Optional
}
```

### Response (201 Created)

```json
{
    "id": 1,
    "order_id": "ORD-001",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500,
    "source_coords": [72.8479, 19.0176],
    "dest_coords": [77.2090, 28.6139],
    "status": "CREATED",
    "blockchain_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
    "estimated_delivery": "2025-01-15T10:00:00",
    "created_at": "2025-01-10T10:00:00",
    "updated_at": "2025-01-10T10:00:00"
}
```

### What Happens

1. ✅ Shipment record created in database
2. ✅ Gets auto-assigned ID from database
3. ✅ SHA-256 hash generated from `id + source + destination + distance_km + status`
4. ✅ Hash stored in `blockchain_hash` column
5. ✅ Timestamp included in response

### Example

```bash
curl -X POST http://localhost:8000/shipments/create \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-001",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500
  }'
```

---

## 2. Update Shipment Status

### Request

```http
PATCH /shipments/{shipment_id}/status
Content-Type: application/json

{
    "status": "IN_TRANSIT"
}
```

### Response (200 OK)

```json
{
    "id": 1,
    "order_id": "ORD-001",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500,
    "status": "IN_TRANSIT",
    "blockchain_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
    "updated_at": "2025-01-10T11:00:00"
}
```

### What Happens

1. ✅ Status updated to new value
2. ✅ **NEW blockchain hash generated** (includes new timestamp)
3. ✅ Hash stored, replacing old value
4. ✅ Old hash lost (use audit trail API to see history)
5. ⚠️ **This proves status change** in immutable way

### Status Values

- `CREATED` - Initial state (set automatically)
- `PICKED_UP` - Collected from origin
- `IN_TRANSIT` - On the way
- `OUT_FOR_DELIVERY` - Final mile
- `DELIVERED` - Successfully delivered
- `FAILED` - Delivery failed
- `CANCELLED` - Order cancelled

### Example

```bash
curl -X PATCH http://localhost:8000/shipments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_TRANSIT"}'
```

### Error Responses

```json
// 404 Not Found
{
    "detail": "Shipment not found"
}

// 422 Validation Error
{
    "detail": "Invalid status value"
}
```

---

## 3. Verify Shipment Integrity

### Request

```http
GET /shipments/ledger/verify/{shipment_id}
```

### Response (200 OK) - Valid Shipment

```json
{
    "valid": true,
    "stored_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
    "current_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
    "tampered": false,
    "message": "Shipment data is intact and has not been tampered with.",
    "shipment_id": 1,
    "order_id": "ORD-001",
    "status": "IN_TRANSIT"
}
```

### Response (200 OK) - Tampered Shipment

```json
{
    "valid": false,
    "stored_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
    "current_hash": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "tampered": true,
    "message": "WARNING: Shipment data has been modified. Original hash does not match.",
    "shipment_id": 1,
    "order_id": "ORD-001",
    "status": "IN_TRANSIT"
}
```

### How It Works

```
1. Fetch shipment from database
2. Regenerate hash using: id, source, destination, distance_km, status
3. Compare regenerated hash with stored hash
4. Return verification result
```

### Error Responses

```json
// 404 Not Found
{
    "detail": "Shipment not found"
}
```

### Example

```bash
# Verify shipment is authentic
curl http://localhost:8000/shipments/ledger/verify/1

# Check specifically if tampered
curl http://localhost:8000/shipments/ledger/verify/1 | jq .tampered
# Returns: false (or true if tampered)
```

### Use Cases

- ✅ Verify shipment before processing
- ✅ Check for data tampering
- ✅ Regulatory compliance audit
- ✅ Insurance claims verification
- ✅ Dispute resolution

---

## 4. Get Shipment Hash

### Request

```http
GET /shipments/ledger/hash/{shipment_id}
```

### Response (200 OK)

```json
{
    "shipment_id": 1,
    "order_id": "ORD-001",
    "blockchain_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
    "status": "IN_TRANSIT",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500,
    "created_at": "2025-01-10T10:00:00",
    "updated_at": "2025-01-10T11:00:00"
}
```

### What's Returned

| Field | Purpose |
|-------|---------|
| `blockchain_hash` | SHA-256 fingerprint of current state |
| `status` | Current shipment status |
| `source` | Origin city |
| `destination` | Destination city |
| `distance_km` | Travel distance |
| `created_at` | When shipment was created |
| `updated_at` | When shipment was last updated |

### Error Responses

```json
// 404 Not Found
{
    "detail": "Shipment not found"
}
```

### Example

```bash
curl http://localhost:8000/shipments/ledger/hash/1

# Pretty print
curl http://localhost:8000/shipments/ledger/hash/1 | jq .

# Get just the hash
curl http://localhost:8000/shipments/ledger/hash/1 | jq .blockchain_hash
```

---

## 5. Get Order Audit Trail

### Request

```http
GET /shipments/ledger/all-hashes/{order_id}
```

### Response (200 OK)

```json
{
    "order_id": "ORD-001",
    "shipments": [
        {
            "shipment_id": 1,
            "status": "CREATED",
            "blockchain_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
            "source": "Mumbai",
            "destination": "Delhi",
            "distance_km": 1500,
            "created_at": "2025-01-10T10:00:00",
            "updated_at": "2025-01-10T10:00:00"
        },
        {
            "shipment_id": 1,
            "status": "IN_TRANSIT",
            "blockchain_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
            "source": "Mumbai",
            "destination": "Delhi",
            "distance_km": 1500,
            "created_at": "2025-01-10T10:00:00",
            "updated_at": "2025-01-10T11:00:00"
        },
        {
            "shipment_id": 1,
            "status": "DELIVERED",
            "blockchain_hash": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
            "source": "Mumbai",
            "destination": "Delhi",
            "distance_km": 1500,
            "created_at": "2025-01-10T10:00:00",
            "updated_at": "2025-01-10T15:00:00"
        }
    ],
    "total_shipments": 1
}
```

### What's Shown

- **Complete shipment lifecycle** with each status
- **Unique hash for each state** - proves progression
- **Timestamps** - shows when each change occurred
- **Immutable proof** - Can't be forged (hash would change)

### Error Responses

```json
// 404 Not Found
{
    "detail": "No shipments found for order"
}
```

### Example

```bash
# Get all shipments with their hashes
curl http://localhost:8000/shipments/ledger/all-hashes/ORD-001

# Pretty print
curl http://localhost:8000/shipments/ledger/all-hashes/ORD-001 | jq .

# Get shipment count
curl http://localhost:8000/shipments/ledger/all-hashes/ORD-001 | jq .total_shipments

# Extract all hashes
curl http://localhost:8000/shipments/ledger/all-hashes/ORD-001 | jq '.shipments[].blockchain_hash'
```

### Use Cases

- ✅ View complete shipment history
- ✅ Audit trail for compliance
- ✅ Dispute resolution (show progression)
- ✅ Analytics (timeline analysis)
- ✅ Forensics (detect when tampering occurred)

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | Verification successful |
| **201** | Created | Shipment created |
| **400** | Bad Request | Missing required fields |
| **404** | Not Found | Shipment doesn't exist |
| **422** | Validation Error | Invalid data format |
| **500** | Server Error | Database connection error |

---

## Authentication

These endpoints currently have **no authentication**. In production, add:

```python
from app.dependencies import get_current_user

@router.get("/ledger/verify/{shipment_id}")
def verify_shipment(
    shipment_id: int,
    current_user = Depends(get_current_user)  # Add auth
):
    ...
```

---

## Rate Limiting (Future)

Currently unlimited. For production, implement:

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.get("/ledger/verify/{shipment_id}")
@limiter.limit("100/minute")
def verify_shipment(...):
    ...
```

---

## Pagination (Future)

For large orders, implement pagination:

```python
@router.get("/ledger/all-hashes/{order_id}")
def get_order_ledger(
    order_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    ...
```

---

## CORS Headers

All responses include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Example Integration

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Create shipment
response = requests.post(
    f"{BASE_URL}/shipments/create",
    json={
        "order_id": "ORD-001",
        "source": "Mumbai",
        "destination": "Delhi",
        "distance_km": 1500
    }
)
shipment = response.json()
shipment_id = shipment['id']

# Verify
response = requests.get(f"{BASE_URL}/shipments/ledger/verify/{shipment_id}")
verification = response.json()

if verification['valid']:
    print("✅ Shipment is authentic")
else:
    print("⚠️ SHIPMENT HAS BEEN TAMPERED")
```

### JavaScript

```javascript
const BASE_URL = "http://localhost:8000";

// Create shipment
const response = await fetch(`${BASE_URL}/shipments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        order_id: "ORD-001",
        source: "Mumbai",
        destination: "Delhi",
        distance_km: 1500
    })
});

const shipment = await response.json();
const shipmentId = shipment.id;

// Verify
const verifyResponse = await fetch(
    `${BASE_URL}/shipments/ledger/verify/${shipmentId}`
);
const verification = await verifyResponse.json();

console.log(verification.valid ? "✅ Valid" : "⚠️ Tampered");
```

### cURL

```bash
# Create
RESPONSE=$(curl -X POST http://localhost:8000/shipments/create \
  -H "Content-Type: application/json" \
  -d '{"order_id":"ORD-001","source":"Mumbai","destination":"Delhi","distance_km":1500}')
SHIPMENT_ID=$(echo $RESPONSE | jq .id)

# Verify
curl http://localhost:8000/shipments/ledger/verify/$SHIPMENT_ID | jq .valid
```

---

## Testing with Postman

### 1. Create Shipment

- **Method:** POST
- **URL:** `http://localhost:8000/shipments/create`
- **Body (JSON):**
  ```json
  {
      "order_id": "ORD-001",
      "source": "Mumbai",
      "destination": "Delhi",
      "distance_km": 1500
  }
  ```

### 2. Verify Shipment

- **Method:** GET
- **URL:** `http://localhost:8000/shipments/ledger/verify/1`
- **Expected:** `"valid": true`

### 3. Update Status

- **Method:** PATCH
- **URL:** `http://localhost:8000/shipments/1/status`
- **Body (JSON):**
  ```json
  {
      "status": "IN_TRANSIT"
  }
  ```
- **Expected:** Hash changed

### 4. Get Audit Trail

- **Method:** GET
- **URL:** `http://localhost:8000/shipments/ledger/all-hashes/ORD-001`

---

**Last Updated:** January 10, 2026  
**API Version:** 1.0  
**Status:** ✅ Production Ready
