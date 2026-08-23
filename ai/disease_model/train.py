import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split

# ==========================================
# 1. Configuration & Hyperparameters
# ==========================================
# IMPORTANT: This dynamically resolves the path to the data folder
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..", "..", "dataset")
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "disease_model.pth")

BATCH_SIZE = 32
EPOCHS = 5
LEARNING_RATE = 0.001
IMAGE_SIZE = 224 # Standard size for MobileNet/EfficientNet

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ==========================================
# 2. Data Preprocessing & Loading
# ==========================================
# We define how to transform the images before feeding them to the model
data_transforms = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    # Normalization values standard for ImageNet pre-trained models
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def prepare_data():
    try:
        train_dir = os.path.join(DATA_DIR, "train")
        val_dir = os.path.join(DATA_DIR, "validation")
        
        # Load datasets from their respective folders
        train_dataset = datasets.ImageFolder(train_dir, transform=data_transforms)
        val_dataset = datasets.ImageFolder(val_dir, transform=data_transforms)
        
        # Create DataLoaders to load data in batches
        train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
        
        classes = train_dataset.classes
        print(f"Found {len(classes)} classes: {classes}")
        print(f"Training images: {len(train_dataset)}, Validation images: {len(val_dataset)}")
        
        return train_loader, val_loader, classes
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        print("Please ensure your dataset has 'train' and 'validation' folders.")
        return None, None, None

# ==========================================
# 3. Model Definition (Transfer Learning)
# ==========================================
def build_model(num_classes):
    # Load a pre-trained MobileNetV3 (lightweight and fast)
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    
    # Freeze the early layers so we don't destroy pre-trained features
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the final classification layer to match our number of classes
    num_ftrs = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(num_ftrs, num_classes)
    
    return model.to(device)

# ==========================================
# 4. Training Loop
# ==========================================
def train_model(model, train_loader, val_loader):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        # Training Phase
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        train_accuracy = 100 * correct / total
        
        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
        val_accuracy = 100 * val_correct / val_total
        
        print(f"Epoch {epoch+1}/{EPOCHS} - "
              f"Train Loss: {running_loss/len(train_loader):.4f}, Train Acc: {train_accuracy:.2f}% | "
              f"Val Loss: {val_loss/len(val_loader):.4f}, Val Acc: {val_accuracy:.2f}%")
              
    return model

# ==========================================
# 5. Main Execution
# ==========================================
if __name__ == "__main__":
    print("Starting Crop Disease Model Training...")
    train_loader, val_loader, classes = prepare_data()
    
    if train_loader:
        model = build_model(len(classes))
        trained_model = train_model(model, train_loader, val_loader)
        
        # Save the trained model weights and the class names
        checkpoint = {
            'model_state_dict': trained_model.state_dict(),
            'classes': classes
        }
        torch.save(checkpoint, MODEL_SAVE_PATH)
        print(f"Model successfully saved to {MODEL_SAVE_PATH}")
