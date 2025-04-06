const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
// 收藏商家相關 API

router.get('/api/favorites', async (req, res) => {
    try {
      const { user_id } = req.query;
      const [results] = await db.query("SELECT v.* FROM Vendors v JOIN Favorites f ON v.vendor_id = f.vendor_id WHERE f.user_id = ?", [user_id]);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/favorites', async (req, res) => {
    try {
      const { user_id, vendor_id } = req.body;
      await db.query("INSERT INTO Favorites (user_id, vendor_id) VALUES (?, ?)", [user_id, vendor_id]);
      res.json({ user_id, vendor_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.delete('/api/favorites', async (req, res) => {
    try {
      const { user_id, vendor_id } = req.body;
      await db.query("DELETE FROM Favorites WHERE user_id = ? AND vendor_id = ?", [user_id, vendor_id]);
      res.json({ message: "喜愛商家已刪除" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router; // 將 router 導出