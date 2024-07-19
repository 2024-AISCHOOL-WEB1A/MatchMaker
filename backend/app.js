const express = require('express')
const app = express()
const mainRouter = require('./routes/mainrouter')
const nunjucks = require('nunjucks')
const userRouter = require('./routes/userrouter')
const session = require('express-session')
const fileStore = require('session-file-store')(session)


app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true
})


//post 데이터 처리 
app.use(express.urlencoded({ extended: true }))


app.use(session({
    httponly: true, //http 요청으로 온 것만 처리 
    resave: false,  //세션을 항상 재저장 할 건지 ? 
    secret: "secret", // 암호화 할 때 사용하는 키 
    store: new fileStore(), // 세션을 어디에 저장 할 건지 ? 
    saveUninitialized: false //세션에 저장할 내용이 없더라도 저장 할지 말지 
}))


app.use('/', mainRouter)
app.use('/user', userRouter)


app.listen(3007, () => {
    console.log('3007  port waiting')
})