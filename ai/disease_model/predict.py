import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

# ==========================================
# 1. Configuration
# ==========================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "disease_model.pth")
IMAGE_SIZE = 224

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================================
# 2. Image Preprocessing
# ==========================================
# This MUST match the preprocessing used during training
predict_transforms = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def load_image(image_path):
    try:
        # Load the image and apply transforms
        image = Image.open(image_path).convert("RGB")
        image_tensor = predict_transforms(image).unsqueeze(0) # Add batch dimension
        return image_tensor.to(device)
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None

# ==========================================
# 3. Model Loading & Prediction
# ==========================================
def predict(image_path):
    if not os.path.exists(MODEL_SAVE_PATH):
        print(f"Model file not found at {MODEL_SAVE_PATH}. Please train the model first.")
        return
        
    # 1. Load the saved checkpoint
    checkpoint = torch.load(MODEL_SAVE_PATH, map_location=device, weights_only=True)
    classes = checkpoint['classes']
    num_classes = len(classes)
    
    # 2. Rebuild the model architecture
    model = models.mobilenet_v3_small(weights=None) # We don't need pretrained weights here, we load our own
    num_ftrs = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(num_ftrs, num_classes)
    
    # 3. Load the saved weights into the model
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval() # Set model to evaluation mode
    
    # 4. Prepare the image
    image_tensor = load_image(image_path)
    if image_tensor is None:
        return
        
    # 5. Make the prediction
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)
        
        predicted_class = classes[predicted_idx.item()]
        confidence_score = confidence.item() * 100
        
    print(f"Prediction: {predicted_class}")
    print(f"Confidence: {confidence_score:.2f}%")
    
    return predicted_class, confidence_score

if __name__ == "__main__":
    # Example usage:
    # Replace with the path to an actual image you want to test
    test_image_path = input("Enter the path to the image you want to test: ")
    if os.path.exists(test_image_path):
        predict(test_image_path)
    else:
        print("File not found.")
