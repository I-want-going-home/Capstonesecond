const express = require('express');
const path = require('path');
const { exec } = require('child_process'); // Python 스크립트 실행을 위한 모듈
const bodyParser = require('body-parser'); // 폼 데이터 파싱을 위한 모듈
const app = express();

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));
app.use('/assets', express.static(path.join(__dirname, 'Front/assets')));
app.use('/css', express.static(path.join(__dirname, 'Front/css')));
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 데이터 파싱

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Business Frontpage',
        brandName: 'CLC',
        navItems: [
            { name: 'Home', link: '#!', active: true },
            { name: 'LogoCreate', link: '/create-logo', active: false },
            { name: 'Classification', link: '#!', active: false },
            { name: 'Services', link: '#!', active: false }
        ],
        headerTitle: '캡스톤디자인',
        headerDescription1: "202330071 박민규",
        headerDescription2: "201810721 김태환",
        features: [
            { icon: 'bi-collection', title: 'CreateLogo', description: '로고 생성하기', link: '/create-logo' },
            { icon: 'bi-building', title: 'Classification', description: '저작권 확인하기', link: '#!' },
            { icon: 'bi-toggles2', title: 'Sign in', description: '로그인 및 회원가입', link: '#!' }
        ],
        footerText: '캡스톤디자인 2학기'
    });
});

// CreateLogo 페이지로 라우팅 추가
app.get('/create-logo', (req, res) => {
    res.render('CreateLogo', {
        title: 'Create Your Logo',
        brandName: 'CLC',
        logoImage: null, // 초기값 null
        navItems: [
            { name: 'Home', link: '#!', active: false },
            { name: 'LogoCreate', link: '/create-logo', active: true },
            { name: 'Classification', link: '#!', active: false },
            { name: 'Services', link: '#!', active: false }
        ],
        headerTitle: '로고 생성하기',
        footerText: '캡스톤디자인 2학기'
    });
});

// 로고 생성을 처리할 라우트
app.post('/generate-logo', (req, res) => {
    const prompt = req.body.prompt;

    // Python 스크립트 실행
    exec(`python path/to/your/script.py "${prompt}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('로고 생성 중 오류 발생');
        }

        const logoImage = stdout.trim(); // 스크립트가 이미지 URL 또는 경로를 반환한다고 가정
        res.render('CreateLogo', {
            title: 'Create Your Logo',
            brandName: 'CLC',
            logoImage: logoImage, // 생성된 로고 이미지 URL 전달
            navItems: [
                { name: 'Home', link: '/', active: false },
                { name: 'LogoCreate', link: '/create-logo', active: true },
                { name: 'Classification', link: '#!', active: false },
                { name: 'Services', link: '#!', active: false }
            ],
            headerTitle: '로고 생성하기',
            footerText: '캡스톤디자인 2학기'
        });
    });
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 시작 >> http://localhost:${PORT} <<`);
});
