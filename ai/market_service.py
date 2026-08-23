def get_market_prices(crop_name: str = "Tomato") -> dict:
    """
    Fetches market prices. 
    In Phase 2, we use simulated/mock data since real-time Indian Mandi APIs 
    require complex registration or paid access.
    """
    # Mock data for demonstration
    prices = {
        "Tomato": {"price": "₹1,200", "trend": "Up", "market": "Bhubaneswar Mandi"},
        "Potato": {"price": "₹1,800", "trend": "Stable", "market": "Cuttack Mandi"},
        "Rice": {"price": "₹2,500", "trend": "Stable", "market": "Balasore Mandi"},
        "Wheat": {"price": "₹2,200", "trend": "Down", "market": "Local Market"}
    }
    
    # Default to Tomato if crop not found in mock data
    return prices.get(crop_name, prices["Tomato"])
