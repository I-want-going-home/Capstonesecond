from diffusers import StableDiffusionPipeline
import matplotlib.pyplot as plt
import torch

# 모델 경로 설정
base_model_id = "runwayml/stable-diffusion-v1-5"
lora_model_id = "D:/sd.webui/webui/models/Lora/logo_v1-000012.safetensors"

# 파이프라인 생성
pipe = StableDiffusionPipeline.from_pretrained(base_model_id, torch_dtype=torch.float16)
pipe = pipe.to("cuda")

# 프롬프트 및 이미지 생성
prompt = "((best quality)), ((masterpiece)), Logo Icon, simple, no background, pet shop, dog or cat"
negative_prompt = "(worst quality, low qulity:1.4), Lowres"
image = pipe(prompt=prompt, negative_prompt=negative_prompt).images[0]

# 이미지 저장
# image.save("logo.png")

# 이미지 출력
plt.imshow(image)
plt.axis("off")
plt.show()