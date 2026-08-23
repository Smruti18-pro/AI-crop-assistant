import os
import requests

def get_weather(lat: float, lon: float) -> dict:
    """
    Fetches weather data. Uses OpenWeatherMap if API key is set, otherwise returns mock data.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    
    if not api_key:
        # Return mock data for testing
        return {
            "temperature": 28.5,
            "humidity": 65,
            "description": "Partly Cloudy",
            "rain_chance": 20
        }
        
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["main"],
            "rain_chance": 0 # OpenWeatherMap free tier doesn't always have PoP in current weather
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        return {
            "temperature": 0,
            "humidity": 0,
            "description": "Unknown",
            "rain_chance": 0
        }
