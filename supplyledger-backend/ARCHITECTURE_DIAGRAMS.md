# System Architecture Diagrams & Visuals

## 1. Overall System Flow

```
┌─────────────────────────────────────────────────────────┐
│ Frontend / API Client                                   │
│ GET /shipments/1/predict-delay                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ shipment_routes.py - API Endpoint Handler               │
│ - Get shipment from database                            │
│ - Extract coordinates and destination city             │
│ - Call predict_delay()                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ delay_prediction.py - Main Prediction Logic              │
│ predict_delay(source_coords, dest_coords, city)        │
└──────┬────────────┬──────────────────────┬──────────────┘
       │            │                      │
       │ (parallel) │                      │ (parallel)
       ▼            ▼                      ▼
   ┌──────────┐  ┌──────────┐         ┌──────────────┐
   │maps.py   │  │maps.py   │         │weather.py    │
   │get_route │  │traffic   │         │get_weather   │
   │_data()   │  │_factor() │         │_factor()     │
   └────┬─────┘  └────┬─────┘         └────┬─────────┘
        │             │                     │
        ▼             ▼                     ▼
   ┌─────────────────────┐          ┌──────────────┐
   │OpenRouteService API │          │OpenWeatherMap│
   │Returns:            │          │Returns:      │
   │- distance_km       │          │- condition   │
   │- duration_min      │          │- temperature │
   └──────────┬──────────┘          └──────┬───────┘
              │                            │
              └────────────┬───────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Calculate Delays                     │
        │ - traffic_delay = duration × factor  │
        │ - weather_delay = duration × factor  │
        │ - total_delay = sum of delays        │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Determine Risk Level                 │
        │ HIGH:   > 45 min                     │
        │ MEDIUM: 20-45 min                    │
        │ LOW:    < 20 min                     │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Return Response to Client            │
        │ {                                    │
        │   distance_km: ...,                  │
        │   base_time_min: ...,                │
        │   traffic_delay_min: ...,            │
        │   weather_delay_min: ...,            │
        │   total_delay_min: ...,              │
        │   risk_level: "HIGH"|"MEDIUM"|"LOW"  │
        │ }                                    │
        └────────────────────────────────────────┘
```

---

## 2. Data Flow Through Components

```
INPUT:
  ┌─ source_coords: [-74.0060, 40.7128]
  ├─ dest_coords: [-71.0589, 42.3601]
  └─ destination_city: "Boston"
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
  ┌──────────────────────┐         ┌────────────────────────┐
  │ MAPS MODULE          │         │ WEATHER MODULE         │
  ├──────────────────────┤         ├────────────────────────┤
  │ get_route_data()     │         │ get_weather_factor()   │
  ├──────────────────────┤         ├────────────────────────┤
  │ Input:               │         │ Input:                 │
  │ - source_coords      │         │ - city name            │
  │ - dest_coords        │         │                        │
  │                      │         │ Process:               │
  │ Process:             │         │ 1. Fetch weather API   │
  │ 1. Call API          │         │ 2. Parse condition     │
  │ 2. Extract distance  │         │ 3. Map to factor       │
  │ 3. Extract duration  │         │                        │
  │ 4. Handle errors     │         │ Output:                │
  │                      │         │ - factor: 0.0-0.30     │
  │ Output:              │         │ - (0% rain 5% clouds   │
  │ - distance: 215.45   │         │   15% rain 30% storm)  │
  │ - duration: 235.8    │         └────────────────────────┘
  └──────┬───────────────┘         
         │
         ▼
  ┌──────────────────────┐
  │ TRAFFIC MODULE       │
  ├──────────────────────┤
  │ get_traffic_factor() │
  ├──────────────────────┤
  │ Input:               │
  │ - distance: 215.45   │
  │ - duration: 235.8    │
  │                      │
  │ Process:             │
  │ 1. Calc expected time│
  │    = 215 / 60 * 60   │
  │    = 215 min         │
  │ 2. Compare ratio:    │
  │    = 235.8 / 215     │
  │    = 1.097 (light)   │
  │ 3. Return factor     │
  │                      │
  │ Output:              │
  │ - factor: 0.05       │
  │ - (light traffic)    │
  └────────┬─────────────┘
           │
           ▼
  ┌──────────────────────────────────────┐
  │ CALCULATION LAYER                    │
  ├──────────────────────────────────────┤
  │ base_time = 235.8 min                │
  │                                      │
  │ traffic_delay = 235.8 × 0.05 = 11.8 │
  │ weather_delay = 235.8 × 0.05 = 11.8 │
  │ total_delay = 11.8 + 11.8 = 23.6    │
  │                                      │
  │ risk_level:                          │
  │   23.6 > 20 → "MEDIUM"               │
  └──────────────┬───────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ RESPONSE            │
        ├─────────────────────┤
        │ {                   │
        │  distance_km: 215.45│
        │  base_time_min:235.8│
        │  traffic_delay: 11.8│
        │  weather_delay: 11.8│
        │  total_delay: 23.6  │
        │  risk_level:MEDIUM  │
        │ }                   │
        └─────────────────────┘
```

---

## 3. Database Schema

```
SHIPMENTS TABLE
┌──────────────────────────────────────────┐
│ Column           │ Type     │ Purpose    │
├──────────────────────────────────────────┤
│ id (PK)          │ Integer  │ Primary    │
│ order_id         │ String   │ FK to Order│
│ source           │ String   │ From city  │
│ destination      │ String   │ To city    │
│ source_coords ✨ │ JSON     │ [lon,lat]  │
│ dest_coords ✨   │ JSON     │ [lon,lat]  │
│ distance_km      │ Integer  │ Route dist │
│ status           │ String   │ Status     │
│ blockchain_hash  │ String   │ Security   │
│ estimated_del... │ DateTime │ Delivery   │
│ created_at       │ DateTime │ Timestamp  │
│ updated_at       │ DateTime │ Timestamp  │
└──────────────────────────────────────────┘

✨ = New fields added for delay prediction
```

---

## 4. API Request/Response Examples

### Request
```
GET /shipments/1/predict-delay
Host: localhost:8000
```

### Response (Success)
```json
{
  "shipment_id": 1,
  "order_id": "ORD-001",
  "source": "New York",
  "destination": "Boston",
  "prediction": {
    "distance_km": 215.45,
    "base_time_min": 235.8,
    "traffic_factor": 0.15,
    "traffic_delay_min": 35.37,
    "weather_factor": 0.05,
    "weather_delay_min": 11.79,
    "total_delay_min": 47.16,
    "risk_level": "HIGH",
    "data_source": "Live (Maps API + Weather API)"
  },
  "estimated_delivery": "2026-01-15T10:30:00"
}
```

### Response (Error)
```json
{
  "detail": "Shipment coordinates not available for delay prediction"
}
```

---

## 5. Component Dependencies

```
┌─────────────────────────────────────────────────────────┐
│ app/                                                    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ shipments/shipment_routes.py                        │ │
│ │ - Handles HTTP requests                             │ │
│ └────────────────────┬────────────────────────────────┘ │
│                      │ imports & calls                   │
│                      ▼                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ai/delay_prediction.py                              │ │
│ │ - Main prediction logic                             │ │
│ └────────────────────┬────────────────────────────────┘ │
│                      │ imports                          │
│        ┌─────────────┼─────────────┐                    │
│        │             │             │                    │
│        ▼             ▼             ▼                    │
│ ┌────────────┐ ┌─────────────┐ ┌──────────────┐       │
│ │utils/      │ │utils/       │ │utils/        │       │
│ │maps.py     │ │traffic.py   │ │weather.py    │       │
│ │ - API call │ │ - Calc ratio│ │ - API call   │       │
│ └────────┬───┘ └─────────────┘ └────────┬─────┘       │
│          │                              │               │
│          └──────────────┬───────────────┘               │
│                         │                               │
│    External Services ─ ┴──────────────────────        │
│    - OpenRouteService API                              │
│    - OpenWeatherMap API                                │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Traffic Factor Calculation Visual

```
Expected Speed: 60 km/h

Distance = 100 km
Expected Time = 100 km / 60 km/h = 1.67 hours = 100 minutes

Scenario 1: Light Traffic
  Actual Duration = 110 minutes
  Ratio = 110 / 100 = 1.10 (10% slower)
  Traffic Factor = 0.05 (light)
  Additional Delay = 100 × 0.05 = 5 minutes

Scenario 2: Moderate Traffic
  Actual Duration = 130 minutes
  Ratio = 130 / 100 = 1.30 (30% slower)
  Traffic Factor = 0.15 (moderate)
  Additional Delay = 100 × 0.15 = 15 minutes

Scenario 3: Heavy Traffic
  Actual Duration = 160 minutes
  Ratio = 160 / 100 = 1.60 (60% slower)
  Traffic Factor = 0.30 (heavy)
  Additional Delay = 100 × 0.30 = 30 minutes

Factor Decision:
  Ratio > 1.5 ──► Factor = 0.30 (HIGH)
  1.2 < Ratio ≤ 1.5 ──► Factor = 0.15 (MODERATE)
  Ratio ≤ 1.2 ──► Factor = 0.05 (LIGHT)
```

---

## 7. Weather Factor Mapping

```
╔═════════════════╦═══════════╦════════════════════╗
║ Weather Type    ║ Factor    ║ Impact on Travel   ║
╠═════════════════╬═══════════╬════════════════════╣
║ Clear           ║ 0.0 (0%)  ║ No impact          ║
║ Clouds          ║ 0.05 (5%) ║ Minimal slowdown   ║
║ Rain            ║ 0.15(15%) ║ Reduced grip, wind ║
║ Thunderstorm    ║ 0.30(30%) ║ Severe: floods     ║
╚═════════════════╩═══════════╩════════════════════╝

Example:
  Base Travel Time = 240 minutes
  Weather = Rain (Factor 0.15)
  Additional Delay = 240 × 0.15 = 36 minutes
  Total Time = 240 + 36 = 276 minutes
```

---

## 8. Risk Level Classification

```
Total Delay Calculation
       │
       ├─ Traffic Delay = Base Time × Traffic Factor
       │                = 240 × 0.15 = 36 minutes
       │
       ├─ Weather Delay = Base Time × Weather Factor
       │                = 240 × 0.05 = 12 minutes
       │
       ▼
   Total Delay = 36 + 12 = 48 minutes

       │
       ├─ Total > 45 min? ────► YES ──► RISK = HIGH
       │
       ├─ Total > 20 min? ────► YES ──► RISK = MEDIUM
       │
       ▼
       RISK = LOW

Classification Ranges:
  ┌───────────────────────────────────────┐
  │ LOW     │ MEDIUM  │ HIGH               │
  │ 0-20 min│ 20-45min│ 45+ min            │
  │         │         │                    │
  │ Safe    │ Caution │ Alert              │
  └───────────────────────────────────────┘
```

---

## 9. Error Handling Flow

```
predict_delay() called
       │
       ├─ Try to get route data
       │  ├─ Success ──► (distance, duration)
       │  └─ Fail ──► Use Haversine formula
       │
       ├─ Try to get weather factor
       │  ├─ Success ──► factor (0.0-0.30)
       │  └─ Fail ──► factor = 0.0 (no weather delay)
       │
       ├─ Calculate traffic factor
       │  └─ Always succeeds (math-based)
       │
       ├─ Calculate delays
       │  └─ Always succeeds
       │
       ▼
   Return prediction
   (Even if partial data, system still works)
```

---

## 10. Time Sequence Diagram

```
Client          Backend         Maps API        Weather API
  │                │               │                 │
  │ GET /predict   │               │                 │
  │─────────────>  │               │                 │
  │                │ Request Route │                 │
  │                │──────────────>│                 │
  │                │               │                 │
  │                │  <1 second>   │                 │
  │                │               │                 │
  │                │<──────────────│                 │
  │                │ Get Weather   │                 │
  │                │────────────────────────────────>│
  │                │               │                 │
  │                │               │   <0.5 sec>     │
  │                │               │                 │
  │                │<────────────────────────────────│
  │                │ Calculate Delays                │
  │                │ (instant)                      │
  │                │ Return Response                │
  │<────────────────│                                │
  │                │                                 │
  
  Total Time: 1-2 seconds per request
```

---

## 11. File Structure Visualization

```
supplyledger-backend/
│
├── app/
│   ├── ai/
│   │   └── delay_prediction.py ✨ (UPDATED)
│   │       └── predict_delay() - Main function
│   │
│   ├── utils/
│   │   ├── maps.py ✨ (NEW)
│   │   │   ├── get_route_data()
│   │   │   └── estimate_distance()
│   │   │
│   │   ├── weather.py ✨ (NEW)
│   │   │   └── get_weather_factor()
│   │   │
│   │   ├── traffic.py ✨ (NEW)
│   │   │   └── get_traffic_factor()
│   │   │
│   │   └── hash_utils.py (existing)
│   │
│   ├── database/
│   │   └── models.py ✨ (UPDATED)
│   │       └── Shipment class (added coords)
│   │
│   └── shipments/
│       └── shipment_routes.py ✨ (UPDATED)
│           └── GET /predict-delay endpoint
│
├── DELAY_PREDICTION_GUIDE.md ✨ (NEW)
├── SETUP_DELAY_PREDICTION.md ✨ (NEW)
├── VIVA_Q_AND_A.md ✨ (NEW)
├── TESTING_GUIDE.md ✨ (NEW)
├── IMPLEMENTATION_SUMMARY.md ✨ (NEW)
└── QUICK_REFERENCE.md ✨ (NEW)

✨ = Files created or updated for delay prediction
```

---

## 12. Example Execution Trace

```
User Shipment: NYC → Boston
Coordinates: [-74.0060, 40.7128] → [-71.0589, 42.3601]
Destination: "Boston"

1. API Call to OpenRouteService
   Request: GET /directions/driving-car
   Response: distance=215450m, duration=14148s
   Parsed: 215.45 km, 235.8 minutes

2. Traffic Factor Calculation
   Expected Time = 215.45 / 60 × 60 = 215.45 minutes
   Ratio = 235.8 / 215.45 = 1.094 (9.4% slower)
   Traffic Factor = 0.05 (light traffic)

3. API Call to OpenWeatherMap
   Request: GET /weather?q=Boston
   Response: weather="Clouds"
   Weather Factor = 0.05

4. Delay Calculation
   Base Time = 235.8 minutes
   Traffic Delay = 235.8 × 0.05 = 11.79 minutes
   Weather Delay = 235.8 × 0.05 = 11.79 minutes
   Total Delay = 23.58 minutes

5. Risk Classification
   23.58 > 20 but < 45
   Risk Level = "MEDIUM"

6. Response
   {
     "distance_km": 215.45,
     "base_time_min": 235.8,
     "traffic_delay_min": 11.79,
     "weather_delay_min": 11.79,
     "total_delay_min": 23.58,
     "risk_level": "MEDIUM"
   }
```

---

These diagrams provide visual understanding of:
- ✅ System architecture
- ✅ Data flow
- ✅ Component interaction
- ✅ Database schema
- ✅ API request/response
- ✅ Calculation logic
- ✅ Error handling
- ✅ Timeline
- ✅ File organization
- ✅ Execution example

Use these for studying and explaining the system!
