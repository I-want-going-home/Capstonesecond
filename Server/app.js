const fs = require('fs');
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/assets', express.static(path.join(__dirname, 'Front/assets')));
app.use('/css', express.static(path.join(__dirname, 'Front/css')));
app.use('/uploads', express.static("C:\Users\\105\Documents\GitHub\Capstonesecond\AI\Upload"));

const upload = multer({
    storage: multer.diskStorage({
        destination: "C:\Users\\105\Documents\GitHub\Capstonesecond\AI\Upload",
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    })
});

const commonRenderVars = {
    brandName: 'CLC',
    navItems: [
        { name: 'Home', link: '/', active: true },
        { name: 'LogoCreate', link: '/create-logo', active: false },
        { name: 'Classification', link: '/classification', active: false },
        { name: 'Services', link: '#!', active: false }
    ],
    footerText: '캡스톤디자인 2학기'
};

app.get('/', (req, res) => {
    res.render('index', {
        ...commonRenderVars,
        title: 'Business Frontpage',
        headerTitle: '캡스톤디자인',
        headerDescription1: '202330071 박민규',
        headerDescription2: '201810721 김태환',
        features: [
            { icon: 'bi-collection', title: 'CreateLogo', description: '로고 생성하기', link: '/create-logo' },
            { icon: 'bi-building', title: 'Classification', description: '저작권 확인하기', link: '/classification' },
            { icon: 'bi-toggles2', title: 'Sign in', description: '로그인 및 회원가입', link: '#!' }
        ]
    });
});

app.get('/create-logo', (req, res) => {
    res.render('CreateLogo', { ...commonRenderVars, title: 'Create Your Logo', headerTitle: '로고 생성하기', logoImage: null });
});

app.post('/generate-logo', async (req, res) => {
    const prompt = req.body.prompt;

    console.log('Received prompt:', prompt);

    exec(`python "C:\Users\\105\Documents\GitHub\Capstonesecond\AI_IMAGECREATE.py" "${prompt}"`, (error, stdout, stderr) => {
        if (error || !stdout.trim()) {
            console.error(`Error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('로고 생성 중 오류 발생');
        }

        const logoImagePath = stdout.trim();
        console.log(`Generated logo path: ${logoImagePath}`);
        const imageUrl = path.join("C:\Users\\105\Documents\GitHub\Capstonesecond\AI\CreatedLogo", path.basename(logoImagePath));

        res.render('CreateLogo', {
            ...commonRenderVars,
            title: 'Create Your Logo',
            headerTitle: '로고 생성하기',
            logoImage: imageUrl
        });
    });
});

app.post('/save-logo', (req, res) => {
    const currentPath = path.join(__dirname, 'AI', 'Upload', req.body.currentPath.split('/').pop());
    const newName = req.body.newName;

    const newFilePath = path.join('C:\Users\\105\Documents\GitHub\Capstonesecond\AI\Upload', `${newName}.png`);

    fs.copyFile(currentPath, newFilePath, (err) => {
        if (err) {
            console.error('파일 저장 실패:', err);
            return res.status(500).send('파일 저장 중 오류 발생');
        }
        console.log('파일 저장 성공:', newFilePath);
        res.redirect('/create-logo');
    });
});

app.get('/classification', (req, res) => {
    res.render('Classification', {
        ...commonRenderVars,
        title: 'Classification Your Logo',
        result: null,
        alerts: []
    });
});

app.post('/classification', upload.single('image'), async (req, res) => {
    let alerts = [];
    try {
        const imageFilePath = path.join(__dirname, 'AI', 'Upload', req.file.filename);

        exec(`python "C:\Users\\105\Documents\GitHub\Capstonesecond\AI\ClassificationAI\image_similarity2.py" "${imageFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                alerts.push('이미지 분석 중 오류가 발생했습니다.');
                return res.render('Classification', {
                    ...commonRenderVars,
                    title: 'Classification Your Logo',
                    result: null,
                    alerts
                });
            }

            if (stderr) {
                console.warn(`Python script stderr: ${stderr}`);
                alerts.push('Python 스크립트 실행 중 경고가 발생했습니다.');
            }

            let result;
            try {
                result = JSON.parse(stdout);
            } catch (parseError) {
                console.error(`Error parsing JSON from Python script: ${parseError}`);
                alerts.push('Python 스크립트에서 잘못된 데이터를 반환했습니다.');
                return res.render('Classification', {
                    ...commonRenderVars,
                    title: 'Classification Your Logo',
                    result: null,
                    alerts
                });
            }

            // 유사도가 90% 이상인 경우 경고 메시지 추가
            if (result.similarImages) {
                result.similarImages.forEach(item => {
                    if (item.similarity >= 90) {
                        alerts.push(`유사도 ${item.similarity}%: 유사한 이미지가 발견되었습니다.`);
                    }
                });
            }

            res.render('Classification', {
                ...commonRenderVars,
                title: 'Classification Your Logo',
                result,
                alerts
            });
        });
    } catch (e) {
        console.error(e);
        alerts.push('알 수 없는 오류가 발생했습니다.');
        res.render('Classification', {
            ...commonRenderVars,
            title: 'Classification Your Logo',
            result: null,
            alerts
        });
    }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`로컬 서버 시작 : ${PORT}`);
});
