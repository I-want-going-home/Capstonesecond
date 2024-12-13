# 소상공인을 위한 로고 생성 및 저작권 분류 홈페이지

이 프로젝트는 이제 사회에 들어와 창업하는 사회인들이 자신만의 브랜딩 로고를 만들기 위해 제작되었습니다

## 주요 기능

- **로고 생성**: 사용자가 원하는 프롬포트를 입력받아 로고를 생성합니다.
- **저작권 분류**: 사용자가 확인하고 싶은 이미지를 전달받아 학습된 내용을 바탕으로 유사도를 측정합니다.
- **EJS 기반 프론트엔드**: 동적 웹페이지를 지원하는 플랫폼입니다. 
- **Node.js 기반 백엔드**: Node.js를 사용하여 백엔드 로직과 응답 생성을 처리합니다.


## 설치 방법

### 사전 요구 사항

다음 도구들이 설치되어 있어야 합니다:

- Node.js (버전 20 이상)
- Python (버전 3.9 이상)
- TensorFlow (버전 2.5 이상)
- MySQL

### 프론트엔드 설정

1. 의존성 설치:
    ```bash
    npm install
    ```


### 백엔드 설정

1. 백엔드 디렉터리로 이동:
    ```bash
    cd Server
    ```

2. 백엔드 의존성 설치:
    ```bash
    pip install mysql
    pip install PIL
    pip install imagehash
    pip install PyTorch
    pip install diffusers
    npm i fs
    npm i express
    npm i body-parser
    npm i mysql2
    npm i multer
    ```

4. Flask 서버 시작:
    ```bash
    node app.js
    ```

문의 사항이 있으면 이슈를 열거나 프로젝트 관리자에게 연락해 주세요.
