const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
// const Date = require('date')


router.post('/reserv', (req, res) => {
    console.log(req.body)
    const { court_idx, reserv_dt } = req.body;
    const user_id = req.session.idName;
    const reserv_tm = new Date().toISOString().slice(11, 19); // 현재 시간 타임스탬프로 설정

    const sql = 'INSERT INTO reservations (user_id, court_idx, reserv_dt, reserv_tm) VALUES (?, ?, ?, ?)';
    conn.query(sql, [user_id, court_idx, reserv_dt, reserv_tm], (err, rows) => {
        if (err) {
            console.error('Error inserting reservation: ' + err);
            res.send('<script>alert("예약에 실패했습니다."); window.location.href="/reserv/reserve";</script>');
            return;
        }

        console.log('reservation 완료', rows);
        res.redirect('/');
    });
});
module.exports = router;