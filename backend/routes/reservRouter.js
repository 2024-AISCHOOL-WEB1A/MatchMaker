const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
const { render } = require('nunjucks');

// 예약 페이지 라우트
router.get('/reservAll', (req, res) => {
    const selectedFieldIdx = req.query.field_idx || ''; // 선택된 필드 ID

    const sql1 = 'SELECT * FROM field_info';
    conn.query(sql1, (err, fields) => {
        if (err) {
            return res.status(500).send(err);
        }

        let sql2 = 'SELECT * FROM court_info';
        let queryParams = [];

        if (selectedFieldIdx) {
            sql2 += ' WHERE field_idx = ?';
            queryParams.push(selectedFieldIdx);
        }

        conn.query(sql2, queryParams, (err, courts) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('reserv', { fields, courts, selected_field_idx: selectedFieldIdx });
        });
    });
});

router.post('/reserv', (req, res) => {
    const { court_idx, reserv_dt, reserv_tm } = req.body;
    const user_id = req.session.idName;
    const created_at = new Date();

    const sql = 'INSERT INTO reservation_info (user_id, court_idx, reserv_dt, reserv_tm, created_at) VALUES (?, ?, ?, ?, ?)';
    conn.query(sql, [user_id, court_idx, reserv_dt, reserv_tm, created_at], (err, rows) => {
        if (err) {
            console.error('Error inserting reservation: ' + err);
            res.send('<script>alert("예약에 실패했습니다."); window.location.href="/reservAll";</script>');
            return;
        }

        console.log('reservation 완료', rows);
        res.redirect('/');
    });
});

module.exports = router;