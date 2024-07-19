const express = require('express')
const router = express.Router()



router.get('/', (req, res) => {
    if (req.session.idname) {
        console.log('session', req.session.idName)
    }
    res.render('main', { idName: req.session.idName })
})


router.get('/join', (req, res) => {
    res.render('join')
})


router.get('/boss_join', (req, res) => {
    res.render('boss_join')
})


// 로그인 페이지 열어주기
router.get("/login", (req, res) => {
    res.render("login");
});


module.exports = router;