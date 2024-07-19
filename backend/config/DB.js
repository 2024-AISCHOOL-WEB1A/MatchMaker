const mysql = require('mysql2')
//mysql을 설치하면 외부 db 사용 할 때 오류 꼭 mysql2 설치 

const conn = mysql.createConnection({

    host : "project-db-stu3.smhrd.com",
    port :"3307",
    database : "Insa5_JSA_hacksim_2",
    password : "aischool2",
    user : "Insa5_JSA_hacksim_2"



})


conn.connect()
console.log('DB연결완료');


module.exports = conn;