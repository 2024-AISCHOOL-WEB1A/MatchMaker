const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const conn = require('../config/DB')

const router = express.Router();

fs.readdir('uploads', (error) => {
    // uploads 폴더 없으면 생성
    if (error) {
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 업로드를 위한 API
// upload의 single 메서드는 하나의 이미지를 업로드할 때 사용
router.post('/upload', upload.single('img'), (req, res) => {
    console.log(req.file);
    const imageUrl = `/uploads/${req.file.filename}`;
    const userId = req.session.idName;

    // 기존 이미지 URL을 가져와 파일 삭제
    conn.query('SELECT user_photo FROM user_info WHERE user_id = ?', [userId], (error, results) => {
        if (error) throw error;

        const oldImageUrl = results[0].user_photo;
        if (oldImageUrl && oldImageUrl !== '/img/ball.png') {
            const oldImagePath = path.join(__dirname, '..', oldImageUrl);
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Failed to delete old image:', err);
                } else {
                    console.log('Old image deleted:', oldImageUrl);
                }
            });
        }

        // 데이터베이스에 이미지 URL 저장 
        conn.query('UPDATE user_info SET user_photo = ? WHERE user_id = ?', [imageUrl, userId], (error, results) => {
            console.log("results", results);
            if (error) throw error;
            res.json({ url: imageUrl });
        });
    });
});

// 특정 사용자의 프로필 이미지 URL을 반환하는 API
router.get('/profile-image', (req, res) => {
    const userId = req.session.idName;
    conn.query('SELECT user_photo FROM user_info WHERE user_id = ?', [userId], (error, results) => {
        if (error) throw error;
        const imageUrl = results[0].user_photo;
        const filePath = path.join(__dirname, '..', imageUrl); // 이미지 파일의 실제 경로

        // 파일 존재 여부 확인
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // 파일이 존재하지 않으면 기본 이미지 URL 반환
                res.json({ url: '/img/ball.png' });
            } else {
                // 파일이 존재하면 해당 이미지 URL 반환
                res.json({ url: imageUrl });
            }
        });
    });
});

module.exports = router;
