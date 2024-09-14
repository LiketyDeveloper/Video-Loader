const fs = require('fs');
const path = require('path');
const transcodeVid = require('./transcode').transcodeVideo;

// is used for uploading files
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

// connecting the express
const express = require('express');
const session = require('express-session');

const app = express();


app.set('views', path.join(__dirname, '..', 'frontend', 'views'))
app.set('view engine', 'ejs');

app.use(session({
    secret: '732f64cf-e1c3-4be7-b299-053bdb337a88', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if you are using HTTPS
}));


app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'frontend', 'views', 'index.html');
    console.log(`cookies: ${JSON.stringify(req.session)}`);
    res.render('index', {show_player: Boolean(req.session.vidName)})
});

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.send('Please upload a file');
        await transcodeVid(req.file.originalname, req.file.path);
        req.session.vidName = req.file.originalname;
        
        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

app.get('/video', (req, res) => {
    if (req.session.vidName) {
        const vidPath = path.join( __dirname, '..', 'frontend', 'videos', req.session.vidName);

        let range = req.headers.range || 'bytes=0-' ;
    
        const videoSize = fs.statSync(vidPath).size;
    
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, "")); 
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        if (start > end) start = 0;
    
        contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4'
        };
    
        res.writeHead(206, headers);
    
        const videoStream = fs.createReadStream(vidPath, { start, end })
    
        videoStream.pipe(res);
    }
});

app.listen(5000, () => console.log('Server is now running on port 5000'));