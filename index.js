const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');

const app = express();

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

// Middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mengizinkan CORS dengan metode OPTIONS untuk preflight requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route utama, membuka halaman dashboard baru
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Route untuk dashboard baru
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Route untuk register (sementara)
app.all('/player/register', (req, res) => {
    res.send("Coming soon...");
});

// Route untuk login
app.post('/player/login/dashboard', (req, res) => {
    const tData = {};
    try {
        const uData = req.body?.data ? req.body.data.split('\n') : []; 
        if (uData.length < 2) throw new Error("Invalid user data format");

        for (let i = 0; i < uData.length; i++) { 
            const d = uData[i].split('|'); 
            tData[d[0]] = d[1]; 
        }

        if (tData["username"] && tData["password"]) { 
            return res.redirect('/dashboard'); 
        }
    } catch (error) { 
        console.error(`Warning: ${error.message}`); 
        return res.status(400).json({ status: "error", message: error.message });
    }

    res.json({ status: "error", message: "Invalid login data" });
});

// Route validasi login GrowID
app.post('/player/growid/login/validate', (req, res) => {
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

// Middleware Error Handling Global
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// Jalankan server di port 5000
app.listen(5000, () => {
    console.log('Listening on port 5000');
});
