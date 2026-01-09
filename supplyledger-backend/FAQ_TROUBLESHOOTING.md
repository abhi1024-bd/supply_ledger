# FAQs & Troubleshooting - Delay Prediction System

## Common Questions

### Q1: Why didn't you use Machine Learning?
**A:** Because:
- ML models are "black boxes" - hard to explain in viva
- We'd need large training datasets (we don't have)
- Live data is more accurate than historical training
- Simple, transparent logic is better for students
- Easy to modify and improve the system

Our approach is used by real logistics companies because it's more transparent and maintainable.

---

### Q2: What if the APIs go down?
**A:** The system has graceful fallback:
- **Maps API down**: Uses Haversine formula (straight-line distance)
- **Weather API down**: Assumes no weather delay (factor = 0)
- **Both down**: Still returns distance-based estimate
- **Network error**: Returns error response with meaningful message

The system never crashes - it degrades gracefully.

---

### Q3: How accurate is this system?
**A:** Accuracy depends on data quality:
- ✅ **Maps API**: Very accurate (used by Google, Apple)
- ✅ **Weather API**: Accurate for current conditions
- ⚠️ **Traffic factor**: Estimates based on current ratio
- ⚠️ **Weather factor**: Fixed multipliers (could be refined)

For real-world use, you'd compare predictions vs actual delays and refine factors. But for a student project, this is solid.

---

### Q4: Can I test this without API keys?
**A:** Not fully, but you can:
1. Mock the API responses in tests
2. Use invalid keys to test fallback mechanism
3. Test the calculation logic directly with hardcoded values

```python
# Test calculation without APIs
from app.utils.traffic import get_traffic_factor
from app.utils.weather import get_weather_factor

traffic_factor = get_traffic_factor(100, 120)  # No API needed
weather_factor = get_weather_factor("Boston")  # Needs API
```

---

### Q5: Why [longitude, latitude] and not [latitude, longitude]?
**A:** Because:
- **Standard GIS format**: All map APIs use [lon, lat]
- **Easier to remember**: LON-gitude = Left-Right, LAT-itude = Up-Down
- **Longitude**: -180 to +180 (East-West)
- **Latitude**: -90 to +90 (North-South)

Example: New York = [-74.0060, 40.7128] (west longitude, north latitude)

---

### Q6: How do I know if my coordinates are correct?
**A:** Use a quick check:
- Longitude: -180 to +180 (negatives = West)
- Latitude: -90 to +90 (negatives = South)
- Test with known cities: NYC, Boston, LA, etc.

Visual tool: https://geojson.io/

---

## Troubleshooting Guide

### Issue: 400 Error - "Shipment coordinates not available"

**Cause**: Shipment created without source_coords/dest_coords

**Fix**: Update shipment creation to include coordinates:
```json
{
  "order_id": "ORD-001",
  "source": "New York",
  "destination": "Boston",
  "source_coords": [-74.0060, 40.7128],
  "dest_coords": [-71.0589, 42.3601],
  "distance_km": 215,
  "status": "CREATED"
}
```

**Or** Update existing shipment:
```python
shipment.source_coords = [-74.0060, 40.7128]
shipment.dest_coords = [-71.0589, 42.3601]
db.commit()
```

---

### Issue: 500 Error - "Internal Server Error"

**Common Causes:**

1. **API Key Missing**
   - Check `.env` file exists
   - Verify key names are exact:
     - `OPENROUTESERVICE_KEY`
     - `OPENWEATHER_API_KEY`
   - Check keys are valid (not expired)

2. **API Key Invalid**
   ```bash
   # Test manually
   curl -H "Authorization: YOUR_KEY" https://api.openrouteservice.org/v2/directions/driving-car
   ```

3. **Import Error**
   - Check all utility files exist
   - Verify imports in delay_prediction.py

**Fix**:
```bash
# Check logs
python -m uvicorn app.main:app --reload

# Look for specific error message
```

---

### Issue: Timeout - Request takes >5 seconds

**Cause**: Slow internet or slow API responses

**Fix Options**:

1. **Increase timeout in maps.py**:
```python
def get_route_data(source_coords, dest_coords):
    response = requests.post(url, json=body, headers=headers, timeout=20)  # Increase from 10
```

2. **Use connection pooling** for production:
```python
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(connect=3, backoff_factor=0.5)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)
```

3. **Implement caching**:
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def predict_delay_cached(source_str, dest_str, city):
    # Same logic, but cached
    pass
```

---

### Issue: Distance is clearly wrong (too large/small)

**Cause 1**: Coordinates are [lat, lon] instead of [lon, lat]
```python
# WRONG
source_coords = [40.7128, -74.0060]  # NYC

# CORRECT
source_coords = [-74.0060, 40.7128]  # NYC
```

**Cause 2**: Using degrees with minutes/seconds instead of decimal
```python
# WRONG
source_coords = [40°42'46"N, 74°00'22"W]

# CORRECT (decimal)
source_coords = [-74.0060, 40.7128]
```

**Fix**: Verify coordinates on https://geojson.io/

---

### Issue: All predictions show "LOW" risk

**Cause 1**: Weather API failing silently (factor = 0)
- Check weather API key
- Verify city name is correct (not city code)

**Cause 2**: Traffic factor always 0.05 (light)
- API returning unrealistic durations
- Or expected speed calculation wrong

**Fix**: Add debug logging:
```python
def predict_delay(source_coords, dest_coords, destination_city):
    print(f"DEBUG: Distance={distance_km}, Duration={duration_min}")
    print(f"DEBUG: Traffic Factor={traffic_factor}, Weather Factor={weather_factor}")
    # ... rest of code
```

---

### Issue: "ModuleNotFoundError: No module named 'requests'"

**Cause**: requests library not installed

**Fix**:
```bash
pip install requests
```

Or if using venv:
```bash
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install requests
```

---

### Issue: API returns different format than expected

**Cause**: API updated or different region/version

**Fix**: Print and inspect actual response:
```python
response = requests.post(url, json=body, headers=headers)
print(response.json())  # See actual structure
```

Then adjust parsing code accordingly.

---

### Issue: Coordinates stored as NULL in database

**Cause**: SQLAlchemy JSON type not configured properly

**Fix**: Check database/models.py:
```python
from sqlalchemy import JSON

source_coords = Column(JSON, nullable=True)
dest_coords = Column(JSON, nullable=True)
```

And ensure you're storing as list, not string:
```python
# CORRECT
shipment.source_coords = [-74.0060, 40.7128]

# WRONG
shipment.source_coords = "[-74.0060, 40.7128]"
```

---

## Performance Issues

### Slow Response Times (>5 seconds)

**Likely Causes**:
1. API calls taking too long
2. Network latency
3. Server load

**Solutions**:

1. **Implement Response Caching**:
```python
from datetime import datetime, timedelta

cache = {}

def predict_delay_cached(source_coords, dest_coords, destination_city):
    key = f"{source_coords}_{dest_coords}_{destination_city}"
    
    if key in cache:
        cached_time, cached_result = cache[key]
        if datetime.now() - cached_time < timedelta(hours=1):
            return cached_result
    
    result = predict_delay(source_coords, dest_coords, destination_city)
    cache[key] = (datetime.now(), result)
    return result
```

2. **Use Async API Calls**:
```python
import asyncio
import aiohttp

async def get_route_data_async(source, dest):
    async with aiohttp.ClientSession() as session:
        # Make async request
        pass
```

3. **Queue Predictions**:
- Process predictions asynchronously
- Return cached results immediately
- Update in background

---

## Testing Issues

### Tests Pass Locally, Fail on Server

**Possible Causes**:
1. API keys different
2. Network blocked by firewall
3. Different Python version
4. Missing dependencies on server

**Fix**:
```bash
# On server, verify:
python --version
pip freeze | grep requests
python -c "import app.utils.maps; print(maps.API_KEY)"
```

---

### Mock API Tests

```python
from unittest.mock import patch, MagicMock

@patch('app.utils.maps.requests.post')
def test_predict_delay_mocked(mock_post):
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "features": [{
            "properties": {
                "summary": {
                    "distance": 215450,
                    "duration": 14148
                }
            }
        }]
    }
    mock_post.return_value = mock_response
    
    result = predict_delay(
        [-74.0060, 40.7128],
        [-71.0589, 42.3601],
        "Boston"
    )
    
    assert result['distance_km'] == 215.45
```

---

## Security Notes

### Don't Commit API Keys!

**WRONG**:
```python
# app/utils/maps.py
API_KEY = "sk-1234567890"  # EXPOSED!
```

**CORRECT**:
```python
# app/utils/maps.py
import os
API_KEY = os.getenv("OPENROUTESERVICE_KEY", "YOUR_KEY")

# .env file
OPENROUTESERVICE_KEY=sk-1234567890

# .gitignore
.env
```

---

### Rate Limiting

Free API tiers have limits:
- **OpenRouteService**: 2,500 calls/day
- **OpenWeatherMap**: 60 calls/minute

**For Production**:
```python
from ratelimit import limits, sleep_and_retry
import time

@sleep_and_retry
@limits(calls=60, period=60)  # 60 calls per minute
def get_weather_factor(city):
    # ... make API call
    pass
```

---

## Quick Diagnostics

Run this to check system health:

```python
#!/usr/bin/env python3

import requests
import os
from app.utils.maps import get_route_data
from app.utils.weather import get_weather_factor
from app.utils.traffic import get_traffic_factor

print("=== Delay Prediction System Diagnostics ===\n")

# 1. Check API Keys
print("1. Checking API Keys:")
ors_key = os.getenv("OPENROUTESERVICE_KEY")
owm_key = os.getenv("OPENWEATHER_API_KEY")
print(f"   OpenRouteService: {'✓' if ors_key else '✗ MISSING'}")
print(f"   OpenWeatherMap: {'✓' if owm_key else '✗ MISSING'}\n")

# 2. Test Maps API
print("2. Testing Maps API:")
try:
    distance, duration = get_route_data(
        [-74.0060, 40.7128],  # NYC
        [-71.0589, 42.3601]   # Boston
    )
    print(f"   ✓ Success: {distance:.2f} km, {duration:.2f} min\n")
except Exception as e:
    print(f"   ✗ Error: {e}\n")

# 3. Test Weather API
print("3. Testing Weather API:")
try:
    factor = get_weather_factor("Boston")
    print(f"   ✓ Success: Weather factor = {factor}\n")
except Exception as e:
    print(f"   ✗ Error: {e}\n")

# 4. Test Traffic Factor
print("4. Testing Traffic Factor:")
try:
    factor = get_traffic_factor(215.45, 235.8)
    print(f"   ✓ Success: Traffic factor = {factor}\n")
except Exception as e:
    print(f"   ✗ Error: {e}\n")

print("=== Diagnostics Complete ===")
```

---

## When to Use Fallbacks

The system automatically uses fallbacks when:

1. **Maps API fails**
   → Haversine formula (straight-line distance)
   → Assume 60 km/h average speed

2. **Weather API fails**
   → No weather delay (factor = 0)
   → Traffic delay still calculated

3. **Invalid input**
   → Return error response
   → Don't crash system

This is **production-grade** error handling!

---

## Final Checklist Before Going Live

- [ ] API keys obtained and verified
- [ ] `.env` file configured correctly
- [ ] All utility files created
- [ ] Database migrated (source_coords, dest_coords added)
- [ ] Tests passing
- [ ] Error handling tested
- [ ] Response time acceptable
- [ ] Coordinates format correct
- [ ] Viva explanation prepared
- [ ] Documentation reviewed

---

**Remember**: This system is designed to be:
✅ Robust (handles errors)
✅ Fast (1-2 seconds)
✅ Accurate (uses live data)
✅ Explainable (transparent logic)
✅ Maintainable (modular code)

You should feel confident with this implementation!
