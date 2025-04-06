// 交通方式相關 API
const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
router.get('/api/transportation', async (req, res) => {
  try {
    const { exhibition_id } = req.query;
    const [results] = await db.query("SELECT * FROM Transportation WHERE exhibition_id = ?", [exhibition_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // 將 router 導出