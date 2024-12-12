# -*- coding: utf-8 -*-
import base64
import json
import mysql.connector
from PIL import Image
import imagehash
import io
import os

# MySQL 데이터베이스에 연결
db_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="capstonsecond"
)

# 커서 생성
cursor = db_connection.cursor()

def get_image_hash(image, hash_size=16):
    average_hash = imagehash.average_hash(image, hash_size=hash_size)
    perceptual_hash = imagehash.phash(image, hash_size=hash_size)
    return str(average_hash)[:16], str(perceptual_hash)[:16]

def preprocess_image(image_path, size=(128, 128)):
    image = Image.open(image_path).convert("L")
    image = image.resize(size, Image.LANCZOS)
    return image

def preprocess_image_from_data(image_data, size=(128, 128)):
    image = Image.open(io.BytesIO(image_data)).convert("L")
    image = image.resize(size, Image.LANCZOS)
    return image

def calculate_hash_difference(hash1, hash2):
    diff = 0
    for bit1, bit2 in zip(hash1, hash2):
        if bit1 != bit2:
            diff += 1
    return diff

def compute_similarity(db_image, input_hash):
    try:
        db_image_hash = get_image_hash(db_image)
    except Exception as e:
        raise ValueError(f"Error computing hash for database image: {e}")

    input_average_hash, input_perceptual_hash = input_hash
    db_average_hash, db_perceptual_hash = db_image_hash

    average_hash_diff = calculate_hash_difference(input_average_hash, db_average_hash)
    perceptual_hash_diff = calculate_hash_difference(input_perceptual_hash, db_perceptual_hash)

    similarity_score = max(0, 100 - (average_hash_diff * 10) - (perceptual_hash_diff * 5))
    return similarity_score

def find_similar_images(image_path, hash_size=16):
    input_image = preprocess_image(image_path)
    input_hash = get_image_hash(input_image, hash_size=hash_size)

    similar_images = []

    cursor.execute("SELECT gray_image_data, image_name FROM images")
    db_images = cursor.fetchall()

    for db_image in db_images:
        db_image_data = db_image[0]
        db_image_name = db_image[1]

        db_image = preprocess_image_from_data(db_image_data)
        similarity_score = compute_similarity(db_image, input_hash)

        if similarity_score > 0:
            encoded_image_data = base64.b64encode(db_image_data).decode('utf-8')
            similar_images.append({
                "similarImage": db_image_name,
                "similarity": similarity_score,
                "imageData": encoded_image_data
            })

    similar_images.sort(key=lambda x: x["similarity"], reverse=True)
    return similar_images[:3]

if __name__ == "__main__":
    upload_folder = r"C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\Upload\\"
    files_in_folder = os.listdir(upload_folder)
    image_files = [f for f in files_in_folder if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    if image_files:
        input_image_path = os.path.join(upload_folder, image_files[0])
    else:
        print("No image files found in the folder.")
        exit()

    similar_images = find_similar_images(input_image_path)
    result = {
        "similarImages": similar_images
    }
    print(json.dumps(result, ensure_ascii=False))

    cursor.close()
    db_connection.close()
