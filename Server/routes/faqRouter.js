// 常見問題相關 API
const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
router.get('/api/faq', async (req, res) => {
    try {
      const [results] = await db.query("SELECT * FROM FAQ");
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/faq', async (req, res) => {
    try {
      const { question, answer } = req.body;
      const [result] = await db.query("INSERT INTO FAQ (question, answer) VALUES (?, ?)", [question, answer]);
      res.json({ faq_id: result.insertId, question, answer });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router; // 將 router 導出