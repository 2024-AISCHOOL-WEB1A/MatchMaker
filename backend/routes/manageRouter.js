const express = require('express');
const router = express.Router();
const conn = require('../config/DB');

// 예약관리 페이지 
router.get('/reserv', (req, res) => {
    const sql = "SELECT boss_id FROM boss_info";
    conn.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database query error");
        }

        const bossId = results.map(row => row.boss_id);
        console.log("Session ID:", req.session.idName); // Log session ID
        console.log("Boss IDs:", bossId); // Log boss IDs

        res.render('manage_reserv', { idName: req.session.idName, bossId });
    });
});

// 예약관리  라우터
router.post('/reserv', (req, res) => {
    const user_id = req.session.idName;
    const sql = "SELECT f.boss_id, c.court_name, c.court_idx FROM court_info c JOIN field_info f ON f.field_idx = c.field_idx";
    
    conn.query(sql, (err, results) => {
        if (err) {
            console.error("500 에러 ~", err);
            return res.status(500).send("Database query error");
        }

        if (results.length === 0) {
            return res.status(404).send("No results found");
        }

        const boss_id = results[0].boss_id;
        const court_name = results[0].court_name;
        const court_idx = results[0].court_idx;

        console.log("Boss ID:", boss_id); // Log boss ID
        console.log("Session ID:", req.session.idName); // Log session ID

        const sql2 = "SELECT * FROM reservation_info WHERE court_idx = ?";
        conn.query(sql2, [court_idx], (err, reservationResults) => {
            if (err) {
                console.error("500 에러 ~", err);
                return res.status(500).send("Database query error");
            }

            res.render("manage_resrv", { boss_id, court_name, court_idx, reservations: reservationResults, idName: req.session.idName });
        });
    });
});

// 예약 취소 라우터 
router.post('/cancel_reservation', (req, res) => {
    const reservation_id = req.body.reservation_id;
    const sql = "DELETE FROM reservation_info WHERE reservation_id = ?";

    conn.query(sql, [reservation_id], (err, results) => {
        if (err) {
            console.error("500 에러 ~", err);
            return res.status(500).send("Database query error");
        }

        
        res.redirect('/manage/reserv');
    });
});

module.exports = router;
