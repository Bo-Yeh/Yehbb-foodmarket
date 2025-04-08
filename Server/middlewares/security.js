const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 基礎安全設定
exports.applyBasicSecurity = (app) => {
  app.use(helmet());
  app.disable('x-powered-by');
};

// API速率限制
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 每個IP限制請求數
  standardHeaders: true,
  legacyHeaders: false
});
