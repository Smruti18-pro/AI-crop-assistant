import os
import google.generativeai as genai
from typing import Optional

# Setup Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
# We use gemini-1.5-pro or flash for general tasks
MODEL_NAME = "gemini-1.5-flash" 

def get_recommendation(disease: str, confidence: float, weather: dict, market: dict, language: str = "English") -> str:
    """
    Generates a comprehensive recommendation using Gemini based on all KRISHIAI context.
    """
    if not GEMINI_API_KEY:
        return f"[Simulated Response - No API Key] In {language}: The crop has {disease} ({confidence}%). Weather is {weather.get('description')}. Market price is {market.get('price')}."
        
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = f"""
        You are KRISHIAI, an expert agricultural assistant.
        The farmer has scanned a crop and the AI detected: {disease} (Confidence: {confidence}%).
        Current Weather: {weather.get('temperature')}°C, {weather.get('description')}.
        Current Market Status for related crop: {market.get('price')} per Quintal ({market.get('trend')}).
        
        Provide a short, actionable recommendation for the farmer. Include:
        1. Immediate action for the disease.
        2. Weather-based advice (e.g., should they spray fertilizer now or wait for rain?).
        3. Market advice (e.g., sell now or hold?).
        
        You MUST respond entirely in {language}. Keep it concise and easy to understand for a farmer.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return "I am currently unable to generate a recommendation. Please verify that the Gemini API key is correctly configured and the service is available."

def chat_with_krishiai(message: str, language: str = "English") -> str:
    """
    General chat interface for the KRISHIAI chatbot.
    """
    if not GEMINI_API_KEY:
        return f"System Notice: Please configure the GEMINI_API_KEY in the server environment to enable AI responses. (Received: {message})"
        
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"""
        You are KRISHIAI, a professional, expert agricultural assistant.
        Respond to the following message entirely in {language}:
        
        Farmer: {message}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return "I am currently experiencing technical difficulties connecting to the AI service. Please try again later or check your API configuration."
