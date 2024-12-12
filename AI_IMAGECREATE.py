from diffusers import StableDiffusionPipeline
import safetensors.torch  # safetensors를 통해 로라 가중치 로드
import torch
from PIL import Image
import sys
import os

# 모델 경로 설정
base_model_id = "runwayml/stable-diffusion-v1-5"
lora_model_id = "D:/git/sd.webui/webui/models/Lora/logo_v1-000012.safetensors"

# 파이프라인 생성 및 장치 설정
pipe = StableDiffusionPipeline.from_pretrained(base_model_id, torch_dtype=torch.float16)
pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# LoRA 가중치 로드 및 적용
lora_weights = safetensors.torch.load_file(lora_model_id, device="cuda")
for name, param in pipe.unet.named_parameters():
    if name in lora_weights:
        param.data += lora_weights[name].to(param.device)

# 명령줄 인자로부터 프롬프트를 받음
if len(sys.argv) > 1:
    prompt = sys.argv[1]
else:
    prompt = "Default prompt"
negative_prompt = ""

# 모델 실행 및 이미지 생성
with torch.no_grad():  # 기울기 계산 비활성화
    generated_images = pipe(prompt=prompt, negative_prompt=negative_prompt).images

# 첫 번째 이미지 파일로 저장
image = generated_images[0]

# 저장할 경로 설정
output_folder = "C:\Users\User1\Documents\GitHub\Capstonesecond\AI\CreatedLogo"

# 경로가 존재하지 않으면 폴더 생성
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# 파일 경로 설정
output_path = os.path.join(output_folder, "logo.png")

# 이미지 저장
image.save(output_path)

# 생성된 이미지 경로를 stdout에 출력
print(output_path)