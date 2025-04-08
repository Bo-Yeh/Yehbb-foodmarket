const express = require("express");
const line = require('@line/bot-sdk');
const axios = require('axios'); // 新增依賴
const router = express.Router();
const db = require('../config/db');
// 強化環境變數檢查區塊
if (!process.env.LINE_CHANNEL_SECRET || !process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  throw new Error("LINE_CHANNEL_SECRET 與 LINE_CHANNEL_ACCESS_TOKEN 必須設定");
}


const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};
const client = new line.Client(config);

// 強化型 Webhook 端點
router.post('/webhook', 
  line.middleware(config),
  async (req, res) => {
    try {
      // ==================== 新增偵錯區塊 ====================
      console.log(`📨 收到 ${req.method} 請求，路徑：${req.originalUrl}`);
      console.log('🔍 請求頭信息:', JSON.stringify(req.headers, null, 2));
      
      // ==================== 事件類型分析 ====================
      console.log('📩 事件類型列表:', req.body.events.map(e => ({
        type: e.type,
        messageType: e.message?.type || '非訊息事件',
        timestamp: e.timestamp
      })));

      // ==================== 原始訊息處理 ====================
      console.log('✅ 確認LineBot已收到事件');
      console.log('[RAW EVENT]', JSON.stringify(req.body, null, 2));

      // ==================== 並行處理強化 ====================
      const results = await Promise.all(
        req.body.events.map(async (event, index) => {
          console.log(`🛎️ 處理第 ${index + 1} 個事件 (ID:${event.eventId})`);
          try {
            const result = await handleEvent(event);
            console.log(`🎉 事件 ${event.eventId} 處理完成`);
            return result;
          } catch (error) {
            console.error(`❌ 事件處理失敗: ${error.message}`);
            console.error('錯誤堆疊:', error.stack);
            return { 
              status: 'failed',
              eventId: event.eventId,
              errorCode: error.code || 'UNKNOWN_ERROR'
            };
          }
        })
      );

      // ==================== 響應前總結 ====================
      console.log('📊 請求處理統計:', {
        totalEvents: req.body.events.length,
        successCount: results.filter(r => r.status !== 'failed').length,
        failureCount: results.filter(r => r.status === 'failed').length
      });

      res.status(200).json(results);
    } catch (error) {
      console.error('[SERVER ERROR]', error);
      res.status(500).json({ 
        error: 'Internal server error',
        errorDetails: error.message 
      });
    }
  }
);

// 事件分發器
async function handleEvent(event) {
  // 訊息類型優先判斷
  if (event.type === 'message') {
    return handleMessageEvent(event);
  }
  
  // 其他事件類型處理
  switch(event.type) {
    case 'postback':
      return handlePostback(event);
    case 'follow':
      return handleFollowEvent(event);
    case 'unfollow':
      return handleUnfollowEvent(event);
    default:
      console.warn(`未處理事件類型: ${event.type}`);
      return null;
  }
}

// 強化型訊息處理函數
function handleMessageEvent(event) {
  const { message } = event;
  const text = message.text || '';
  if (text.startsWith('查看商家')) {
    return handleVendorSearch(event);
  }


  // 雙層條件判斷結構
  const handlerMap = {
    text: () => {
      // 嚴格匹配 HelloWorld（區分大小寫）
      if (message.text.trim() === "HelloWorld") {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'helloworld'
        });
      }
      // 其他文字訊息交給原處理流程
      return handleTextMessage(event); 
    },
    // 其他類型保持原處理方式
    image: () => handleImageMessage(event),
    video: () => handleVideoMessage(event),
    audio: () => handleAudioMessage(event),
    location: () => handleLocationMessage(event),
    sticker: () => handleStickerMessage(event)
  };

  // 異常處理封裝
  try {
    return handlerMap[message.type] 
      ? handlerMap[message.type]()
      : client.replyMessage(event.replyToken, {
          type: 'text',
          text: '暫不支援此類型訊息'
        });
  } catch (error) {
    console.error(`💥 訊息處理異常: ${error.message}`);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '伺服器暫時無法處理您的請求'
    });
  }
}


async function handleVendorSearch(event) {
  const fullText = event.message.text;
  const [command, ...keywords] = fullText.split(' ');
  const searchKeyword = keywords.join(' ').trim();

  try {
    // 情境判斷邏輯
    if (keywords.length === 0) {
      // 情境1：顯示所有商家名稱
      const [allVendors] = await db.query(
        `SELECT vendor_name 
         FROM Vendors
         ORDER BY vendor_name 
         LIMIT 50`  // 防止資料量過大
      );

      if (allVendors.length === 0) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '目前尚未有任何商家資料'
        });
      }

      const vendorList = allVendors.map((v, i) => 
        `${i+1}. ${v.vendor_name}`
      ).join('\n');

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `現有合作商家列表（共 ${allVendors.length} 間）：\n\n${vendorList}\n\n可輸入「查看商家 商家名稱」查詢詳細資訊`
      });

    } else {
      // 情境2：搜尋特定商家
      // 輸入安全過濾
      const sanitizedKeyword = searchKeyword.replace(/[%\\]/g, '');

      // 精確度優先查詢
      const [results] = await db.query(
        `SELECT 
          vendor_name, 
          address,
          business_hours,
          contact_phone,
          specialty,
          rating,
          created_at,
          updated_at  
         FROM Vendors 
         WHERE 
           vendor_name = ? 
           OR MATCH(vendor_name, specialty) AGAINST(? IN BOOLEAN MODE)
         ORDER BY 
           CASE WHEN vendor_name = ? THEN 0 ELSE 1 END,
           rating DESC
         LIMIT 1`, // 只取最匹配的一筆資料
        [sanitizedKeyword, sanitizedKeyword, sanitizedKeyword]
      );

      // 結果處理
      if (results.length === 0) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `找不到與「${searchKeyword}」相關的商家，建議：\n1. 檢查輸入名稱\n2. 嘗試簡短關鍵字\n3. 聯繫客服查詢`
        });
      }

      // 結構化訊息模板
      const vendor = results[0];
      const replyText = 
        `🏬 ${vendor.vendor_name}\n` +
        `📍 ${vendor.address}\n` +
        `🕒 ${vendor.business_hours || '未提供'}\n` +
        `☎️ ${vendor.contact_phone}\n` +
        `⭐ 特色：${vendor.specialty}\n` +
        `🌟 評分：${vendor.rating}/5\n` +
        `📅 最後更新：${vendor.updated_at ? new Date(vendor.updated_at).toISOString().split('T')[0] : '無更新紀錄'}`
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `找到以下商家資料：\n\n${replyText}`
      });
    }

  } catch (error) {
    console.error(`商家查詢異常: ${error.message}`);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '查詢服務暫時不可用，工程部搶修中！\n請稍後再試或聯繫客服'
    });
  }
}

  
module.exports = router;
