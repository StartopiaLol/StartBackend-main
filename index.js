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

// Mengatur view engine ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Pastikan folder 'views' digunakan untuk EJS
app.set('trust proxy', 1);

// Middleware untuk mengizinkan CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route utama, membuka halaman index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Route untuk register (sementara)
app.all('/player/register', (req, res) => {
    res.send("Coming soon...");
});

// Route untuk login
app.all('/player/login/dashboard', (req, res) => {
    const tData = {};
    try {
        const uData = req.body?.data ? req.body.data.split('\\n') : []; 
        if (uData.length < 2) throw new Error("Invalid user data format");

        const uName = uData[0].split('|'); 
        const uPass = uData[1].split('|');

        for (let i = 0; i < uData.length - 1; i++) { 
            const d = uData[i].split('|'); 
            tData[d[0]] = d[1]; 
        }

        if (uName[1] && uPass[1]) { 
            return res.redirect('/player/growid/login/validate'); 
        }
    } catch (error) { 
        console.error(`Warning: ${error.message}`); 
        return res.status(400).json({ status: "error", message: error.message });
    }

    res.render('dashboard', { data: tData });
});

// Route validasi login GrowID
app.all('/player/growid/login/validate', (req, res) => {
    const { _token, growId, password } = req.body;

    if (!_token || !growId || !password) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    const token = Buffer.from(`_token=${_token}&growId=${growId}&password=${password}`).toString('base64');
   
    res.json({
        status: "success",
        message: "Account Validated.",
        token,
        url: "",
        accountType: "growtopia"
    });
});

// Route untuk mengecek token GrowID
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) {
            throw new Error("Refresh token is missing");
        }

        const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
        if (typeof decoded !== 'string' || !decoded.startsWith('growId=') || !decoded.includes('password=')) {
            return res.render('dashboard');
        }

        res.json({
            status: 'success',
            message: 'Account Validated.',
            token: refreshToken,
            url: '',
            accountType: 'growtopia',
        });
    } catch (error) {
        console.error("Error checking token:", error.message);
        res.render('dashboard');
    }
});

// Middleware Error Handling Global
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// Jalankan server di port 5000
app.listen(5000, () => {
    console.log('Listening on port 5000');
});
