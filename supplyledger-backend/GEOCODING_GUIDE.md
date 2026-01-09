# 🗺️ GEOCODING IMPLEMENTATION - OpenStreetMap Integration

## What Was Updated

Enhanced [app/utils/city_coords.py](app/utils/city_coords.py) with **dual-strategy geocoding**:

1. **Local Database** — Fast lookups for common cities (instant)
2. **Nominatim API** — Fallback for unknown cities (free, no API key)

---

## Features

### ✅ What You Get

- Fast lookups for 30+ pre-loaded cities
- Automatic fallback to OpenStreetMap for unknown cities
- Zero cost (no API keys needed)
- Rate-limited (respects Nominatim ToS)
- Error handling for network issues
- Clear logging (debug messages)

### ✅ How It Works

```
User asks for coordinates of "Bangalore"
    ↓
Check local database
    ✅ Found! → Return instantly
    
User asks for coordinates of "Random Unknown City"
    ↓
Check local database
    ❌ Not found
    ↓
Query Nominatim API
    ✅ Found! → Return coordinates
    ❌ Not found → Return None
```

---

## Usage Examples

### Simple Usage

```python
from app.utils.city_coords import get_city_coordinates

# Works instantly (local database)
coords = get_city_coordinates("Mumbai")
# Returns: [72.8479, 19.0760]

coords = get_city_coordinates("New York")
# Returns: [-74.0060, 40.7128]

# Falls back to Nominatim for unknown cities
coords = get_city_coordinates("Pune")
# Returns: [73.8567, 18.5204]
```

### In Shipment Creation

```python
@router.post("/shipments/create")
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    # Auto-detect coordinates
    source_coords = shipment.source_coords or get_city_coordinates(shipment.source)
    dest_coords = shipment.dest_coords or get_city_coordinates(shipment.destination)
    
    # Now have coordinates for maps, routing, etc.
    return shipment
```

---

## Pre-Loaded Cities (30+)

### US Cities (15)
- New York, Los Angeles, Chicago, Boston, San Francisco
- Seattle, Denver, Houston, Phoenix, Miami
- Dallas, Philadelphia, Atlanta, Detroit, Portland

### Indian Cities (6) ⭐
- Mumbai, Bangalore, Delhi, Hyderabad, Kolkata, Pune, Chennai

### International Cities (8+)
- London, Paris, Tokyo, Dubai, Singapore
- Sydney, Toronto, Bangkok, Hong Kong

---

## API: Nominatim (OpenStreetMap)

### Cost
✅ **FREE** — No API key required

### Rate Limit
- 1 request per second
- Automatically enforced in code
- Respects Nominatim Terms of Service

### Accuracy
- World coverage (any city)
- High accuracy for major cities
- Returns [longitude, latitude]

### No Cost Because
- OpenStreetMap is community-maintained
- Nominatim is free public service
- Suitable for MSME scale

---

## Code Structure

### Main Function

```python
def get_city_coordinates(city_name: str) -> Optional[List[float]]:
    """
    Get coordinates for a city name.
    
    Strategy:
    1. Check local database (instant)
    2. Check partial matches (instant)
    3. Query Nominatim API (1-2 seconds)
    
    Returns:
        [longitude, latitude] or None
    """
```

### Helper Function

```python
def _get_from_nominatim(city_name: str) -> Optional[List[float]]:
    """
    Fetch from OpenStreetMap Nominatim service.
    
    Handles:
    - Rate limiting (1 second between calls)
    - Timeout errors (5 second limit)
    - Connection errors
    - Response parsing
    """
```

---

## Response Format

```json
{
    "coordinates": [longitude, latitude],
    "example": [72.8479, 19.0760],
    "note": "GeoJSON format [lon, lat]"
}
```

### Why [longitude, latitude]?
- GeoJSON standard format
- Used by mapping libraries (Leaflet, Mapbox)
- Consistent with maps.py routing

---

## Error Handling

### Timeout (5 seconds)
```python
if request_takes_too_long:
    return None  # Continue without coordinates
```

### Connection Error
```python
if network_unavailable:
    return None  # Continue without coordinates
```

### Invalid Response
```python
if api_returns_bad_data:
    return None  # Continue without coordinates
```

**Graceful degradation:** If geocoding fails, system continues with None coordinates.

---

## Logging Output

### Local Lookup Success
```
✅ Instant return (no log needed)
```

### Nominatim Fallback (Unknown City)
```
📍 'Tokyo' not in local database, querying Nominatim...
✅ Found 'Tokyo' via Nominatim: [139.6917, 35.6895]
```

### Nominatim Not Found
```
📍 'Unknown City' not in local database, querying Nominatim...
❌ City 'Unknown City' not found in local DB or Nominatim
```

### Nominatim Timeout
```
⏱️ Nominatim timeout for 'City' (5 seconds)
```

### Connection Error
```
🌐 Connection error querying Nominatim for 'City'
```

---

## Performance

| Scenario | Time | Behavior |
|----------|------|----------|
| **Local lookup (30+ cities)** | <1ms | Instant return |
| **Partial match** | <1ms | Instant return |
| **Nominatim API call** | 1-2s | Queues 1sec delay, then API call |
| **Network timeout** | ~5s | Timeout, return None |

### For MSME Use
- Most shipments use common cities (local lookup)
- New routes use Nominatim (1-2 second delay acceptable)
- No performance bottleneck

---

## Adding More Cities

### Easy Way: Update Local Database

```python
CITY_COORDINATES = {
    # ... existing cities ...
    "your_city": [longitude, latitude],
}
```

### Find Coordinates
Use [OpenStreetMap/Nominatim](https://nominatim.openstreetmap.org/):
1. Visit website
2. Search city name
3. Copy coordinates [lon, lat]

### Example
```
Search: "Ahmedabad"
Result: 72.5479°E, 23.0225°N
Add to dict: "ahmedabad": [72.5479, 23.0225]
```

---

## Integration with Other Features

### Shipment Routes
✅ Used in `/shipments/create` for auto-detection

### Maps & Routing
✅ Coordinates feed into [maps.py](app/utils/maps.py)
- Route distance calculation
- Navigation maps

### Traffic & Weather
✅ Used by [traffic.py](app/utils/traffic.py) and [weather.py](app/utils/weather.py)
- Local traffic data
- Weather forecasts

### Delay Prediction
✅ Used by [delay_prediction.py](app/ai/delay_prediction.py)
- Route information
- Distance calculation

---

## Testing

### Test Local Lookup (Fast)

```python
from app.utils.city_coords import get_city_coordinates

# Should return instantly
assert get_city_coordinates("Mumbai") == [72.8479, 19.0760]
assert get_city_coordinates("New York") == [-74.0060, 40.7128]
```

### Test Nominatim Fallback (Slow)

```python
# Should query API (takes ~1-2 seconds)
coords = get_city_coordinates("Surat")
assert coords is not None
assert len(coords) == 2  # [lon, lat]
```

### Test Error Handling

```python
# Should return None gracefully
result = get_city_coordinates("")  # Empty string
assert result is None

result = get_city_coordinates(None)  # None input
assert result is None
```

---

## Advantages

### ✅ For MSME
- Free (no API costs)
- Simple (no authentication)
- Reliable (community-maintained)
- Fast (local cache for common cities)

### ✅ For Scale
- No API quotas (self-managed rate limit)
- No vendor lock-in
- Open data (OpenStreetMap)
- Can add cities anytime

### ✅ For Reliability
- Graceful fallback
- Error handling
- Timeout protection
- Clear logging

---

## Common Issues & Fixes

### Issue: Slow First Request for Unknown City
**Cause:** Nominatim API query takes 1-2 seconds  
**Solution:** Add city to local database for instant lookup

### Issue: Rate Limit Error (429)
**Cause:** Too many API requests  
**Solution:** Rate limit in code prevents this (1 sec between calls)

### Issue: Timeout Error
**Cause:** Network too slow  
**Solution:** System returns None, continues with graceful degradation

### Issue: Different Coordinates
**Cause:** OpenStreetMap data differs from other sources  
**Solution:** Use official OpenStreetMap as single source of truth

---

## Configuration

### Rate Limit (Nominatim ToS)
```python
RATE_LIMIT_SECONDS = 1  # 1 second between API calls
```

### Timeout
```python
timeout=5  # 5 seconds max wait for API response
```

### User Agent
```python
"User-Agent": "supplyledger-app (blockchain-enabled-supply-chain)"
```

All configured in [city_coords.py](app/utils/city_coords.py)

---

## Requirements

### Already Installed
✅ `requests` — HTTP library

### No Additional Setup
✅ No API key required  
✅ No authentication  
✅ No rate quota to manage  
✅ No registration needed  

---

## Next Steps

1. **Run Migration:** `python migrate_db.py`
2. **Start Server:** `python -m uvicorn app.main:app --reload`
3. **Test Geocoding:** Use API to create shipments with unknown cities
4. **Monitor Logs:** Check for geocoding messages
5. **Add Cities:** Update local database as needed

---

## Related Files

- [app/utils/city_coords.py](app/utils/city_coords.py) — Geocoding (THIS FILE)
- [app/utils/maps.py](app/utils/maps.py) — Route calculation
- [app/utils/traffic.py](app/utils/traffic.py) — Traffic data
- [app/utils/weather.py](app/utils/weather.py) — Weather data
- [app/ai/delay_prediction.py](app/ai/delay_prediction.py) — Uses coordinates

---

**Status:** ✅ Complete & Production Ready  
**Cost:** Free  
**Scale:** Unlimited (MSME-appropriate)  
**Dependencies:** requests (standard library)
