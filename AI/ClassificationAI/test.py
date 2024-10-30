import os
import shutil

# 원본과 목적지 경로 설정
source_dir = r'C:\Users\User1\Desktop\Sample (1)\Sample\01.원천데이터\nc01'
destination_dir = r'C:\Users\User1\Documents\GitHub\Capstonesecond\AI\DB'

# 원본 디렉토리에서 모든 파일을 확인
for filename in os.listdir(source_dir):
    # 파일이 .jpg 확장자인 경우
    if filename.endswith('.jpg'):
        # 원본 파일 경로
        source_file = os.path.join(source_dir, filename)
        # 목적지 파일 경로
        destination_file = os.path.join(destination_dir, filename)
        
        # 파일 이동
        shutil.move(source_file, destination_file)
        print(f'{filename} 이동 완료')

print('모든 JPG 파일 이동 완료')
