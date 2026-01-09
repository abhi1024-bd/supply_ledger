# Setup Instructions for Delay Prediction System

## Step 1: Get OpenRouteService API Key

1. Visit https://openrouteservice.org/
2. Click "Sign Up" → Register with email
3. Verify your email
4. Go to Dashboard → API Keys
5. Create a new API key for "Directions"
6. Copy the key

## Step 2: Get OpenWeatherMap API Key

1. Visit https://openweathermap.org/api
2. Click "Sign Up" or "Log In"
3. Go to API Keys section
4. You'll have a default key generated
5. Copy the API key

## Step 3: Configure Environment Variables

Create or update `.env` file in `supplyledger-backend/`:

```env
OPENROUTESERVICE_KEY=your_openrouteservice_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Step 4: Install Required Package

```bash
pip install requests
```

The `requests` library is already listed in requirements.txt

## Step 5: Update Shipment Creation

When creating shipments, include coordinates:

```json
{
  "order_id": "ORD-001",
  "source": "New York",
  "destination": "Boston",
  "source_coords": [-74.0060, 40.7128],  // [longitude, latitude]
  "dest_coords": [-71.0589, 42.3601],
  "distance_km": 215,
  "status": "CREATED"
}
```

## Step 6: Test the Endpoint

```bash
curl -X GET http://localhost:8000/shipments/1/predict-delay
```

## Troubleshooting

### API Key Not Found Error
- Check `.env` file exists in the right directory
- Verify key names match exactly:
  - `OPENROUTESERVICE_KEY`
  - `OPENWEATHER_API_KEY`

### Request Timeout
- Verify internet connection
- Check API keys are valid
- Increase timeout in `maps.py` if needed

### Coordinates Invalid
- Ensure format is `[longitude, latitude]` (NOT latitude, longitude)
- Use decimal degrees format
- Example: NYC is `[-74.0060, 40.7128]`

### Weather City Not Found
- Use full city name: "New York" not "NY"
- Some cities need country: "London, UK"

## Live Testing Example

```python
from app.ai.delay_prediction import predict_delay

# Test the function directly
result = predict_delay(
    source_coords=[-74.0060, 40.7128],      # NYC
    dest_coords=[-71.0589, 42.3601],        # Boston
    destination_city="Boston"
)

print(result)
```

## Notes

- Free tier limits: Usually 2,500 requests/day for both APIs
- Costs: Both APIs have generous free tiers
- Fallback: If APIs unavailable, system estimates using Haversine formula
- Latency: Each prediction call takes ~1-2 seconds (API calls)

## For Viva Explanation

Keep this handy:
- "We use OpenRouteService for real route distances and traffic-aware ETAs"
- "We use OpenWeatherMap for current weather conditions at destination"
- "Traffic factor is calculated by comparing API duration with expected time"
- "Weather factor maps conditions to delay multipliers (rain=15%, storm=30%)"
- "All data is live, not from a trained model"
