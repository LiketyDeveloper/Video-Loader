const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const path = require('path');
const fs = require('fs');

async function transcodeVideo(filename, filepath) {
    return new Promise((resolve, reject) => {

        ffmpeg(filepath)
            .videoCodec('libx264')
            .audioCodec("libmp3lame")
            .size('720x?')
            .on('error', err => { 
                reject(err) 
            }).on('end', async() => {
                fs.unlinkSync(filepath)
                resolve();
            })
            .save(path.join( __dirname, '..', 'frontend', 'videos', filename));

    })
}


module.exports = { transcodeVideo }