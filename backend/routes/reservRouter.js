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

            let sql3 = 'SELECT field_oper_st_time, field_oper_ed_time FROM field_info';
            let queryParams3 = [];

            if (selectedFieldIdx) {
                sql3 += ' WHERE field_idx = ?';
                queryParams3.push(selectedFieldIdx);
            }
            conn.query(sql3, queryParams3, (err, fieldoperTimes) => {
                if (err) {
                    return res.status(500).send(err);
                }
                console.log(fieldoperTimes);
                console.log(fieldoperTimes[0]);
                console.log(fieldoperTimes[0].field_oper_st_time);


                res.render('reserv',
                    {
                        fields: fields,
                        courts: courts,
                        selected_field_idx: selectedFieldIdx,
                        fieldoperTimes: fieldoperTimes,
                        field_oper_st_time: fieldoperTimes[0].field_oper_st_time,
                        field_oper_ed_time: fieldoperTimes[0].field_oper_ed_time
                    });
            });
        });
    });
});

router.post('/reserv', (req, res) => {
    const { court_idx, reserv_dt, reserv_st_tm, reserv_ed_tm } = req.body;
    const user_id = req.session.idName;
    const created_at = new Date();
    
    const sql = 'INSERT INTO reservation_info (user_id, court_idx, reserv_dt, created_at, reserv_st_tm, reserv_ed_tm) VALUES (?, ?, ?, ?, ?, ?)';

    // 시작 시간보다 더 이른 종료시간을 눌렀을 떄 return 'failed' 

    if (req.body.reserv_ed_tm > req.body.reserv_st_tm) {
        conn.query(sql, [user_id, court_idx, reserv_dt, created_at, reserv_st_tm, reserv_ed_tm], (err, rows) => {
            if (err) {
                console.error('Error inserting reservation: ' + err);
                res.send('<script>alert("예약에 실패했습니다."); window.location.href="/reserv/reservAll";</script>');
                return;
            }

            console.log('reservation 완료', rows);
            res.redirect('/');
        });
    } else { return res.send('<script>alert("예약시작시간보다 종료시간이 더 빠릅니다"); window.location.href="/reserv/reservAll";</script>') }
});


module.exports = router;