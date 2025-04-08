const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// 增加連線狀態監聽
db.on('connection', (connection) => {
    console.log(`[DB] 新連線建立 (ID: ${connection.threadId})`);
  });
  
  db.on('acquire', (connection) => {
    console.log(`[DB] 連線被取得 (ID: ${connection.threadId})`);
  });
  
  db.on('release', (connection) => {
    console.log(`[DB] 連線釋放 (ID: ${connection.threadId})`);
  });

// 測試連接池是否正常
db.getConnection()
  .then((connection) => {
    console.log("✅ MySQL 連線成功");
    connection.release(); // 釋放連接回連接池
  })
  .catch((err) => {
    console.error("MySQL 連線失敗:", err.message);
  });

module.exports = db;
