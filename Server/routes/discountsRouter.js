// 優惠活動相關 API
const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
router.get('/api/discounts', async (req, res) => {
    try {
      const { vendor_id } = req.query;
      let query = "SELECT * FROM Discounts";
      if (vendor_id) query += " WHERE vendor_id = ?";
      const [results] = await db.query(query, vendor_id ? [vendor_id] : []);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/discounts', async (req, res) => {
    try {
      const { vendor_id, description } = req.body;
      const [result] = await db.query("INSERT INTO Discounts (vendor_id, description) VALUES (?, ?)", [vendor_id, description]);
      res.json({ discount_id: result.insertId, vendor_id, description });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router; // 將 router 導出