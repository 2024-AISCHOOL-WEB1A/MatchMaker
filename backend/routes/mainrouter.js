const express = require('express')
const router = express.Router()


// 메인 페이지
router.get('/', (req, res) => {
    if (req.session.idname) {
        console.log('session', req.session.idName)
    }
    res.render('main', { idName: req.session.idName })
})


// 일반 회원 회원가입 페이지
router.get('/join', (req, res) => {
    res.render('join')
})


// 풋살장 구장주 회원가입 페이지
router.get('/boss_join', (req, res) => {
    res.render('boss_join')
})

// 구장 등록 페이지
router.get("/field_join", (req, res)=>{
    res.render("field_join");
});


// 로그인 페이지 열어주기
router.get("/login", (req, res) => {
    res.render("login");
});


// 풋살장 구장주의 마이페이지
router.get("/boss_myPage", (req, res)=>{
    res.render("boss_myPage", { idName: req.session.idName });
});


// 예약 기능 구현
router.get('/reserv', (req, res) => {
    const sql1 = 'SELECT * FROM court_info';
    const sql2 = 'SELECT * FROM field_info';

    conn.query(sql1, (err, courts) => {
        if (err) {
            console.error('Error fetching courts: ' + err);
            res.status(500).send('서버 오류');
            return;
        }

        conn.query(sql2, (err, fields) => {
            if (err) {
                console.error('Error fetching fields: ' + err);
                res.status(500).send('서버 오류');
                return;
            }

            res.render('reserv', { courts, fields });
        });
    });
});


module.exports = router;