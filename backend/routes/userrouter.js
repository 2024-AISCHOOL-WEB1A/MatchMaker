const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
const md5 = require('md5');


// 풋살을 하기 위한 회원들의 회원가입
router.post('/join', (req, res) => {
    console.log('join 실행', req.body);

    let { user_id, user_pw, user_nick, user_birthdate, user_gender, user_phone } = req.body;

    let hashedPw = md5(user_pw);

    // 새로 가입한 유저의 기본 값들 정의
    let user_rate = 1500
    let user_rank = '세미프로'
    let user_shooting_point = 0
    let user_pass_point = 0
    let user_dribble_point = 0
    let user_stamina_point = 0
    let user_manner_point = 0
    let user_smile_point = 0
    let joined_at = new Date()

    let sql = `INSERT INTO user_info (
        user_id, user_pw, user_nick, user_birthdate, user_gender, user_phone, 
        user_rate, user_rank, user_shooting_point, user_pass_point, user_dribble_point, 
        user_stamina_point, user_manner_point, user_smile_point, joined_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    conn.query(sql, [
        user_id, hashedPw, user_nick, user_birthdate, user_gender, user_phone,
        user_rate, user_rank, user_shooting_point, user_pass_point, user_dribble_point,
        user_stamina_point, user_manner_point, user_smile_point, joined_at
    ], (err, rows) => {
        if (err) {
            console.error('Database insert error:', err);
            res.send("<script>alert('다시 시도해주세요.'); window.history.back();</script>");
        } else {
            console.log('insert 완료', rows);
            req.session.idName = user_id
            res.redirect('/');
        }
    })
})




// 풋살장 사장님 회원가입
router.post("/boss_join", (req, res) => {

    console.log("구장 관리자 회원가입", req.body)
    let { id, pw, name, phone } = req.body

    let hashedPw = md5(pw);

    let sql = "insert into boss_info values (?,?,?,?)"



    conn.query(sql, [id, hashedPw, name, phone], (err, rows) => {
        console.log('insert 완', rows)


        if (rows) {
            res.redirect('/')
        } else {
            res.send(`<script>alert('다시 시도해 주세용~ ') 
                window.location.href="/join"<script>`)
        }
    })


})



// 로그인 기능 router
router.post("/login", (req, res) => {
    console.log("login", req.body);
    let { id, pw } = req.body;

    let sql = 'SELECT user_id, user_nick FROM user_info WHERE user_id = ? AND user_pw = ?';
    conn.query(sql, [id, pw], (err, rows) => {
        console.log("rows", rows);
        if (rows.length > 0) {  // 로그인 성공
            // req.session.nick = rows[0].nick;
            req.session.idName = id;  // id 라는 변수는 이미 session 에서 예약어로 사용 중이기 때문에, idName 으로 설정
            // console.log(rows[0].nick);
            console.log(req.session.idName);
            res.redirect('/');
        } else {
            res.send("<script>alert('아이디 혹은 비밀번호를 잘못 입력하셨습니다.'); window.location.href='/login';</script>")
        }
    });
});


module.exports = router;