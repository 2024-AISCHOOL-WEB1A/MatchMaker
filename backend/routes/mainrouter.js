const express = require('express')
const router = express.Router()
const conn = require("../config/DB");


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
router.get("/field_join", (req, res) => {
    res.render("field_join");
});


// 로그인 페이지 열어주기
router.get("/login1", (req, res) => {
    res.render("login1");
});


// 풋살장 구장주의 마이페이지
router.get("/boss_myPage", (req, res) => {
    res.render("boss_myPage", { idName: req.session.idName });
});


// 밸런스 매칭 기능 페이지 열어주기
router.get("/bal_rate_tmmatch", (req, res) => {
    res.render("bal_rate_tmmatch");
});


// 매치 페이지 
router.get("/match", (req, res) => {
    res.render("match", { idName: req.session.idName });
});

// 방 만들기 페이지
router.get("/create_match", (req, res) => {
    res.render("create_match", { idName: req.session.idName });
});

// 매칭방 입장 페이지
router.get('/match_room/:match_idx', (req, res) => {
    const match_idx = req.params.match_idx;
    console.log(`match_idx : ${match_idx}`);

    let sql = "SELECT * FROM match_info1 WHERE match_idx = ?";
    conn.query(sql, [match_idx], (err, result) => {
        if (err) {
            console.error(err);
            res.send("매치 정보를 가져오는 중 오류가 발생했습니다.");
        } else {
            let match = result[0];
            let join_users = match.join_user ? match.join_user.split(",").map(user => user.trim()).filter(user => user) : [];

            if (join_users.length > 0) {
                let placeholders = join_users.map(() => '?').join(',');
                let user_sql = `SELECT user_id, user_rate FROM user_info WHERE user_id IN (${placeholders})`;

                conn.query(user_sql, join_users, (err, users) => {
                    if (err) {
                        console.error(err);
                        res.send("사용자 정보를 가져오는 중 오류가 발생했습니다.");
                    } else {
                        let user_info = {};
                        users.forEach(user => {
                            user_info[user.user_id] = user.user_rate;
                        });
                        const teamLeader = join_users[0]; // 방장 아이디 값 저장

                        res.render('match_room', {
                            match: match,
                            idName: req.session.idName,
                            join_users: join_users,
                            user_info: user_info,
                            teamLeader: teamLeader
                        });
                    }
                });
            } else {
                res.render('match_room', {
                    match: match,
                    idName: req.session.idName,
                    join_users: [],
                    user_info: {}
                });
            }
        }
    });
});


module.exports = router;