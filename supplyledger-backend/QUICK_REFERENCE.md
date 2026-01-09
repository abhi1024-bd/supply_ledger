# Quick Reference Card - Delay Prediction System

## 📋 One-Page Overview

### What It Does
Predicts shipment delays using **live maps + weather data**, not ML models.

### How It Works
```
Distance/Traffic from Maps API → Traffic Factor
                               → Total Delay
Weather from Weather API      → Weather Factor
```

### Files
```
✅ app/utils/maps.py      (66 lines) - Route data
✅ app/utils/weather.py   (31 lines) - Weather impact  
✅ app/utils/traffic.py   (26 lines) - Congestion calc
✅ app/ai/delay_prediction.py       - Main logic (66 lines)
```

### Endpoint
```
GET /shipments/{id}/predict-delay
```

---

## ⚡ Configuration (2 minutes)

1. **Get API Keys:**
   - OpenRouteService: https://openrouteservice.org/ (sign up)
   - OpenWeatherMap: https://openweathermap.org/api (sign up)

2. **Add to `.env`:**
   ```
   OPENROUTESERVICE_KEY=xxx
   OPENWEATHER_API_KEY=xxx
   ```

3. **Install (already done):**
   ```bash
   pip install requests
   ```

---

## 🎯 The Formula (Easy for Viva)

```
Base Time = Map API duration

Traffic Delay = Base Time × Traffic Factor
  (factor depends on actual vs expected time)

Weather Delay = Base Time × Weather Factor
  (0% clear, 5% clouds, 15% rain, 30% storm)

Total Delay = Traffic Delay + Weather Delay

Risk = HIGH (>45 min) | MEDIUM (20-45 min) | LOW (<20 min)
```

**Example:** 
- 4-hour trip (240 min)
- Moderate traffic (factor 0.15) = 36 min delay
- Light rain (factor 0.05) = 12 min delay
- Total: 48 min delay = **HIGH risk**

---

## 📊 Response Structure

```json
{
  "shipment_id": 1,
  "prediction": {
    "distance_km": 215.45,
    "base_time_min": 235.8,
    "traffic_delay_min": 35.37,
    "weather_delay_min": 11.79,
    "total_delay_min": 47.16,
    "risk_level": "HIGH"
  }
}
```

---

## 🧪 Quick Test

```python
# Test function directly
from app.ai.delay_prediction import predict_delay

result = predict_delay(
    source_coords=[-74.0060, 40.7128],     # NYC
    dest_coords=[-71.0589, 42.3601],       # Boston
    destination_city="Boston"
)

print(result['risk_level'])  # HIGH, MEDIUM, or LOW
```

---

## 🗣️ Viva Answer (2 mins)

**Q: How does your delay prediction work?**

**A:** "We predict delays using **live data from two APIs**:

1. **OpenRouteService** gives us real route distance and traffic-aware travel time
2. **OpenWeatherMap** gives us current weather conditions

We then calculate two delay components:
- **Traffic delay** = travel time × (actual duration / expected duration)
- **Weather delay** = travel time × weather factor (0-30% depending on conditions)

The total delay = traffic delay + weather delay. We categorize this as:
- LOW: < 20 minutes
- MEDIUM: 20-45 minutes  
- HIGH: > 45 minutes

All factors are transparent and easy to explain - no black-box ML model."

---

## ✅ Why This Is Good

✔️ Uses **live data** (not old training data)
✔️ **Transparent** (easy to explain factors)
✔️ **Realistic** (logistics companies use similar logic)
✔️ **Easy to understand** (simple math, not ML)
✔️ **Auditable** (can see every calculation)
✔️ **Viva-friendly** (explainable in 2 minutes)

---

## 🚨 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| 400 Error: "coordinates not available" | Add source_coords & dest_coords to shipment |
| 500 Error on request | Check API keys in `.env` |
| All predictions show LOW | Weather API failing - verify key |
| Timeout errors | Slow internet - increase timeout in maps.py |
| Wrong distance | Check coordinates are [longitude, latitude] |

---

## 📚 Full Documentation

For more details, see:
- **DELAY_PREDICTION_GUIDE.md** - Full architecture
- **VIVA_Q_AND_A.md** - 20 detailed Q&As
- **TESTING_GUIDE.md** - Test cases
- **SETUP_DELAY_PREDICTION.md** - Step-by-step setup

---

## 🎓 Key Points to Memorize

1. **System type:** Live API-based (not ML)
2. **Main APIs:** OpenRouteService + OpenWeatherMap
3. **Core factors:** Traffic (from duration ratio) + Weather (fixed multipliers)
4. **Output:** Risk level (LOW/MEDIUM/HIGH) based on total delay
5. **Advantage:** Transparent, auditable, realistic

---

## 📞 Quick Links

```
API Keys:
- ORS: https://openrouteservice.org/
- OWM: https://openweathermap.org/api

Endpoint: GET /shipments/{id}/predict-delay

Dependencies: requests (pip install requests)

Coordinates format: [longitude, latitude]
Example: NYC = [-74.0060, 40.7128]
```

---

## ⏱️ Performance

- Per prediction: **1-2 seconds** (API calls)
- With caching: **<100ms**
- Free tier limit: **2,500/day**

---

## 🎯 Viva Checklist

Before viva, make sure you can:
- [ ] Explain the formula in < 2 minutes
- [ ] Draw the system architecture
- [ ] Explain why not using ML model
- [ ] Show a real API response
- [ ] List the 3 utility files and their roles
- [ ] Explain traffic factor calculation
- [ ] Explain weather factor mapping
- [ ] Answer "What if API is down?" (fallback)

---

**Status:** ✅ Ready for viva  
**Confidence Level:** 🟢 High  
**Time to explain:** ⏱️ 2-3 minutes
