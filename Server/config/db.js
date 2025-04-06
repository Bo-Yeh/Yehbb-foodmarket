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
  queueLimit: 0
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
