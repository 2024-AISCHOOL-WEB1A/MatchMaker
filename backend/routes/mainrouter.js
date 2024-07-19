const express = require('express')
const router = express.Router()




router.get('/',(req,res)=>{
    if(req.session.idname){
        console.log('session',req.session.idName)
    }
    res.render('main',{idName : req.session.idName})
}) 





router.get('/boss_join',(req,res)=>{


    res.render('boss_join')
   
   })

   module.exports = router;