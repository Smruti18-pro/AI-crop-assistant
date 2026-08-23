import os
import io
import jwt
from datetime import datetime, timedelta
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn

from database import get_db, ScanRecord, User, verify_password, get_password_hash

# ==========================================
# 1. Setup & Configuration
# ==========================================
app = FastAPI(title="Crop Disease AI API", description="API for predicting crop diseases from images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "super_secret_crop_ai_key_for_local_dev"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "disease_model", "disease_model.pth")
IMAGE_SIZE = 224

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"API is using device: {device}")

model = None
classes = None

# ==========================================
# 2. Pydantic Models for Auth
# ==========================================
class UserCreate(BaseModel):
    username: str
    password: str
    security_question: str
    security_answer: str

class UserLogin(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str

class PasswordResetSubmit(BaseModel):
    username: str
    security_answer: str
    new_password: str

# ==========================================
# 3. Auth Utilities
# ==========================================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ==========================================
# 4. Auth Endpoints
# ==========================================
@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    # Lowercase the answer so it's case-insensitive during reset
    hashed_answer = get_password_hash(user.security_answer.lower().strip())
    
    # If this is the very first user, make them an admin automatically
    is_admin = db.query(User).count() == 0
    
    new_user = User(
        username=user.username, 
        password_hash=hashed_password, 
        is_admin=is_admin,
        security_question=user.security_question,
        security_answer_hash=hashed_answer
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": new_user.username, "is_admin": new_user.is_admin}

@app.post("/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": db_user.username, "is_admin": db_user.is_admin}

@app.post("/auth/security-question")
def get_security_question(req: PasswordResetRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == req.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"security_question": db_user.security_question}

@app.post("/auth/reset-password")
def reset_password(req: PasswordResetSubmit, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == req.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not db_user.security_answer_hash:
        raise HTTPException(status_code=400, detail="This account does not have a security question set up.")
        
    # Verify the provided answer (case insensitive)
    if not verify_password(req.security_answer.lower().strip(), db_user.security_answer_hash):
        raise HTTPException(status_code=401, detail="Incorrect answer to security question")
        
    # Update password
    db_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password successfully reset. You can now log in."}

# ==========================================
# 5. Core ML Endpoints
# ==========================================
predict_transforms = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def process_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = predict_transforms(image).unsqueeze(0)
    return image_tensor.to(device)

@app.on_event("startup")
def load_model():
    global model, classes
    if not os.path.exists(MODEL_SAVE_PATH):
        print(f"ERROR: Model file not found at {MODEL_SAVE_PATH}.")
        return
    checkpoint = torch.load(MODEL_SAVE_PATH, map_location=device, weights_only=True)
    classes = checkpoint['classes']
    num_classes = len(classes)
    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()

@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
        
    image_bytes = await file.read()
    image_tensor = process_image(image_bytes)
    
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)
        predicted_class = classes[predicted_idx.item()]
        confidence_score = round(confidence.item() * 100, 2)
        
    new_scan = ScanRecord(
        filename=file.filename,
        prediction=predicted_class,
        confidence=confidence_score,
        user_id=current_user.id
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
        
    return {
        "id": new_scan.id,
        "filename": file.filename,
        "prediction": predicted_class,
        "confidence": confidence_score,
        "timestamp": new_scan.timestamp
    }

@app.get("/history")
def get_user_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only return scans belonging to the logged-in user
    scans = db.query(ScanRecord).filter(ScanRecord.user_id == current_user.id).order_by(ScanRecord.timestamp.desc()).all()
    return scans

@app.get("/admin/history")
def get_all_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Security: Ensure they are an admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")
        
    # Return all scans from all users
    scans = db.query(ScanRecord).order_by(ScanRecord.timestamp.desc()).all()
    return scans

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")
        
    users = db.query(User).all()
    # Don't return passwords
    return [{"id": u.id, "username": u.username, "is_admin": u.is_admin} for u in users]

# ==========================================
# 6. KRISHIAI Phase 2 Endpoints
# ==========================================
from llm_service import chat_with_krishiai, get_recommendation
from weather_service import get_weather
from market_service import get_market_prices

class ChatRequest(BaseModel):
    message: str
    language: str = "English"

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest, current_user: User = Depends(get_current_user)):
    response = chat_with_krishiai(req.message, req.language)
    return {"reply": response}

@app.get("/api/dashboard")
def get_dashboard_data(lat: float = 20.296, lon: float = 85.824, current_user: User = Depends(get_current_user)):
    weather = get_weather(lat, lon)
    market = get_market_prices("Tomato") # Defaulting to Tomato for demo
    
    return {
        "weather": weather,
        "market": market
    }

class RecommendationRequest(BaseModel):
    disease: str
    confidence: float
    lat: float = 20.296
    lon: float = 85.824
    crop: str = "Tomato"
    language: str = "English"

@app.post("/api/recommendation")
def recommendation_endpoint(req: RecommendationRequest, current_user: User = Depends(get_current_user)):
    weather = get_weather(req.lat, req.lon)
    market = get_market_prices(req.crop)
    
    recommendation = get_recommendation(req.disease, req.confidence, weather, market, req.language)
    
    return {
        "recommendation": recommendation,
        "weather": weather,
        "market": market
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
