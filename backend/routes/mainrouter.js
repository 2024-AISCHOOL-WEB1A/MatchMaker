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
router.get('/join1', (req, res) => {
    res.render('join1')
})


// 풋살장 구장주 회원가입 페이지
router.get('/boss_join', (req, res) => {
    res.render('boss_join1')
})

// router.ger("/join_select", (req, res)=>{
//     res.render("join_select1")
// })

// 구장 등록 페이지
router.get("/field_join", (req, res)=>{
    res.render("field_join");
});


// 로그인 페이지 열어주기
router.get("/login1", (req, res) => {
    res.render("login1");
});


// 풋살장 구장주의 마이페이지
router.get("/boss_myPage", (req, res)=>{
    res.render("boss_myPage1", { idName: req.session.idName });
});


// 밸런스 매칭 기능 페이지 열어주기
router.get("/bal_rate_tmmatch", (req, res) => {
    res.render("bal_rate_tmmatch");
});

module.exports = router;