// const express = require('express')
// const app = express()
// const mainRouter = require('./routes/mainrouter')
// const nunjucks = require('nunjucks')
// const userRouter = require('./routes/userrouter')
// const reservRouter = require('./routes/reservRouter')
// const balRouter = require('./routes/balRouter')
// const session = require('express-session')
// const fileStore = require('session-file-store')(session)
// const conn = require('./config/DB.js') // 데이터베이스 연결 모듈

// app.set('view engine', 'html')
// nunjucks.configure('views', {
//     express: app,
//     watch: true
// })

// // post 데이터 처리 
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json()) // JSON 데이터 처리를 위해 추가

// app.use(session({
//     httpOnly: true,
//     resave: false,
//     secret: "secret",
//     store: new fileStore(),
//     saveUninitialized: false
// }))

// app.use(express.static("public"));
// app.use('/', mainRouter)
// app.use('/user', userRouter)
// app.use('/reserv', reservRouter)
// app.use('/bal', balRouter)

// // 아이디 중복 확인 API
// app.post('/check-username', (req, res) => {
//     const { username } = req.body;
//     const query = 'SELECT * FROM user_info WHERE user_id = ?';
    
//     conn.query(query, [username], (error, results) => {
//         if (error) {
//             console.error('Error checking username:', error);
//             res.status(500).json({ error: '서버 오류' });
//         } else {
//             res.json({ exists: results.length > 0 });
//         }
//     });
// });


// app.listen(3007, () => {
//     console.log('3007 port waiting')
// })

const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const session = require('express-session')
const fileStore = require('session-file-store')(session)
const path = require('path')  // path 모듈 추가

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true
})

// 기본 미들웨어
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'public')))

// 세션 미들웨어
app.use(session({
    httpOnly: true,
    resave: false,
    secret: "secret",
    store: new fileStore(),
    saveUninitialized: false
}))

// 라우터 설정
const mainRouter = require('./routes/mainrouter')
const userRouter = require('./routes/userrouter')
const reservRouter = require('./routes/reservRouter')
const balRouter = require('./routes/balRouter')

app.use('/', mainRouter)
app.use('/user', userRouter)
app.use('/reserv', reservRouter)
app.use('/bal', balRouter)

// 아이디 중복 확인 API
app.post('/check-username', (req, res) => {
    const { username } = req.body;
    const query = 'SELECT * FROM user_info WHERE user_id = ?';
    
    conn.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error checking username:', error);
            res.status(500).json({ error: '서버 오류' });
        } else {
            res.json({ exists: results.length > 0 });
        }
    });
});

app.listen(3007, () => {
    console.log('3007 port waiting')
})
