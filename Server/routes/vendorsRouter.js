const express = require('express');
const db = require('../config/db'); // 引入資料庫連接池
const router = express.Router();
// 商家相關 API
// 在現有 API 基礎上添加以下功能
router.get('/', async (req, res) => {
  try {
    const { 
      exhibition_id, 
      page = 1, 
      pageSize = 10,
      sortBy = 'vendor_id',
      order = 'ASC'
    } = req.query;

    // 分頁計算
    const offset = (page - 1) * pageSize;

    // SQL 防注入驗證
    const validSortColumns = ['vendor_id', 'name', 'created_at'];
    const validOrder = ['ASC', 'DESC'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'vendor_id';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order : 'ASC';

    let query = `
      SELECT 
        vendor_id, 
        name, 
        address, 
        contact, 
        opening_hours,
        exhibition_id,
        (SELECT COUNT(*) FROM Vendors 
         ${exhibition_id ? 'WHERE exhibition_id = ?' : ''}) AS total
      FROM Vendors
      ${exhibition_id ? 'WHERE exhibition_id = ?' : ''}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const params = [];
    if (exhibition_id) params.push(exhibition_id);
    params.push(Number(pageSize), offset);

    const [results] = await db.query(query, params);
    
    res.json({
      data: results,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil((results[0]?.total || 0) / pageSize),
        totalItems: results[0]?.total || 0
      }
    });

  } catch (err) {
    console.error(`[API Error] ${err.stack}`);
    res.status(500).json({ 
      code: 'DB_QUERY_FAILED',
      message: '資料庫查詢異常，請稍後再試'
    });
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