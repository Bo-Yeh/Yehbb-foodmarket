// 展覽相關 API
const express = require("express");
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
router.get('/api/exhibitions', async (req, res) => {
    try {
      const [results] = await db.query("SELECT * FROM Exhibitions");
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
router.get('/api/exhibitions/:exhibition_id', async (req, res) => {
    try {
      const { exhibition_id } = req.params;
      const [results] = await db.query("SELECT * FROM Exhibitions WHERE exhibition_id = ?", [exhibition_id]);
      res.json(results[0] || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;