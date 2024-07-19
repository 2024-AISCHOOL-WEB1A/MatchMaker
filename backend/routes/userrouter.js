const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
const md5 = require('md5');





router.post("/boss_join",(req,res)=>{

    console.log("구장 관리자 회원가입",req.body)
    let {id,pw,name,phone} = req.body

    let hashedPw = md5(pw);

    let sql = "insert into boss_info values (?,?,?,?)"

    

    conn.query(sql,[id,hashedPw,name,phone],(err,rows)=>{
        console.log('insert 완',rows)


        if (rows){
                res.redirect('/')
        }else{
            res.send(`<script>alert('다시 시도해 주세용~ ') 
                window.location.href="/join"<script>`)
        }
    })


})

module.exports = router;