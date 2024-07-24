const express = require('express')
const router = express.Router()
const conn = require('../config/DB')
const md5 = require('md5');


// 풋살을 하기 위한 회원들의 회원가입
router.post('/join1', (req, res) => {
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

    console.log("풋살장 관리자 회원가입", req.body);
    let { id, pw, name, phone } = req.body;
    let hashedPw = md5(pw);

    let sql = "insert into boss_info values (?,?,?,?)";
    conn.query(sql, [id, hashedPw, name, phone], (err, rows) => {
        console.log('insert 완', rows);
        if (rows) {
            req.session.idName = id;
            res.redirect('/field_join');
        } else {
            res.send(`<script>alert('다시 시도해 주세용~ ') 
                window.location.href="/boss_join"<script>`);
        }
    });

});

// 구장 정보 등록 router -> 코트 정보도 같이 입력됨
router.post("/field_join", (req, res) => {
    console.log("구장 정보 등록", req.body);
    let { field_name, field_addr, field_detail, court_count, main_region, sub_region, field_oper_st_time, field_oper_ed_time} = req.body;
    let region = `${req.body.main_region}, ${req.body.sub_region}`
    let boss_id = req.session.idName;

    if (!boss_id) {
        return res.status(400).send('로그인이 필요합니다.');
    }

    // field_info 테이블에 데이터 삽입
    let sql = `INSERT INTO field_info (field_name, field_addr, field_detail, boss_id, field_region, field_oper_st_time, field_oper_ed_time) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    let fieldData = [field_name, field_addr, field_detail, boss_id, region, field_oper_st_time, field_oper_ed_time];

    conn.query(sql, fieldData, (err, result) => {
        if (err) {
            console.error('쿼리 실행 오류:', err);
            return res.status(500).send('서버 오류');
        }

        console.log('insert 완료', result);

        // 삽입된 field_info의 field_idx 값 가져오기
        let field_idx = result.insertId;

        // court_info 테이블에 데이터 삽입
        let courtSql = `INSERT INTO court_info (field_idx, court_name, book_yn) VALUES (?, ?, 'N')`;

        // 가지고 있는 코트 개수만큼 반복
        let courtInserts = [];
        for (let i = 1; i <= court_count; i++) {
            let courtName = `코트${i}`;
            courtInserts.push(new Promise((resolve, reject) => {
                conn.query(courtSql, [field_idx, courtName], (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            }));
        }

        // 모든 court_info 삽입이 완료될 때까지 기다림
        Promise.all(courtInserts)
            .then(results => {
                console.log('모든 코트 정보 삽입 완료', results);
                res.redirect('/');
            })
            .catch(err => {
                console.error('코트 정보 삽입 오류:', err);
                res.status(500).send('서버 오류');
            });
    });
});


// 로그인 기능 router
router.post("/login", (req, res) => {
    console.log("login", req.body);
    let { id, pw } = req.body;

    let hashedPw = md5(pw);

    let userOrboss = Object.keys(req.body)[0];

    if (userOrboss === "user") {
        let sql = 'SELECT user_id, user_nick FROM user_info WHERE user_id = ? AND user_pw = ?';
        conn.query(sql, [id, hashedPw], (err, rows) => {
            console.log("rows", rows);
            if (rows.length > 0) {
                req.session.idName = id;
                console.log(req.session.idName);
                res.redirect('/');
            } else {
                res.send("<script>alert('아이디 혹은 비밀번호를 잘못 입력하셨습니다.'); window.location.href='/login';</script>")
            }
        });
    } else {
        let sql = 'SELECT boss_id, boss_name FROM boss_info WHERE boss_id = ? AND boss_pw = ?';
        conn.query(sql, [id, hashedPw], (err, rows) => {
            console.log("rows", rows);
            if (rows.length > 0) {
                req.session.idName = id;
                console.log(req.session.idName);
                res.redirect('/');
            } else {
                res.send("<script>alert('아이디 혹은 비밀번호를 잘못 입력하셨습니다.'); window.location.href='/login';</script>")
            }
        });
    };

});

// 로그아웃 기능 router
router.get("/logout", (req, res) => {
    console.log("로그아웃");
    req.session.destroy();
    res.send('<script>window.location.href="/"</script>');
});

// 일반회원 마이페이지 기능 router
router.get("/myPage", (req, res) => {
    console.log(req.session.idName);
    let sql = 'SELECT * FROM user_info WHERE user_id = ?;'
    conn.query(sql, [req.session.idName], (err, rows) => {
        console.log("rows", rows);
        res.render("myPage", { rows: rows });
    });
});

// 일반회원 정보수정 기능 router
router.post("/update", (req, res) => {
    console.log("update", req.body);
    console.log(req.session.idName);

    let { nick, phone } = req.body;
    let sql = 'UPDATE user_info SET user_nick = ?, user_phone = ? WHERE user_id = ?';
    conn.query(sql, [nick, phone, req.session.idName], (err, rows) => {
        console.log("rows", rows);
        if (rows.affectedRows > 0) {
            res.redirect('/');
        } else {
            res.send(`
                <script>
                    alert('다시 한번 시도해주세요.')
                    window.location.href="/update"
                </script>
            `);
        }
    });
});

// 풋살장 관리자의 마이페이지에서 boss_info 테이블 업데이트 기능 router
router.post("/boss_info_update", (req, res) => {
    console.log("boss_info_update", req.body);

    let { id, pw, name, phone } = req.body;
    let hashedPw = md5(pw);
    let sql = 'UPDATE boss_info SET boss_pw = ?, boss_name = ?, boss_phone = ? WHERE boss_id = ?';
    conn.query(sql, [hashedPw, name, phone, id], (err, rows) => {
        console.log("rows", rows);
        if (rows.affectedRows > 0) {
            res.redirect('/');
        } else {
            res.send(`
                <script>
                    alert('다시 한번 시도해주세요.')
                    window.location.href="/update"
                </script>
            `);
        }
    });
});


// 풋살장 관리자의 마이페이지에서 field_info 테이블 업데이트 기능 router
router.post("/field_info_update", (req, res) => {
    console.log("field_info_update", req.body);

    let { field_name, field_addr, field_detail } = req.body;
    let boss_id = req.session.idName;

    let sql = 'UPDATE field_info SET field_name = ?, field_addr = ?, field_detail = ? WHERE boss_id = ?';
    conn.query(sql, [field_name, field_addr, field_detail, boss_id], (err, rows) => {
        console.log("rows", rows);
        if (rows.affectedRows > 0) {
            res.redirect('/');
        } else {
            res.send(`
                <script>
                    alert('다시 한번 시도해주세요.')
                    window.location.href="/update"
                </script>
            `);
        }
    });
});


// 풋살장 관리자의 마이페이지에서 court_info 테이블 업데이트 기능 router
router.post("/court_info_update", (req, res) => {
    console.log("court_info_update, ", `req.body: ${req.body}`);

    let { court_count } = req.body;
    court_count = parseInt(court_count, 10);  // 입력된 코트 수를 정수로 변환
    let boss_id = req.session.idName;

    if (!boss_id) {
        return res.status(400).send('로그인이 필요합니다.');
    }

    // field_info 테이블에서 현재 로그인 되어있는 boss_id를 통해 field_idx 가져오기
    let sql = `SELECT field_idx FROM field_info WHERE boss_id = ?`;
    conn.query(sql, [boss_id], (err, result) => {
        if (err) {
            console.error('쿼리 실행 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (result.length === 0) {
            return res.status(404).send('구장 정보를 찾을 수 없습니다.');
        }

        let field_idx = result[0].field_idx;

        // 현재 코트 수 가져오기
        let currentCourtSql = `SELECT court_idx FROM court_info WHERE field_idx = ? ORDER BY court_idx`;
        conn.query(currentCourtSql, [field_idx], (err, result) => {
            if (err) {
                console.error('쿼리 실행 오류:', err);
                return res.status(500).send('서버 오류');
            }

            let currentCourtCount = result.length;

            if (court_count > currentCourtCount) {
                // 코트 수가 더 많아진 경우 - 코트 추가
                let insertCourtSql = `INSERT INTO court_info (field_idx, court_name, book_yn) VALUES (?, ?, 'N')`;
                let courtInserts = [];
                for (let i = currentCourtCount + 1; i <= court_count; i++) {
                    let courtName = `구장${i}`;
                    courtInserts.push(new Promise((resolve, reject) => {
                        conn.query(insertCourtSql, [field_idx, courtName], (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }));
                }
                Promise.all(courtInserts)
                    .then(results => {
                        console.log('코트 추가 완료', results);
                        res.redirect('/boss_myPage');
                    })
                    .catch(err => {
                        console.error('코트 추가 오류:', err);
                        res.status(500).send('서버 오류');
                    });
            } else if (court_count < currentCourtCount) {
                // 코트 수가 더 적어진 경우 - 코트 삭제
                let deleteCourtSql = `DELETE FROM court_info WHERE court_idx >= ? AND field_idx = ?`;
                let deleteIndex = result[court_count].court_idx;  // 남길 코트의 마지막 court_idx

                conn.query(deleteCourtSql, [deleteIndex, field_idx], (err, result) => {
                    if (err) {
                        console.error('쿼리 실행 오류:', err);
                        return res.status(500).send('서버 오류');
                    }
                    console.log('코트 삭제 완료', result);
                    res.redirect('/boss_myPage');
                });
            } else {
                // 코트 수가 같은 경우 - 아무 것도 하지 않음
                res.redirect('/boss_myPage');
            }
        });
    });
});


// 매치페이지에서 방만들기 했을 때 match_info 테이블에 정보 insert 기능하는 router
router.post("/create_match", (req, res) => {

    console.log("match_info테이블", req.body);
    let { match_title, female_match_yn, rate_match_yn, main_region, sub_region, match_date, reserv_tm, match_info } = req.body;

    let boss_id = req.session.idName;
    let join_user = boss_id;
    let created_at = new Date();
    let match_region = `${main_region}, ${sub_region}`;
    let match_st_dt = reserv_tm[0];
    let match_ed_dt = reserv_tm.pop();
    console.log(`match_ed_dt : ${match_ed_dt}`);

    if (req.body.female_match_yn === "on") {
        female_match_yn = 'Y';
    } else {
        female_match_yn = 'N';
    }

    if (req.body.rate_match_yn === "on") {
        rate_match_yn = 'Y';
    } else {
        rate_match_yn = 'N';
    }


    let sql = "insert into match_info1 (match_title, join_user, match_region, match_date, match_st_dt, match_ed_dt, female_match_yn, rate_match_yn, created_at, match_info) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    conn.query(sql, [match_title, join_user, match_region, match_date, match_st_dt, match_ed_dt, female_match_yn, rate_match_yn, created_at, match_info], (err, rows) => {
        console.log('insert 완', rows);
        if (rows) {
            res.redirect('/user/match');
        } else {
            res.send(`<script>alert('다시 시도해 주세용~ ') 
                window.location.href="/create_match"<script>`);
        }
    });

});


// 매치 페이지에서 방 리스트를 보여주는 라우터
router.get("/match", (req, res) => {
    console.log(req);

    let sql = "SELECT match_idx, match_title, match_region, match_date, match_st_dt, match_ed_dt, female_match_yn, rate_match_yn, match_info FROM match_info1";
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('데이터 조회 오류:', err);
            res.send("데이터를 가져오는 중 오류가 발생했습니다.");
        } else {
            res.render("match", { matches: results, idName: req.session.idName });
        }
    });
});


// 경기참가 버튼 클릭 시 호출되는 라우터
router.post("/join_game", (req, res) => {
    const newUserId = req.session.idName;
    const match_idx = req.body.match_idx; // match_idx 값 가져오기
    console.log(req.session.idName, "id값"); // 새로운 사용자의 user_id
    console.log(req.body.match_idx, "match_idx값"); // 새로운 사용자의 user_id

    let sql = "SELECT join_user FROM match_info1 WHERE match_idx = ?";
    conn.query(sql, [match_idx], (err, results) => {
        if (err) {
            console.error('데이터 조회 오류:', err);
            res.send("데이터를 가져오는 중 오류가 발생했습니다.");
        } else {
            let currentJoinUser = results[0].join_user; // 현재 join_user 컬럼의 값 가져오기
            let join_user = currentJoinUser ? currentJoinUser + ", " + newUserId : newUserId; // 새로운 사용자 추가

            sql = "UPDATE match_info1 SET join_user = ? WHERE match_idx = ?";
            conn.query(sql, [join_user, match_idx], (err, results) => { // match_idx를 WHERE 조건으로 추가
                if (err) {
                    console.error('데이터 업데이트 오류:', err);
                    res.send("데이터를 업데이트하는 중 오류가 발생했습니다.");
                } else {
                    res.send("데이터 업데이트 성공!");
                }
            });
        }
    });
});

// 경기탈퇴 버튼 클릭 시 호출되는 라우터
router.post("/cancel_game", (req, res) => {
    const cancelUserId = req.session.idName;
    const match_idx = req.body.match_idx;

    console.log(req.session.idName, "id값");
    console.log(req.body.match_idx, "match_idx값");

    let sql = "SELECT join_user FROM match_info1 WHERE match_idx = ?";
    conn.query(sql, [match_idx], (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 오류:', err);
            return res.send("데이터를 조회하는 중 오류가 발생했습니다.");
        }

        let currentJoinUser = results[0].join_user || "";
        let currentJoinUsers = currentJoinUser.split(",").map(user => user.trim());

        const index = currentJoinUsers.indexOf(cancelUserId);
        if (index === -1) {
            return res.send("탈퇴할 사용자를 찾을 수 없습니다.");
        }

        // 탈퇴 여부 확인을 위한 페이지를 반환
        res.send(`
            <form id="confirmForm" action="/user/confirm_cancel_game" method="post">
                <input type="hidden" name="match_idx" value="${match_idx}" />
                <input type="hidden" name="user_id" value="${cancelUserId}" />
                <script>
                    if (confirm('정말 탈퇴하시겠습니까?')) {
                        document.getElementById('confirmForm').submit();
                    } else {
                        window.history.back();
                    }
                </script>
            </form>
        `);
    });
});

// 탈퇴 확정 처리를 위한 라우터
router.post("/confirm_cancel_game", (req, res) => {
    const cancelUserId = req.body.user_id;
    const match_idx = req.body.match_idx;
    console.log('탈퇴회원: ', cancelUserId);
    let sql = "SELECT join_user FROM match_info1 WHERE match_idx = ?";
    conn.query(sql, [match_idx], (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 오류:', err);
            return res.send("데이터를 조회하는 중 오류가 발생했습니다.");
        }

        let currentJoinUser = results[0].join_user || "";
        let currentJoinUsers = currentJoinUser.split(",").map(user => user.trim());
        
        const index = currentJoinUsers.indexOf(cancelUserId);
        if (index === -1) {
            return res.send("탈퇴할 사용자를 찾을 수 없습니다.");
        }

        currentJoinUsers.splice(index, 1);
        let join_user = currentJoinUsers.join(", ");

        sql = "UPDATE match_info1 SET join_user = ? WHERE match_idx = ?";
        conn.query(sql, [join_user, match_idx], (err, results) => {
            if (err) {
                console.error('데이터 업데이트 오류:', err);
                return res.send("데이터를 업데이트하는 중 오류가 발생했습니다.");
            }
            res.send("탈퇴가 완료되었습니다.");
        });
    });
});

module.exports = router;