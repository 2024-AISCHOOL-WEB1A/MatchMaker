const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const conn = require('../config/DB')

const router = express.Router();

//이미지 저장할 uploads폴더 읽기
fs.readdir('uploads/boss', (error) => {
    // uploads 폴더 없으면 생성
    if (error) {
        fs.mkdirSync('uploads/boss');
    }
});

// 업로드 변수 정의
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/boss/');
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
router.post('/bossupload', upload.single('img'), (req, res) => {
    console.log(req.file);
    const imageUrl = `/uploads/boss/${req.file.filename}`;
    const bossId = req.session.idName;

    // 기존 이미지 URL을 가져와 파일 삭제
    conn.query('SELECT boss_photo FROM boss_info WHERE boss_id = ?', [bossId], (error, results) => {
        if (error) throw error;

        const oldImageUrl = results[0].boss_photo;
        if (oldImageUrl && oldImageUrl !== '/img/user_profile2.png') {
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
        conn.query('UPDATE boss_info SET boss_photo = ? WHERE boss_id = ?', [imageUrl, bossId], (error, results) => {
            console.log("results", results);
            if (error) throw error;
            res.json({ url: imageUrl });
        });
    });
});

// 특정 사용자의 프로필 이미지 URL을 반환하는 API
router.get('/bossprofile-image', (req, res) => {
    const bossId = req.session.idName;
    conn.query('SELECT boss_photo FROM boss_info WHERE boss_id = ?', [bossId], (error, results) => {
        if (error) throw error;
        console.log("results", results);
        const imageUrl = results[0].boss_photo;
        const filePath = path.join(__dirname, '..', imageUrl); // 이미지 파일의 실제 경로
        

        // 파일 존재 여부 확인
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // 파일이 존재하지 않으면 기본 이미지 URL 반환
                res.json({ url: '/img/user_profile2.png' });
            } else {
                // 파일이 존재하면 해당 이미지 URL 반환
                res.json({ url: imageUrl });
            }
        });
    });
});

module.exports = router;
