"""
City coordinates lookup with two strategies:
1. Local database (CITY_COORDINATES) — Fast lookups for common cities
2. Nominatim API (OpenStreetMap) — Free geocoding with no API key

The system tries local lookup first, then falls back to Nominatim for unknown cities.
"""

import requests
import time
from typing import Optional, List

# Local city coordinates database for fast lookups
CITY_COORDINATES = {
    # US Cities
    "new york": [-74.0060, 40.7128],
    "los angeles": [-118.2437, 34.0522],
    "chicago": [-87.6298, 41.8781],
    "boston": [-71.0589, 42.3601],
    "san francisco": [-122.4194, 37.7749],
    "seattle": [-122.3321, 47.6062],
    "denver": [-104.9903, 39.7392],
    "houston": [-95.3698, 29.7604],
    "phoenix": [-112.0742, 33.4484],
    "miami": [-80.1918, 25.7617],
    "dallas": [-96.7969, 32.7767],
    "philadelphia": [-75.1652, 39.9526],
    "atlanta": [-84.3880, 33.7490],
    "detroit": [-83.0458, 42.3314],
    "portland": [-122.6765, 45.5152],
    
    # International Cities
    "london": [-0.1278, 51.5074],
    "paris": [2.3522, 48.8566],
    "tokyo": [139.6917, 35.6895],
    "dubai": [55.2708, 25.2048],
    "singapore": [103.8198, 1.3521],
    "sydney": [151.2093, -33.8688],
    "toronto": [-79.3957, 43.6629],
    "mumbai": [72.8479, 19.0760],
    "bangalore": [77.5946, 12.9716],
    "delhi": [77.2090, 28.6139],
    "hyderabad": [78.4744, 17.3850],
    "kolkata": [88.3639, 22.5726],
    "chennai": [80.2707, 13.0827],
    "pune": [73.8567, 18.5204],
    "bangkok": [100.5018, 13.7563],
    "hong kong": [114.1733, 22.3193],
}

# Nominatim API configuration
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    "User-Agent": "supplyledger-app (blockchain-enabled-supply-chain)"
}

# Rate limiting: 1 second between API calls to respect Nominatim ToS
RATE_LIMIT_SECONDS = 1
_last_api_call = 0


def _get_from_nominatim(city_name: str) -> Optional[List[float]]:
    """
    Fetch coordinates from Nominatim API (OpenStreetMap).
    
    This is a fallback for cities not in the local database.
    
    Args:
        city_name: City name to geocode
    
    Returns:
        [longitude, latitude] or None if not found
    
    Notes:
        - Free service, no API key required
        - Rate limited to 1 request/second (respecting ToS)
        - Timeout of 5 seconds
    """
    global _last_api_call
    
    # Respect rate limiting
    time_since_last_call = time.time() - _last_api_call
    if time_since_last_call < RATE_LIMIT_SECONDS:
        time.sleep(RATE_LIMIT_SECONDS - time_since_last_call)
    
    _last_api_call = time.time()
    
    params = {
        "q": city_name,
        "format": "json",
        "limit": 1
    }
    
    try:
        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=HEADERS,
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        
        if not data:
            return None
        
        # Extract longitude and latitude from Nominatim response
        lon = float(data[0]["lon"])
        lat = float(data[0]["lat"])
        
        return [lon, lat]
    
    except requests.exceptions.Timeout:
        print(f"⏱️ Nominatim timeout for '{city_name}' (5 seconds)")
        return None
    except requests.exceptions.ConnectionError:
        print(f"🌐 Connection error querying Nominatim for '{city_name}'")
        return None
    except (ValueError, KeyError, IndexError) as e:
        print(f"❌ Error parsing Nominatim response for '{city_name}': {e}")
        return None
    except Exception as e:
        print(f"⚠️ Unexpected error geocoding '{city_name}': {e}")
        return None


def get_city_coordinates(city_name: str) -> Optional[List[float]]:
    """
    Get coordinates for a city name using two strategies:
    
    1. Local lookup (CITY_COORDINATES) — Fast, always works
    2. Nominatim API — Fallback for unknown cities
    
    Args:
        city_name: City name (string)
    
    Returns:
        [longitude, latitude] or None if not found
    
    Examples:
        >>> get_city_coordinates("Mumbai")
        [72.8479, 19.0760]
        
        >>> get_city_coordinates("New York")
        [-74.0060, 40.7128]
        
        >>> get_city_coordinates("Unknown City")
        # Tries local first, then queries Nominatim
        [lon, lat] or None
    """
    if not city_name:
        return None
    
    # Convert to lowercase and strip whitespace
    city_key = city_name.strip().lower()
    
    # Strategy 1: Check local database for exact match
    if city_key in CITY_COORDINATES:
        return CITY_COORDINATES[city_key]
    
    # Strategy 2: Check for partial match in local database
    for key, coords in CITY_COORDINATES.items():
        if key in city_key or city_key in key:
            return coords
    
    # Strategy 3: Fall back to Nominatim API for unknown cities
    # This adds ~1-2 seconds but works for any city in the world
    print(f"📍 '{city_name}' not in local database, querying Nominatim...")
    nominatim_coords = _get_from_nominatim(city_name)
    
    if nominatim_coords:
        print(f"✅ Found '{city_name}' via Nominatim: {nominatim_coords}")
        # Optional: Cache this for future use
        # CITY_COORDINATES[city_key] = nominatim_coords
        return nominatim_coords
    
    print(f"❌ City '{city_name}' not found in local DB or Nominatim")
    return None
