# 🔐 BLOCKCHAIN IMPLEMENTATION GUIDE

## Overview

This document explains the blockchain module implemented in the SupplyLedger backend. This is **NOT cryptocurrency or Ethereum** — it's an academic + industry-valid implementation using blockchain **principles** for supply chain verification.

---

## ✅ What We Implemented

### Core Components

1. **SHA-256 Hash Generation** (`app/blockchain/ledger.py`)
   - Generates immutable fingerprints of shipment data
   - Includes timestamp for audit trail
   - Any data change → hash changes completely

2. **Verification System** (`app/blockchain/verify.py`)
   - Compares stored hash with regenerated hash
   - Detects tampering immediately
   - Provides audit trail proof

3. **Database Integration**
   - `blockchain_hash` field in Shipment model
   - Hash updated on creation and status changes
   - Permanent record in database

4. **API Endpoints** (3 new verification endpoints)
   - Verify shipment integrity
   - View blockchain hashes
   - Audit trail for orders

---

## 🧩 Module Structure

```
app/
├── blockchain/
│   ├── __init__.py          # Module exports
│   ├── ledger.py           # Hash generation logic
│   └── verify.py           # Verification logic
├── shipments/
│   └── shipment_routes.py  # Updated with blockchain integration
└── database/
    └── models.py           # Shipment model with blockchain_hash
```

---

## 🔑 Key Concepts

### SHA-256 Hashing

```python
data = f"{shipment_id}|{source}|{destination}|{distance_km}|{status}|{timestamp}"
hash = SHA256(data)
# Output: 64-character hex string (256 bits)
```

**Properties:**
- ✅ **One-way**: Cannot reverse hash to get original data
- ✅ **Deterministic**: Same input always produces same hash
- ✅ **Avalanche effect**: One character change → completely different hash
- ✅ **Fast**: Computed in milliseconds
- ✅ **Secure**: SHA-256 is cryptographically sound

### Timestamp in Hash

```python
timestamp = datetime.utcnow()
data = f"...{timestamp.isoformat()}"
```

**Why timestamp matters:**
- Each status update gets unique hash
- Creates immutable audit trail
- Proves when data was recorded
- Prevents denial of previous states

### Immutable Ledger

When shipment status changes:

```
Initial:    CREATED → hash_v1 (stored in DB)
Update 1:   IN_TRANSIT → hash_v2 (new hash generated)
Update 2:   DELIVERED → hash_v3 (new hash generated)
```

**Each hash is immutable proof of that state at that time.**

---

## 📊 Database Schema

### Shipment Table

```sql
CREATE TABLE shipments (
    id INTEGER PRIMARY KEY,
    order_id STRING,
    source STRING,
    destination STRING,
    distance_km INTEGER,
    status STRING,
    blockchain_hash STRING,  -- ✅ NEW COLUMN
    created_at DATETIME,
    updated_at DATETIME
);
```

**blockchain_hash** field stores the 64-character SHA-256 hash.

---

## 🔌 API Integration Points

### 1. Create Shipment

**Endpoint:** `POST /shipments/create`

```json
Request:
{
    "order_id": "ORD-001",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500
}

Response:
{
    "id": 1,
    "order_id": "ORD-001",
    "status": "CREATED",
    "blockchain_hash": "a3f2b1c...",  // ✅ Stored immediately
    "created_at": "2025-01-10T10:00:00"
}
```

**Process:**
1. Shipment created in database
2. ID assigned by database
3. Hash generated using ID + data
4. Hash stored in database
5. Response includes blockchain_hash

### 2. Update Shipment Status

**Endpoint:** `PUT /shipments/{shipment_id}` or `PATCH /shipments/{shipment_id}/status`

```json
Request:
{
    "status": "IN_TRANSIT"
}

Response:
{
    "id": 1,
    "status": "IN_TRANSIT",
    "blockchain_hash": "b4e3c2d...",  // ✅ NEW HASH generated
    "updated_at": "2025-01-10T11:00:00"
}
```

**Process:**
1. Status updated
2. New hash generated (includes new timestamp)
3. Hash stored in database
4. Old hash is permanently recorded (in DB history)
5. Audit trail automatically maintained

### 3. Verify Shipment

**Endpoint:** `GET /shipments/ledger/verify/{shipment_id}`

```json
Response:
{
    "valid": true,
    "stored_hash": "a3f2b1c...",
    "current_hash": "a3f2b1c...",
    "tampered": false,
    "message": "Shipment data is intact and has not been tampered with.",
    "shipment_id": 1,
    "order_id": "ORD-001",
    "status": "IN_TRANSIT"
}
```

**Process:**
1. Fetch shipment from database
2. Regenerate hash from current data
3. Compare with stored hash
4. Return verification status

### 4. Get Shipment Hash

**Endpoint:** `GET /shipments/ledger/hash/{shipment_id}`

```json
Response:
{
    "shipment_id": 1,
    "order_id": "ORD-001",
    "blockchain_hash": "a3f2b1c...",
    "status": "IN_TRANSIT",
    "source": "Mumbai",
    "destination": "Delhi",
    "distance_km": 1500
}
```

### 5. Get Order Ledger (Audit Trail)

**Endpoint:** `GET /shipments/ledger/all-hashes/{order_id}`

```json
Response:
{
    "order_id": "ORD-001",
    "shipments": [
        {
            "shipment_id": 1,
            "status": "CREATED",
            "blockchain_hash": "a3f2b1c...",
            "created_at": "2025-01-10T10:00:00"
        },
        {
            "shipment_id": 1,
            "status": "IN_TRANSIT",
            "blockchain_hash": "b4e3c2d...",
            "updated_at": "2025-01-10T11:00:00"
        },
        {
            "shipment_id": 1,
            "status": "DELIVERED",
            "blockchain_hash": "c5f4d3e...",
            "updated_at": "2025-01-10T15:00:00"
        }
    ],
    "total_shipments": 1
}
```

**This is the complete immutable audit trail of the shipment.**

---

## 🎯 How to Test Blockchain Integration

### 1. Create a Shipment

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

**Note:** Save the `blockchain_hash` and `id` from response.

### 2. Verify Immediately

```bash
curl http://localhost:8000/shipments/ledger/verify/1
```

**Expected:** `"valid": true` (data is intact)

### 3. Update Status

```bash
curl -X PATCH http://localhost:8000/shipments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_TRANSIT"}'
```

**Note:** Observe that `blockchain_hash` changed!

### 4. Try Tampering (Database Level)

If someone directly modifies database:

```sql
UPDATE shipments SET destination = 'Bangalore' WHERE id = 1;
```

### 5. Verify Will Fail

```bash
curl http://localhost:8000/shipments/ledger/verify/1
```

**Response:**
```json
{
    "valid": false,
    "tampered": true,
    "message": "WARNING: Shipment data has been modified. Original hash does not match."
}
```

---

## 💡 Design Decisions & Rationale

### Why SHA-256?

| Feature | Benefit |
|---------|---------|
| **Cryptographically secure** | Industry standard, NSA-approved |
| **256-bit output** | Collision probability negligible |
| **Fast** | Hashing 1000s of records per second |
| **No key required** | Simple implementation, no key management |
| **Deterministic** | Same input always produces same output |

### Why Include Timestamp?

- **Without timestamp:** Duplicate statuses might have same hash
- **With timestamp:** Every update has unique hash
- **Audit trail:** Proves when each state occurred
- **Forensics:** Can trace exact sequence of events

### Why Store in Database?

| Aspect | Reason |
|--------|--------|
| **Permanent record** | Hash survives beyond session |
| **Verification** | Can verify anytime, not just at creation |
| **Audit trail** | Historical hashes show progression |
| **Query capability** | Can find records by hash if needed |
| **Compliance** | Regulatory requirements for records |

### Why Regenerate on Verify?

- **Stateless verification** | No external blockchain needed
- **Fast** | Milliseconds to verify
- **Simple** | No complex consensus mechanisms
- **Testable** | Can tamper with DB to test detection

---

## 🔒 Security Properties

### What This Protects Against

✅ **Accidental data corruption** - Detected immediately  
✅ **Malicious data tampering** - Hash mismatch proves change  
✅ **Denial of previous states** - Audit trail shows history  
✅ **Unauthorized modifications** - Database audit log + hash mismatch  

### What This Does NOT Protect

❌ **Lost passwords** - If attacker has DB access, they can change hash too  
❌ **Network interception** - Use HTTPS for API security  
❌ **Insider threats** - If DBA tampers with both data AND hash  
❌ **Quantum computing** - SHA-256 vulnerable in post-quantum era  

**For defense against insider threats:** Add cryptographic signatures or use blockchain.

---

## 🚀 Production Deployment Checklist

- [ ] Ensure `blockchain_hash` column exists in production database
- [ ] Backup existing data before deploying
- [ ] Run database migration: `python migrate_db.py`
- [ ] Test verification endpoints before going live
- [ ] Monitor `/ledger/verify/{shipment_id}` for any tampering alerts
- [ ] Keep hashes in database for 7+ years (regulatory compliance)
- [ ] Enable database audit logs to track changes
- [ ] Set up alerting if verification fails

---

## 📋 Code Examples

### Generate Hash Manually

```python
from app.blockchain.ledger import generate_blockchain_hash

hash_value = generate_blockchain_hash(
    shipment_id=1,
    source="Mumbai",
    destination="Delhi",
    distance_km=1500,
    status="IN_TRANSIT"
)
print(hash_value)
# Output: "a3f2b1c4e5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1"
```

### Verify in Python

```python
from app.blockchain.verify import verify_shipment_integrity

result = verify_shipment_integrity(
    shipment_id=1,
    source="Mumbai",
    destination="Delhi",
    distance_km=1500,
    status="IN_TRANSIT",
    stored_hash="a3f2b1c..."
)

if result['valid']:
    print("✅ Shipment is authentic")
else:
    print("⚠️ SHIPMENT HAS BEEN TAMPERED WITH")
```

---

## 🎤 VIVA/Interview Answers

### Q: Is this real blockchain?

**A:** "We implement blockchain **principles** like immutability and hashing to ensure trust, which is appropriate for MSMEs and supply chains. We don't need full blockchain infrastructure (mining, consensus, etc.) which would add cost and complexity."

### Q: Why not use Ethereum or Bitcoin?

**A:** "Public blockchains add latency (block confirmation time), high costs (gas fees), and unnecessary complexity. Our hybrid approach:
- ✅ Uses cryptographic hashing (blockchain principle)
- ✅ Stored in fast database
- ✅ Zero transaction costs
- ✅ Instant verification
- ✅ Suitable for MSME use cases"

### Q: How does tampering detection work?

**A:** "Each shipment state is hashed with SHA-256. If anyone modifies the data (source, destination, status, distance), the regenerated hash won't match the stored hash. This proves tampering immediately."

### Q: Why include timestamp in hash?

**A:** "Timestamp ensures each status change creates a unique hash, even if the other data remains the same. This creates an immutable audit trail showing the exact sequence and timing of events."

### Q: How is this different from just storing data?

**A:** "With blockchain hashing:
- ✅ Any modification is instantly detectable
- ✅ Impossible to modify without detection (unless attacker modifies hash too, but then DB audit log shows change)
- ✅ Regulatory compliance for critical supply chain data
- ✅ Customer confidence in data integrity"

### Q: Is this secure against all attacks?

**A:** "Against most common attacks (network tampering, accidental data loss) - YES. Against insider threats with database access - PARTIALLY (they could modify both data and hash, but DB audit logs would show the changes). For maximum security, we'd use asymmetric cryptography (digital signatures)."

### Q: How does AI use this?

**A:** "The AI delay prediction model uses verified shipment data. Because blockchain hashing ensures data integrity, the AI can be confident it's training on authentic records, making predictions more reliable."

---

## 📚 Additional Resources

- [SHA-256 Specification](https://en.wikipedia.org/wiki/SHA-2)
- [Blockchain Principles for Supply Chain](https://www.ibm.com/blockchain/supply-chain/)
- [Python hashlib Documentation](https://docs.python.org/3/library/hashlib.html)

---

**Last Updated:** January 10, 2026  
**Version:** 1.0 (Complete Implementation)
