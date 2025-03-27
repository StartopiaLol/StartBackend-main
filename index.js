const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

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
app.set('trust proxy', 1);

// Middleware untuk CORS dan Logging
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.on('finish', () => {
        console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    });

    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Handling favicon request untuk menghindari error
app.all('/favicon.ico', (req, res) => res.status(204).end());

// Route Register
app.all('/player/register', (req, res) => {
    res.send("Coming soon...");
});

// Route Login Dashboard
app.all('/player/login/dashboard', (req, res) => {
    const tData = {};

    try {
        const uData = req.body.data ? req.body.data.split('\\n') : [];
        const uName = uData[0]?.split('|') || [];
        const uPass = uData[1]?.split('|') || [];

        for (let i = 0; i < uData.length - 1; i++) {
            const d = uData[i].split('|');
            tData[d[0]] = d[1];
        }

        if (uName[1] && uPass[1]) {
            return res.redirect('/player/growid/login/validate');
        }
    } catch (error) {
        console.log(`Warning: ${error}`);
    }

    res.render(__dirname + '/public/html/dashboard.ejs', { data: tData });
});

// Route Validate Login
app.all('/player/growid/login/validate', (req, res) => {
    const { _token, growId, password } = req.body;

    if (!_token || !growId || !password) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    const token = Buffer.from(`_token=${_token}&growId=${growId}&password=${password}`).toString('base64');

    res.json({
        status: "success",
        message: "Account Validated.",
        token: token,
        url: "",
        accountType: "growtopia"
    });
});

// Route Check Token
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.render(__dirname + '/public/html/dashboard.ejs');
    }

    try {
        const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');

        if (typeof decoded !== 'string' || !decoded.startsWith('growId=') || !decoded.includes('password=')) {
            return res.render(__dirname + '/public/html/dashboard.ejs');
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
        res.render(__dirname + '/public/html/dashboard.ejs');
    }
});

// Route Utama
app.get('/', (req, res) => {
   res.send('Hello World!');
});

// Jalankan Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
