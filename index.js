const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Dashboard ejs harus di sini jika pakai res.render()
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

// Menampilkan halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Placeholder untuk fitur register
app.all('/player/register', function (req, res) {
    res.send("Coming soon...");
});

// Menampilkan dashboard setelah login
app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    
    try {
        if (!req.body || typeof req.body !== 'object') throw new Error("Invalid request body");
        const uData = JSON.stringify(req.body).split('"')[1]?.split('\\n') || [];
        if (uData.length < 2) throw new Error("Invalid format");

        const uName = uData[0].split('|');
        const uPass = uData[1].split('|');

        for (let i = 0; i < uData.length - 1; i++) { 
            const d = uData[i].split('|'); 
            tData[d[0]] = d[1]; 
        }

        if (uName[1] && uPass[1]) { 
            res.redirect('/player/growid/login/validate'); 
            return;
        }
    } catch (err) { 
        console.log(`Warning: ${err.message}`); 
        return res.status(400).send("Invalid request format.");
    }

    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.ejs'));
});

// Validasi login pengguna
app.all('/player/growid/login/validate', (req, res) => {
    const { growId, password, _token } = req.body;

    if (!growId || !password || !_token) {
        return res.status(400).json({ status: "error", message: "Invalid credentials" });
    }

    res.json({
        status: "success",
        message: "Account Validated.",
        token: `_token=${_token}&growId=${growId}&password=${password}`,
        url: "",
        accountType: "growtopia"
    });
});

// Mengecek token akun
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(400).json({ status: "error", message: "Token is missing" });
    }

    res.json({
        status: 'success',
        message: 'Account Validated.',
        token: refreshToken,
        url: '',
        accountType: 'growtopia',
    });
});

// Jalankan server di port 5000
app.listen(5000, function () {
    console.log('Server berjalan di http://localhost:5000');
});
