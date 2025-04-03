const handleEvent = (event) => {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      let replyMessage = "";
  
      // 根據用戶訊息處理邏輯
      if (userMessage.includes("!優惠活動")) {
        replyMessage = "這是優惠活動的內容！";
      } else if (userMessage.includes("!商家清單")) {
        replyMessage = "這是商家清單的內容！";
      } else {
        replyMessage = "請輸入有效的指令！";
      }
  
      // 回覆訊息
      replyMessage(replyMessage, event.replyToken);
    }
  };
  
  const replyMessage = (text, replyToken) => {
    axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: replyToken,
        messages: [{ type: "text", text: text }],
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  };
  
  module.exports = { handleEvent };
  