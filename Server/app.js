const express = require('express');
const path = require('path');
const app = express();

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));

// 정적 파일 경로 설정
app.use('/assets', express.static(path.join(__dirname, 'Front/assets')));
app.use('/css', express.static(path.join(__dirname, 'Front/css')));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Business Frontpage',
        brandName: 'CLC',
        navItems: [
            { name: 'Home', link: '#!', active: true },
            { name: 'LogoCreate', link: '#!', active: false },
            { name: 'Classification', link: '#!', active: false },
            { name: 'Services', link: '#!', active: false }
        ],
        headerTitle: '캡스톤디자인',
        headerDescription1: "202330071 박민규",
        headerDescription2: "201810721 김태환",
        features: [
            { icon: 'bi-collection', title: 'CreateLogo', description: '로고 생성하기', link: '#!' },
            { icon: 'bi-building', title: 'Classification', description: '저작권 확인하기', link: '#!' },
            { icon: 'bi-toggles2', title: 'Sign in', description: '로그인 및 회원가입', link: '#!' }
        ],
        footerText: '캡스톤디자인 2학기'
    });
});

// 서버 포트 설정
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
