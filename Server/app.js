const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));
app.use('/assets', express.static(path.join(__dirname, 'Front/assets')));
app.use('/css', express.static(path.join(__dirname, 'Front/css')));

// 업로드된 파일을 제공할 경로 설정
app.use('/uploads', express.static(path.join('C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\Upload')));
app.use('/DB', express.static(path.join('C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\DB'))); // 경로 수정

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\Upload');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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

app.get('/create-logo', (req, res) => {
    res.render('CreateLogo', {
        title: 'Create Your Logo',
        brandName: 'CLC',
        logoImage: null,
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

app.get('/classification', (req, res) => {
    res.render('Classification', {
        title: 'Classification Your Logo',
        brandName: 'CLC',
        result: null
    });
});

app.post('/classification', upload.single('image'), async (req, res) => {
    try {
        const imageFilePath = path.join('C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\Upload', req.file.filename);

        exec(`python "C:\\Users\\User1\\Documents\\GitHub\\Capstonesecond\\AI\\ClassificationAI\\image_similarity.py" "${imageFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                console.error(stderr);
                return res.status(500).send('이미지 분석 중 오류 발생');
            }

            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
            }

            console.log(`Python script stdout: ${stdout}`);

            let result;
            try {
                result = JSON.parse(stdout);
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError}`);
                console.log(`Raw output: ${stdout}`);
                return res.status(500).send('이미지 분석 중 오류 발생');
            }

            res.render('Classification', {
                title: '저작권 확인',
                brandName: 'CLC',
                result: result.similarImages || [] // 유사 이미지를 results로 설정
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('이미지 분석 중 오류 발생');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
