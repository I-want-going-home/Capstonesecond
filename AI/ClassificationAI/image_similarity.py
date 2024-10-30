# -*- coding: utf-8 -*-
import sys
import json
from PIL import Image
import imagehash
import os
import concurrent.futures

# 해시 캐시 초기화
hash_cache = {}

def get_image_hash(image_path):
    if image_path in hash_cache:
        return hash_cache[image_path]
    else:
        image = Image.open(image_path).convert("L")  # 회색조로 변환
        # 평균 해시와 pHash를 사용
        average_hash = imagehash.average_hash(image)
        perceptual_hash = imagehash.phash(image)
        hash_cache[image_path] = (average_hash, perceptual_hash)
        return average_hash, perceptual_hash

def resize_image(image, size=(128, 128)):
    # LANCZOS 필터 사용
    return image.resize(size, Image.LANCZOS)

def compute_similarity(ref_path, input_hash):
    ref_image = Image.open(ref_path).convert("L")  # 회색조로 변환
    ref_hash = get_image_hash(ref_path)

    # 해시 거리 계산 (유사성)
    average_hash_difference = input_hash[0] - ref_hash[0]
    perceptual_hash_difference = input_hash[1] - ref_hash[1]
    
    # 평균 해시와 pHash의 조합을 사용하여 유사도 계산
    # 차이값이 커질수록 점수가 낮아짐
    similarity_score = max(0, 100 - (average_hash_difference * 10) - (perceptual_hash_difference * 5))

    # 유사도가 0 이하인 경우 0으로 설정
    if similarity_score < 0:
        similarity_score = 0

    return os.path.basename(ref_path), round(similarity_score, 1)  # 소수점 아래 한 자리까지 반올림

def find_similar_images(image_path, reference_images):
    input_image = resize_image(Image.open(image_path).convert("L"))  # 회색조로 변환 후 리사이즈
    input_hash = get_image_hash(image_path)

    similar_images = []

    # 멀티 프로세싱을 사용하여 유사도 계산
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_ref = {executor.submit(compute_similarity, ref_path, input_hash): ref_path for ref_path in reference_images}

        for future in concurrent.futures.as_completed(future_to_ref):
            ref_path = future_to_ref[future]
            try:
                ref_name, similarity_score = future.result()
                if similarity_score > 0:
                    similar_images.append({"similarImage": ref_name, "similarity": similarity_score})
            except Exception as e:
                # 오류 발생 시 안전하게 출력
                print("Error processing {}: {}".format(ref_path, str(e)))

    # 유사도에 따라 이미지 정렬
    similar_images.sort(key=lambda x: x["similarity"], reverse=True)

    # 가장 유사한 상위 3개 이미지 반환
    return similar_images[:3]

if __name__ == "__main__":
    input_image_path = sys.argv[1]
    reference_images_dir = "C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\DB"
    reference_images = [os.path.join(reference_images_dir, img) for img in os.listdir(reference_images_dir) if img.endswith(('jpg', 'jpeg', 'png'))]

    # 가장 유사한 이미지 찾기
    similar_images = find_similar_images(input_image_path, reference_images)

    # 결과 JSON으로 출력
    result = {
        "similarImages": similar_images
    }

    print(json.dumps(result, ensure_ascii=False))  # JSON 출력 시 유니코드 유지
