const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const conn = require('../config/DB')

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload', upload.single('img'), (req, res) => {
    const userId = req.session.idName;
    const imageBuffer = req.file.buffer;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    conn.query('UPDATE user_info SET user_photo = ? WHERE user_id = ?', [imageBuffer, userId], (error) => {
        if (error) throw error;
        res.json({ message: 'Profile image uploaded successfully' });
    });
});

router.get('/profile-image/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    conn.query('SELECT user_photo FROM user_info WHERE user_id = ?', [userId], (error, results) => {

        if (error) throw error;

        

        const imageUrl = results[0].user_photo.toString(); // Buffer를 문자열로 변환
        const filePath = path.join(__dirname, '..', imageUrl); // 이미지 파일의 실제 경로

        const imageBuffer = results[0]?.user_photo;
        if (imageBuffer) {
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': imageBuffer.length
            });
            res.end(imageBuffer);
        } else {
            res.status(404).json({ error: 'Profile image not found' });
        }
    });
});

module.exports = router;
