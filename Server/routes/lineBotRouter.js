const express = require("express");
const line = require('@line/bot-sdk');
const router = express.Router();

// 檢查環境變數是否設定
if (!process.env.LINE_CHANNEL_SECRET || !process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  throw new Error("Environment variables LINE_CHANNEL_SECRET and LINE_CHANNEL_ACCESS_TOKEN must be set.");
}

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(config);

// 處理 Webhook 請求
router.post('/webhook', line.middleware(config), (req, res) => {
  if (Array.isArray(req.body.events)) {
    Promise.all(req.body.events.map(handleEvent))
      .then((result) => res.status(200).json(result))
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  } else {
    res.status(400).json({ error: "Invalid request body: 'events' must be an array." });
  }
});

// 處理事件
function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'Hello, you said: ' + event.message.text,
    }).catch((err) => {
      console.error('Error replying to message:', err);
      throw err; // 重新拋出錯誤以便外部處理
    });
  }
  return Promise.resolve(null);
}

module.exports = router;
