import os
import requests

def get_weather(lat: float, lon: float) -> dict:
    """
    Fetches weather data. Uses OpenWeatherMap if API key is set, otherwise returns mock data.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    
    if not api_key:
        return {
            "temperature": "--",
            "humidity": "--",
            "description": "API Key Required",
            "rain_chance": "--"
        }
        
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": round(data["main"]["temp"], 1),
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["main"].title(),
            "rain_chance": "--" # OpenWeatherMap free tier current weather doesn't typically provide rain chance
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        return {
            "temperature": "--",
            "humidity": "--",
            "description": "Service Unavailable",
            "rain_chance": "--"
        }
