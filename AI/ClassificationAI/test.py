# -*- coding: utf-8 -*-
import os
import torch
from torchvision import models, transforms
from PIL import Image
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# 이미지 전처리
def preprocess_image(image_path):
    image = Image.open(image_path).convert("RGB")  # RGB로 변환
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return transform(image).unsqueeze(0)

# 특징 추출
def get_features(image_path, model):
    image_tensor = preprocess_image(image_path)
    with torch.no_grad():
        features = model(image_tensor)
    return features.numpy().flatten()  # 1차원 배열로 변환

# 사전 학습된 모델 로드
print("모델 로딩 중...")
model = models.resnet50(pretrained=True)
model.eval()
# 마지막 레이어 제거
model = torch.nn.Sequential(*(list(model.children())[:-1]))
print("모델 로딩 완료.")

# 로고 이미지 경로 목록
db_folder = r'C:\Users\User1\Documents\GitHub\Capstonesecond\AI\DB'
logo_images = [os.path.join(db_folder, img) for img in os.listdir(db_folder) if img.endswith(('.png', '.jpg', '.jpeg'))]
logo_features = [get_features(img, model) for img in logo_images]

# 업로드된 이미지 경로
upload_folder = r'C:\Users\User1\Documents\GitHub\Capstonesecond\AI\Upload'
uploaded_images = [os.path.join(upload_folder, img) for img in os.listdir(upload_folder) if img.endswith(('.png', '.jpg', '.jpeg'))]

# 유사성 평가
for uploaded_image in uploaded_images:
    print(f"비교 중: {uploaded_image}")
    received_features = get_features(uploaded_image, model)
    
    similarities = cosine_similarity([received_features], logo_features)
    print(f"Uploaded Image: {uploaded_image}")
    for idx, similarity in enumerate(similarities[0]):
        print(f"Similarity with {os.path.basename(logo_images[idx])}: {similarity:.4f}")
    print("------")
