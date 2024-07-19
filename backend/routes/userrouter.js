const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
const md5 = require('md5');

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

module.exports = router;