const express = require('express');
const path = require('path');
const { exec } = require('child_process'); // Python 스크립트 실행을 위한 모듈
const bodyParser = require('body-parser'); // 폼 데이터 파싱을 위한 모듈
const multer = require('multer'); // 파일 업로드를 위한 모듈
const axios = require('axios'); // Python 서버와 통신하기 위한 모듈
const fs = require('fs');
const FormData = require('form-data'); // FormData 객체를 이용해 파일 전송
const app = express();

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));
app.use('/assets', express.static(path.join(__dirname, 'Front/assets')));
app.use('/css', express.static(path.join(__dirname, 'Front/css')));
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 데이터 파싱

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 파일 업로드 경로
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일명
    }
});
const upload = multer({ storage: storage });

// 메인 페이지 라우팅
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Business Frontpage',
        brandName: 'CLC',
        navItems: [
            { name: 'Home', link: '/', active: true },
            { name: 'LogoCreate', link: '/create-logo', active: false },
            { name: 'Classification', link: '/classification', active: false },
            { name: 'Services', link: '#!', active: false }
        ],
        headerTitle: '캡스톤디자인',
        headerDescription1: "202330071 박민규",
        headerDescription2: "201810721 김태환",
        features: [
            { icon: 'bi-collection', title: 'CreateLogo', description: '로고 생성하기', link: '/create-logo' },
            { icon: 'bi-building', title: 'Classification', description: '저작권 확인하기', link: '/classification' },
            { icon: 'bi-toggles2', title: 'Sign in', description: '로그인 및 회원가입', link: '#!' }
        ],
        footerText: '캡스톤디자인 2학기'
    });
});

// CreateLogo 페이지
app.get('/create-logo', (req, res) => {
    res.render('CreateLogo', {
        title: 'Create Your Logo',
        brandName: 'CLC',
        logoImage: null, // 초기값 null
        navItems: [
            { name: 'Home', link: '/', active: false },
            { name: 'LogoCreate', link: '/create-logo', active: true },
            { name: 'Classification', link: '/classification', active: false },
            { name: 'Services', link: '#!', active: false }
        ],
        headerTitle: '로고 생성하기',
        footerText: '캡스톤디자인 2학기'
    });
});

// Classification 페이지
app.get('/classification', (req, res) => {
    res.render('Classification', {
        title: 'Classification Your Logo',
        brandName: 'CLC',
        result: null // 결과 초기화
    });
});

// 파일 업로드 및 유사도 분석을 처리할 라우트
app.post('/classification', upload.single('image'), async (req, res) => {
    try {
        const imageFilePath = path.join(__dirname, 'uploads', req.file.filename);

        // Python 서버에 이미지 전달
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imageFilePath));

        const pythonServerUrl = 'http://localhost:5000/process-image'; // Python 서버 URL
        const pythonResponse = await axios.post(pythonServerUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const result = pythonResponse.data; // Python에서 받은 결과

        // 분석 결과를 Classification 페이지로 렌더링
        res.render('Classification', {
            title: '저작권 확인',
            brandName: 'CLC',
            result: {
                similarImage: result.similarImage, // 유사한 이미지 정보
                similarity: result.similarity, // 유사도 퍼센트
                similarImagePath: `/uploads/${result.similarImage}` // 유사 이미지 경로
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('이미지 분석 중 오류 발생');
    }
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 시작 >> http://localhost:${PORT} <<`);
});
