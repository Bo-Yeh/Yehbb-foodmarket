const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
// 商家相關 API
router.get('/api/vendors', async (req, res) => {
    try {
      const { exhibition_id } = req.query;
      let query = "SELECT * FROM Vendors";
      if (exhibition_id) query += " WHERE exhibition_id = ?";
      const [results] = await db.query(query, exhibition_id ? [exhibition_id] : []);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/vendors/:vendor_id', async (req, res) => {
    try {
      const { vendor_id } = req.params;
      const [results] = await db.query("SELECT * FROM Vendors WHERE vendor_id = ?", [vendor_id]);
      res.json(results[0] || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/vendors/search', async (req, res) => {
    try {
      const { keyword } = req.query;
      const [results] = await db.query("SELECT * FROM Vendors WHERE name LIKE ?", [`%${keyword}%`]);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router; // 將 router 導出