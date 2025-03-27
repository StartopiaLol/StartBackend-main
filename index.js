const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

// Middleware untuk mengompresi respons
app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Mengatur view engine
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

// Middleware untuk mengizinkan CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});

// Parsing body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route utama, membuka halaman index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Route lainnya
app.all('/player/register', (req, res) => {
    res.send("Coming soon...");
});

app.all('/player/login/dashboard', (req, res) => {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n'); 
        const uName = uData[0].split('|'); 
        const uPass = uData[1].split('|');

        for (let i = 0; i < uData.length - 1; i++) { 
            const d = uData[i].split('|'); 
            tData[d[0]] = d[1]; 
        }

        if (uName[1] && uPass[1]) { 
            res.redirect('/player/growid/login/validate'); 
        }
    } catch (error) { 
        console.log(`Warning: ${error}`); 
    }

    res.render(path.join(__dirname, 'public/html/index.html'), { data: tData });
});

app.all('/player/growid/login/validate', (req, res) => {
    const { _token, growId, password } = req.body;
    const token = Buffer.from(`_token=${_token}&growId=${growId}&password=${password}`).toString('base64');
   
    res.json({
        status: "success",
        message: "Account Validated.",
        token,
        url: "",
        accountType: "growtopia"
    });
});

app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    try {
        const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
        if (typeof decoded !== 'string' || !decoded.startsWith('growId=') || !decoded.includes('password=')) {
            return res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
        }
        res.json({
            status: 'success',
            message: 'Account Validated.',
            token: refreshToken,
            url: '',
            accountType: 'growtopia',
        });
    } catch (error) {
        console.log("Redirecting to player login dashboard");
        res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
    }
});

// Jalankan server di port 5000
app.listen(5000, () => {
    console.log('Listening on port 5000');
});
