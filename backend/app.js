require("dotenv").config();
console.log(process.env.CUSTOMKEY);
const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const session = require("express-session");
const fileStore = require("session-file-store")(session);
const path = require("path"); // path 모듈 추가
const conn = require("./config/DB.js");
const WebSocket = require("ws");
const uploadRouter = require('./routes/uploadRouter.js'); // uploadRouter 경로에 맞게 수정
const bossUploadRouter = require('./routes/bossuploadRouter');



// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, "public")));

// 세션 미들웨어
app.use(
  session({
    httpOnly: true,
    resave: false,
    secret: "secret",
    store: new fileStore(),
    saveUninitialized: false,
  })
);

// 라우터 설정
const mainRouter = require("./routes/mainrouter");
const userRouter = require("./routes/userrouter");
const reservRouter = require("./routes/reservRouter");
const balRouter = require("./routes/balRouter");
const manageRouter = require("./routes/manageRouter.js");
app.use("/", mainRouter);
app.use("/user", userRouter);
app.use("/reserv", reservRouter);
app.use("/bal", balRouter);
app.use("/manage", manageRouter);

// 정적 파일 제공 설정 (업로드된 파일 접근 가능)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/boss', express.static(path.join(__dirname, 'uploads/boss')));

// 업로드 라우터 추가
app.use('/api', uploadRouter);
app.use('/api/boss', bossUploadRouter);


// 아이디 중복 확인 API
app.post("/check-username", (req, res) => {
  const { username } = req.body;
  const query = "SELECT * FROM user_info WHERE user_id = ?";

  conn.query(query, [username], (error, results) => {
    if (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ error: "서버 오류" });
    } else {
      res.json({ exists: results.length > 0 });
    }
  });
});

// 서버와 WebSocket 서버를 함께 실행
const server = app.listen(3007, () => {
  console.log("3007 port waiting");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("새 사용자가 연결되었습니다.");

  ws.on("message", (message) => {
    // 모든 클라이언트에게 메시지 전송
    const msg = message.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    console.log("사용자가 연결을 종료했습니다.");
  });
});
