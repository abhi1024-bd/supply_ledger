import requests
import os

API_KEY = os.getenv("OPENROUTESERVICE_KEY", "YOUR_OPENROUTESERVICE_KEY")

def get_route_data(source_coords, dest_coords):
    """
    Fetch real route distance and duration using OpenRouteService API.
    
    Args:
        source_coords: [longitude, latitude] of source
        dest_coords: [longitude, latitude] of destination
    
    Returns:
        tuple: (distance_km, duration_min)
    """
    try:
        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        headers = {"Authorization": API_KEY}
        body = {
            "coordinates": [source_coords, dest_coords]
        }

        response = requests.post(url, json=body, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if "features" not in data or len(data["features"]) == 0:
            # Fallback: estimate based on straight-line distance
            return estimate_distance(source_coords, dest_coords)
        
        summary = data["features"][0]["properties"]["summary"]

        distance_km = summary["distance"] / 1000
        duration_min = summary["duration"] / 60

        return distance_km, duration_min
    
    except Exception as e:
        print(f"Error fetching route data: {e}")
        # Fallback to estimation
        return estimate_distance(source_coords, dest_coords)


def estimate_distance(source_coords, dest_coords):
    """
    Fallback estimation using Haversine formula for straight-line distance.
    
    Args:
        source_coords: [longitude, latitude] of source
        dest_coords: [longitude, latitude] of destination
    
    Returns:
        tuple: (estimated_distance_km, estimated_duration_min)
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth radius in km
    
    lat1, lon1 = radians(source_coords[1]), radians(source_coords[0])
    lat2, lon2 = radians(dest_coords[1]), radians(dest_coords[0])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance_km = R * c
    
    # Assume average speed of 60 km/h
    avg_speed = 60
    duration_min = (distance_km / avg_speed) * 60
    
    return distance_km, duration_min
