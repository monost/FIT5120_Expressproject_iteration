import sys
import os
import json
from torchvision import transforms, models
import torch.nn as nn
import torch
from PIL import Image

num_classes = 89
class_names = sorted(str(i) for i in range(1, num_classes+1))

def predict_image(image_path, model_path='plant_id_classifier.pth'):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    model = models.efficientnet_b3(weights='IMAGENET1K_V1')
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])

    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, predicted = probs.max(1)
        predicted_class = class_names[predicted.item()]
        confidence_score = confidence.item() * 100

    return predicted_class, confidence_score

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("No image path provided", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"Image path {image_path} does not exist", file=sys.stderr)
        sys.exit(1)

    predicted_class, confidence = predict_image(image_path)

    result = {
        "class": predicted_class,
        "confidence": round(confidence, 2)
    }
    print(json.dumps(result))
