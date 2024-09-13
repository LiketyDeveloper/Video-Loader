const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


app.use(express.static(path.join( __dirname, '..', 'frontend')));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'frontend', 'views', 'index.html');
    res.sendFile(filePath)
});

app.get('/video', (req, res) => {

    const vidPath = path.join( __dirname, '..', 'frontend', 'static', 'videos', 'nature.mp4');

    let range = req.headers.range || 'bytes=0-' ;

    const videoSize = fs.statSync(vidPath).size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, "")); //
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    contentLength = end - start + 1;
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4'
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(vidPath, { start, end })

    videoStream.read();
    
    videoStream.on('pipe', (src) => {
        res.sendFile(filePath, {src: src});
        console.log('here');
    });
    videoStream.pipe(res);
});

app.listen(5000, () => console.log('Server is now running on port 5000'));