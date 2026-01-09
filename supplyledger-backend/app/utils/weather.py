import requests
import os

API_KEY = os.getenv("OPENWEATHER_API_KEY", "YOUR_OPENWEATHER_API_KEY")

def get_weather_factor(city):
    """
    Fetch weather condition and convert to delay multiplier.
    
    Args:
        city: City name (string)
    
    Returns:
        float: Weather delay factor (0.0 to 0.30)
    """
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        condition = data["weather"][0]["main"]

        # Map weather conditions to delay multipliers
        if condition in ["Thunderstorm"]:
            return 0.30
        elif condition in ["Rain"]:
            return 0.15
        elif condition in ["Clouds"]:
            return 0.05
        else:
            # Clear, Snow, Mist, etc.
            return 0.0
    
    except Exception as e:
        print(f"Error fetching weather data for {city}: {e}")
        # Default to no weather delay on error
        return 0.0
