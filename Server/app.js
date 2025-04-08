const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// 路由引入
const lineBotRouter = require('./routes/lineBotRouter');
const discountRouter = require('./routes/discountsRouter');
const exhibitionRouter = require('./routes/exhibitionsRouter');
const faqRouter = require('./routes/faqRouter');
const favoriteRouter = require('./routes/favoritesRouter');
const transactionRouter = require('./routes/transportationRouter');
const vendorRouter = require('./routes/vendorsRouter');
const { applyBasicSecurity, apiLimiter } = require('./middlewares/security');


const app = express();
// 應用安全中間件
applyBasicSecurity(app);

// 中間件調整
app.use('/api', apiLimiter); // 對所有API路由啟用速率限制


// 中間件：僅非 LINE 路由使用 JSON 解析
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/line')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// LINE 路由使用原始請求體
app.use('/api/line', express.raw({ type: 'application/json' }), lineBotRouter);

// 其他路由掛載
app.use('/api/discount', discountRouter);
app.use('/api/exhibition', exhibitionRouter);
app.use('/api/faq', faqRouter);
app.use('/api/favorite', favoriteRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/vendor', vendorRouter);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
