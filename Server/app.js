const express = require("express");
const bodyParser = require("body-parser");
const db = require("./config/db"); // 引入 db.js 的資料庫連接
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// LINE Bot 設定
const LINE_CHANNEL_ACCESS_TOKEN = "您的 LINE Channel Access Token";
const LINE_CHANNEL_SECRET = "您的 LINE Channel Secret";

// 基本路由
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Webhook 路由
app.post("/callback", (req, res) => {
  const signature = req.headers["x-line-signature"];
  const body = req.body;

  // 驗證簽章
  if (!validateSignature(body, signature)) {
    return res.status(400).send("Invalid signature");
  }

  // 處理事件
  handleEvent(body.events[0]);
  res.status(200).send("OK");
});

// 啟動伺服器
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
