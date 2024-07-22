const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
// const Date = require('date')


router.post('/reserv', (req, res) => {
    console.log(req.body)
    const { court_idx, reserv_dt, reserv_tm } = req.body;
    const user_id = req.session.idName;
    const created_at = new Date(); 

    const sql = 'INSERT INTO reservation_info (user_id, court_idx, reserv_dt, reserv_tm, created_at) VALUES (?, ?, ?, ?, ?)';
    conn.query(sql, [user_id, court_idx, reserv_dt, reserv_tm, created_at], (err, rows) => {
        if (err) {
            console.error('Error inserting reservation: ' + err);
            res.send('<script>alert("예약에 실패했습니다."); window.location.href="http://localhost:3007/reserv";</script>');
            return;
        }

        console.log('reservation 완료', rows);
        res.redirect('/');
    });
});
module.exports = router;