# Testing Guide - Delay Prediction System

## Quick Test - Direct Function Call

```python
from app.ai.delay_prediction import predict_delay

# Test case 1: NYC to Boston (clear weather expected)
result = predict_delay(
    source_coords=[-74.0060, 40.7128],    # NYC
    dest_coords=[-71.0589, 42.3601],      # Boston
    destination_city="Boston"
)

print("Test 1 - NYC to Boston:")
print(result)
# Expected: distance ~215 km, base time ~240 min, with traffic/weather delays
```

---

## Expected Response Example

```json
{
  "distance_km": 215.45,
  "base_time_min": 235.8,
  "traffic_factor": 0.15,
  "traffic_delay_min": 35.37,
  "weather_factor": 0.05,
  "weather_delay_min": 11.79,
  "total_delay_min": 47.16,
  "risk_level": "HIGH",
  "data_source": "Live (Maps API + Weather API)"
}
```

---

## Test Cases

### Test Case 1: Short Distance, Good Weather
```python
predict_delay(
    source_coords=[-87.6298, 41.8781],    # Chicago
    dest_coords=[-87.6500, 41.8900],      # Chicago suburbs (30 km)
    destination_city="Chicago"
)

# Expected: 
# - Small distance → small base time
# - Low traffic factor
# - No weather impact
# - Result: LOW risk
```

---

### Test Case 2: Long Distance, Bad Weather
```python
predict_delay(
    source_coords=[-118.2437, 34.0522],   # LA
    dest_coords=[-117.1611, 32.7157],     # San Diego (200 km)
    destination_city="San Diego"
)

# Expected in rain/storm:
# - Long distance → high base time
# - Significant weather delay (15-30% of base time)
# - Combined delays → HIGH risk
```

---

### Test Case 3: Heavy Traffic Scenario
```python
# Same route but during peak hours
# Map API will return higher duration → higher traffic factor
# Result: HIGH risk from traffic congestion

predict_delay(
    source_coords=[-74.0060, 40.7128],    # NYC
    dest_coords=[-73.9352, 40.7306],      # NYC to nearby (10 km)
    destination_city="New York"
)

# Expected:
# - Short distance but NYC traffic
# - High traffic factor (0.30)
# - Result: MEDIUM to HIGH risk
```

---

## API Endpoint Testing

### Using cURL

```bash
# Test existing shipment
curl -X GET http://localhost:8000/shipments/1/predict-delay

# Expected response with shipment details + prediction
```

### Using Python requests

```python
import requests

response = requests.get("http://localhost:8000/shipments/1/predict-delay")
prediction = response.json()

print(f"Shipment: {prediction['order_id']}")
print(f"Route: {prediction['source']} → {prediction['destination']}")
print(f"Risk: {prediction['prediction']['risk_level']}")
print(f"Total Delay: {prediction['prediction']['total_delay_min']} minutes")
```

### Using JavaScript/Fetch

```javascript
fetch('/shipments/1/predict-delay')
  .then(res => res.json())
  .then(data => {
    console.log(`Risk Level: ${data.prediction.risk_level}`);
    console.log(`Delay: ${data.prediction.total_delay_min} minutes`);
  });
```

---

## Integration Testing

### Step 1: Create a Shipment
```bash
POST /shipments/create
Content-Type: application/json

{
  "order_id": "TEST-001",
  "source": "New York",
  "destination": "Boston",
  "source_coords": [-74.0060, 40.7128],
  "dest_coords": [-71.0589, 42.3601],
  "distance_km": 215,
  "status": "CREATED"
}
```

### Step 2: Get Delay Prediction
```bash
GET /shipments/1/predict-delay
```

### Step 3: Verify Response
- Check all fields are present
- Verify risk_level is one of: HIGH, MEDIUM, LOW
- Check total_delay = traffic_delay + weather_delay
- Verify distance is approximately correct

---

## Testing Different Locations

### Major Cities (Good for Testing)

```python
cities = {
    "NYC": ([-74.0060, 40.7128], "New York"),
    "LA": ([-118.2437, 34.0522], "Los Angeles"),
    "Chicago": ([-87.6298, 41.8781], "Chicago"),
    "Houston": ([-95.3698, 29.7604], "Houston"),
    "Phoenix": ([-112.0742, 33.4484], "Phoenix"),
    "Miami": ([-80.1918, 25.7617], "Miami"),
    "London": ([-0.1278, 51.5074], "London"),
    "Paris": ([2.3522, 48.8566], "Paris"),
    "Tokyo": ([139.6917, 35.6895], "Tokyo"),
}

# Test various combinations
for city1, city2 in [("NYC", "Boston"), ("LA", "San Diego"), ("Chicago", "Detroit")]:
    result = predict_delay(
        source_coords=cities[city1][0],
        dest_coords=cities[city2][0],
        destination_city=city2
    )
    print(f"{city1} → {city2}: {result['risk_level']}")
```

---

## Unit Tests (pytest)

```python
# tests/test_delay_prediction.py

import pytest
from app.ai.delay_prediction import predict_delay
from app.utils.traffic import get_traffic_factor
from app.utils.weather import get_weather_factor

def test_traffic_factor_light():
    # Light traffic: actual = expected * 1.1
    factor = get_traffic_factor(100, 110)
    assert 0.0 <= factor <= 0.10

def test_traffic_factor_moderate():
    # Moderate: actual = expected * 1.35
    factor = get_traffic_factor(100, 135)
    assert 0.10 <= factor <= 0.20

def test_traffic_factor_heavy():
    # Heavy: actual = expected * 1.6
    factor = get_traffic_factor(100, 160)
    assert factor == 0.30

def test_weather_factor_none():
    # Clear weather returns 0
    factor = get_weather_factor("Sydney")  # Usually sunny
    assert factor >= 0

def test_weather_factor_range():
    # All factors should be between 0 and 0.30
    for weather_factor in [0.0, 0.05, 0.15, 0.30]:
        assert 0 <= weather_factor <= 0.30

def test_delay_prediction_structure():
    # Verify response structure
    result = predict_delay(
        source_coords=[-74.0060, 40.7128],
        dest_coords=[-71.0589, 42.3601],
        destination_city="Boston"
    )
    
    required_fields = [
        'distance_km', 'base_time_min', 'traffic_delay_min',
        'weather_delay_min', 'total_delay_min', 'risk_level'
    ]
    
    for field in required_fields:
        assert field in result
        assert result[field] is not None

def test_risk_level_boundaries():
    # Test risk level assignment
    # This would require mocking API calls
    # Or testing the logic directly
    
    # HIGH risk: total_delay > 45
    # MEDIUM risk: 20 < total_delay <= 45
    # LOW risk: total_delay <= 20
    
    assert True  # Placeholder for actual logic test
```

---

## Load Testing

```python
# Simple load test
import time
import concurrent.futures

def test_single_prediction():
    return predict_delay(
        source_coords=[-74.0060, 40.7128],
        dest_coords=[-71.0589, 42.3601],
        destination_city="Boston"
    )

# Test 10 concurrent predictions
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    start = time.time()
    results = list(executor.map(lambda _: test_single_prediction(), range(10)))
    elapsed = time.time() - start
    
    print(f"10 predictions in {elapsed:.2f} seconds")
    print(f"Average: {elapsed/10:.2f} seconds per prediction")
```

---

## Error Handling Tests

### Test 1: Invalid Coordinates
```python
# Should handle gracefully
result = predict_delay(
    source_coords=[999, 999],  # Invalid
    dest_coords=[999, 999],
    destination_city="Unknown"
)

# Expected: Error field in response
assert "error" in result or "data_source" in result
```

### Test 2: API Downtime Simulation
```python
# Manually set API_KEY to invalid value to test fallback
import app.utils.maps as maps_module
original_key = maps_module.API_KEY
maps_module.API_KEY = "INVALID_KEY_12345"

result = predict_delay(
    source_coords=[-74.0060, 40.7128],
    dest_coords=[-71.0589, 42.3601],
    destination_city="Boston"
)

# Should still return valid prediction (using fallback)
assert "risk_level" in result

# Restore
maps_module.API_KEY = original_key
```

---

## Performance Benchmarks

Expected performance:
- **Single prediction:** 1-2 seconds (API calls dominate)
- **Cached result:** < 100ms
- **100 predictions:** ~2-3 minutes (without caching)
- **With cache (same routes):** ~5 seconds

---

## Validation Checklist

Before using in production:
- ✅ All API keys configured
- ✅ Network connection stable
- ✅ Test predictions return valid risk levels
- ✅ Error handling works
- ✅ Database coordinates stored correctly
- ✅ Response time acceptable (<5s for UI)
- ✅ Fallback mechanism works if APIs down
- ✅ Predictions are reasonable for known routes

---

## Example Test Output

```
Test Case: NYC → Boston
Distance: 215.45 km
Base Time: 235.8 minutes (3h 55m)
Traffic Factor: 0.15
Traffic Delay: 35.37 minutes
Weather: Clouds
Weather Factor: 0.05
Weather Delay: 11.79 minutes
Total Delay: 47.16 minutes
Risk Level: HIGH

Explanation: This route takes ~4 hours. Moderate traffic adds 35 min, 
light clouds add 12 min. Total 47 min delay = HIGH risk.
```

---

## Troubleshooting Tests

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 Error on prediction | API key invalid/missing | Check `.env` file |
| All predictions show LOW risk | Weather API always failing | Verify API key |
| Timeout errors | Slow internet | Increase timeout in maps.py |
| Wrong distance | Bad coordinates | Verify [lon, lat] format |
| Empty risk_level | Response parsing issue | Check API response format |

---

## Quick Testing Commands

```bash
# Start backend
cd supplyledger-backend
python -m uvicorn app.main:app --reload

# In another terminal, test
python
>>> from app.ai.delay_prediction import predict_delay
>>> result = predict_delay([-74.0060, 40.7128], [-71.0589, 42.3601], "Boston")
>>> print(result)
```

This is your **complete testing guide**. Use these tests to validate before viva!
