import sys
import json
import os
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

def resize_image(image, size):
    return cv2.resize(image, size, interpolation=cv2.INTER_AREA)

def calculate_similarity(uploaded_image_path):
    print(f"Uploaded image path: {uploaded_image_path}", file=sys.stderr)
    uploaded_image = cv2.imread(uploaded_image_path, cv2.IMREAD_GRAYSCALE)
    
    if uploaded_image is None:
        print("Failed to load the uploaded image.", file=sys.stderr)
        return

    max_similarity = 0
    similar_image_name = None

    DATABASE_FOLDER = 'C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\DB'

    for image_name in os.listdir(DATABASE_FOLDER):
        database_image_path = os.path.join(DATABASE_FOLDER, image_name)
        database_image = cv2.imread(database_image_path, cv2.IMREAD_GRAYSCALE)
        
        if database_image is None:
            print(f"Failed to load database image: {database_image_path}", file=sys.stderr)
            continue

        # Resize the database image to the size of the uploaded image
        database_image_resized = resize_image(database_image, (uploaded_image.shape[1], uploaded_image.shape[0]))

        # Calculate similarity
        similarity = ssim(uploaded_image, database_image_resized)
        if similarity > max_similarity:
            max_similarity = similarity
            similar_image_name = image_name

    result = {
        'similarImage': similar_image_name,
        'similarity': max_similarity * 100
    }

    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python image_similarity.py <uploaded_image_path>")
        sys.exit(1)

    uploaded_image_path = sys.argv[1]
    calculate_similarity(uploaded_image_path)
