from app.utils.maps import get_route_data
from app.utils.weather import get_weather_factor
from app.utils.traffic import get_traffic_factor


def predict_delay(source_coords, dest_coords, destination_city):
    """
    Predict shipment delay using real-time data from maps, traffic, and weather APIs.
    
    Formula:
        Base Time = Expected travel duration from map API
        Traffic Delay = Base Time × Traffic Factor
        Weather Delay = Base Time × Weather Factor
        Total Delay = Traffic Delay + Weather Delay
    
    Args:
        source_coords: [longitude, latitude] of source location
        dest_coords: [longitude, latitude] of destination location
        destination_city: Destination city name (string) for weather lookup
    
    Returns:
        dict: Comprehensive delay prediction with breakdown
    """
    try:
        # STEP 1: Get real route distance and expected duration from maps API
        distance_km, duration_min = get_route_data(source_coords, dest_coords)

        # STEP 2: Calculate traffic congestion factor
        traffic_factor = get_traffic_factor(distance_km, duration_min)

        # STEP 3: Get weather conditions and convert to delay factor
        weather_factor = get_weather_factor(destination_city)

        # STEP 4: Calculate delays
        base_time = duration_min
        traffic_delay = base_time * traffic_factor
        weather_delay = base_time * weather_factor
        total_delay = traffic_delay + weather_delay

        # STEP 5: Determine risk level
        if total_delay > 45:
            risk = "HIGH"
        elif total_delay > 20:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        return {
            "distance_km": round(distance_km, 2),
            "base_time_min": round(base_time, 2),
            "traffic_factor": round(traffic_factor, 2),
            "traffic_delay_min": round(traffic_delay, 2),
            "weather_factor": round(weather_factor, 2),
            "weather_delay_min": round(weather_delay, 2),
            "total_delay_min": round(total_delay, 2),
            "risk_level": risk,
            "data_source": "Live (Maps API + Weather API)"
        }
    
    except Exception as e:
        # Return error response in consistent format
        return {
            "error": str(e),
            "distance_km": None,
            "base_time_min": None,
            "traffic_delay_min": None,
            "weather_delay_min": None,
            "total_delay_min": None,
            "risk_level": "UNKNOWN",
            "data_source": "Error"
        }
