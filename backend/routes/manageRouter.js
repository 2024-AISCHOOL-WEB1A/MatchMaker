const express = require('express');
const router = express.Router();
const conn = require('../config/DB');

// 예약관리 페이지 
router.get('/manage_reserv', (req, res) => {
    let boss_id = req.session.idName;
    let field_idx = req.session.fieldIdx;
    console.log("field_idx", field_idx);

    // Step 1: Get court indexes and names
    const sql1 = "SELECT court_idx, court_name FROM court_info WHERE field_idx = ?";
    conn.query(sql1, [field_idx], (err, courts) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database query error");
        }

        if (courts.length > 0) {
            const court_idxs = courts.map(court => court.court_idx);
            const court_names = courts.map(court => court.court_name);
            console.log("court_idxs : ", court_idxs);
            console.log("court_names : ", court_names);

            // Step 2: Get reservation info and related match and team data
            const sql2 = `
                SELECT r.reserv_idx, r.user_id, r.reserv_dt, r.reserv_st_tm, r.reserv_ed_tm,
                    c.court_name, 
                    m.match_title,
                    t.teamA_user1, t.teamA_user2, t.teamA_user3, t.teamA_user4, t.teamA_user5,
                    t.teamB_user1, t.teamB_user2, t.teamB_user3, t.teamB_user4, t.teamB_user5
                FROM reservation_info r
                LEFT JOIN match_info1 m ON r.match_idx = m.match_idx
                LEFT JOIN team_info1 t ON r.match_idx = t.match_idx
                LEFT JOIN court_info c ON r.court_idx = c.court_idx
                WHERE r.court_idx IN (?)`;

            conn.query(sql2, [court_idxs], (err, reservations) => {
                console.log("reservations", reservations);
                if (err) {
                    console.error(err);
                    return res.status(500).send("Database query error");
                }

                // Step 3: Render the page with fetched data
                res.render('manage_reserv', {
                    idName: req.session.idName,
                    boss_id: boss_id,
                    court_names: court_names,
                    court_idxs: court_idxs,
                    reservations: reservations
                });
            });
        } else {
            res.render('manage_reserv', { boss_id: boss_id, court_names: [], court_idxs: [], reservations: [] });
        }
    });
});


// 예약 내역에서 경기 종료후 사장님이 경기결과를 설정하는 페이지
router.get('/result_set/:reserv_idx', (req, res) => {
    const reserv_idx = req.params.reserv_idx;
    console.log("reserv_idx", reserv_idx);
    
    const sql = `
        SELECT r.reserv_idx, r.user_id, r.reserv_dt, r.reserv_st_tm, r.reserv_ed_tm,
            c.court_name, 
            m.match_title,
            t.teamA_user1, t.teamA_user2, t.teamA_user3, t.teamA_user4, t.teamA_user5,
            t.teamB_user1, t.teamB_user2, t.teamB_user3, t.teamB_user4, t.teamB_user5
        FROM reservation_info r
        LEFT JOIN match_info1 m ON r.match_idx = m.match_idx
        LEFT JOIN team_info1 t ON r.match_idx = t.match_idx
        LEFT JOIN court_info c ON r.court_idx = c.court_idx
        WHERE r.reserv_idx = ?`;

    conn.query(sql, [reserv_idx], (err, reservation) => {
        console.log("reservation", reservation);
        if (err) {
            console.error(err);
            return res.status(500).send("Database query error");
        }

        if (reservation.length > 0) {
            res.render('result_set', {
                idName: req.session.idName,
                reservation: reservation[0]
            });
        } else {
            res.status(404).send("Reservation not found");
        }
    });
});

// 경기결과를 설정하기 위한 기능 라우터
router.post('/set_winner', (req, res) => {
    const { winner, reserv_idx } = req.body;

    // 예제 쿼리: 승자 정보를 reservation_info 테이블에 업데이트 (실제 데이터베이스 구조에 따라 변경 필요)
    const sql = `UPDATE reservation_info SET winner = ? WHERE reserv_idx = ?`;
    conn.query(sql, [winner, reserv_idx], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        res.json({ success: true });
    });
});





// 예약관리 라우터
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
    const reserv_idx = req.body.reserv_idx;
    console.log("rserv_idx : ", reserv_idx);

    const sql = "DELETE FROM reservation_info WHERE reserv_idx = ?";
    conn.query(sql, [reserv_idx], (err, results) => {
        if (err) {
            console.error("500 에러 ~", err);
            return res.status(500).send("삭제 실패");
        } else {
            console.log("삭제 성공");
            res.redirect('manage_reserv');
        }
    });
});

module.exports = router;
