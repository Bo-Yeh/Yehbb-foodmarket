const { handlePromotions, handleVendors } = require('./botController');
const db = require('../config/db');
const line = require('@line/bot-sdk');

// 初始化LINE客戶端
const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

// Postback事件中央分配器
exports.handlePostback = async (event) => {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');
  
  try {
    switch(action) {
      case 'promotions':
        return await this.handlePromotions(event, data.get('page'));
      case 'vendors':
        return await this.handleVendors(event, data.get('type'));
      case 'transportation':
        return await this.handleTransportation(event);
      case 'favorites':
        return await this.handleFavorites(event);
      default:
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '指令無法識別'
        });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 處理錯誤:`, error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '系統忙碌中，請稍後再試'
    });
  }
};

// 優惠活動處理模組
exports.handlePromotions = async (event, page = 1) => {
  const [promotions] = await db.query(`
    SELECT title, description, vendor_id 
    FROM promotions 
    WHERE expo_id = ?
    LIMIT 5 OFFSET ?
  `, [process.env.EXPO_ID, (page - 1) * 5]);

  return client.replyMessage(event.replyToken, {
    type: 'flex',
    altText: '優惠活動列表',
    contents: {
      type: 'carousel',
      contents: promotions.map(this._buildPromotionBubble)
    }
  });
};

// 商家清單處理模組
exports.handleVendors = async (event, type) => {
  if (type === 'list') {
    const [vendors] = await db.query(`
      SELECT id, name, category 
      FROM vendors 
      WHERE expo_id = ?
    `, [process.env.EXPO_ID]);

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '請選擇商家類別或輸入關鍵字',
      quickReply: {
        items: this._buildVendorQuickReply(vendors)
      }
    });
  }
};

// 私有方法：建構訊息模板
exports._buildPromotionBubble = (promotion) => ({
  type: 'bubble',
  body: {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: promotion.title,
        weight: 'bold',
        size: 'lg'
      },
      {
        type: 'separator',
        margin: 'md'
      },
      {
        type: 'text',
        text: promotion.description,
        wrap: true,
        margin: 'md'
      }
    ]
  }
});

exports._buildVendorQuickReply = (vendors) => {
  const categories = [...new Set(vendors.map(v => v.category))];
  return categories.slice(0, 10).map(category => ({
    type: 'action',
    action: {
      type: 'message',
      label: category,
      text: `類別：${category}`
    }
  }));
};
