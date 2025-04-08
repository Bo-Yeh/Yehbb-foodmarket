const line = require('@line/bot-sdk');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/richMenuConfig.js');
const { channel } = require('diagnostics_channel');

// 必須先載入環境變數
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 初始化 LINE 客戶端
const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  log: {
    info: (...args) => console.log('[LINE-SDK]', ...args),
    error: (...args) => console.error('[LINE-SDK]', ...args)
  }
});

// 封裝部署流程
async function deployRichMenu() {
  console.log('當前環境變數:', {
    token: process.env.LINE_CHANNEL_ACCESS_TOKEN?.substring(0, 6) + '...'
  });

  try {
    // 新增路徑驗證
    const imageFullPath = path.resolve(process.cwd(), config.imagePath);
    console.log('🔄 嘗試讀取文件:', imageFullPath);
    
    // 強化 API 響應處理
    console.log('📤 發送 RichMenu 模板:', JSON.stringify(config.template, null, 2));
    const richMenu = await client.createRichMenu(config.template)
      .then(res => {
        console.log('📥 LINE API 響應:', res);
        return res;
      })
      .catch(error => {
        console.error('❌ 完整錯誤詳情:', {
          headers: error.originalError?.config?.headers,
          data: error.originalError?.config?.data
        });
        throw error;
      });
    const richMenuId = richMenu.richMenuId;

    console.log(`🆔 新選單ID: ${richMenuId}`);

    // 新增文件存在性檢查
    try {
      await fs.access(imageFullPath, fs.constants.R_OK);
    } catch (accessError) {
      throw new Error(`文件不可讀: ${imageFullPath} (${accessError.code})`);
    }

    const imageBuffer = await fs.readFile(imageFullPath);
    await client.setRichMenuImage(richMenuId, imageBuffer, {
      headers: { 'Content-Type': 'image/png' }
    });

    await client.setDefaultRichMenu(richMenuId);
    console.log('✅ 圖文選單部署完成');

  } catch (error) {
    console.error('❌ 完整錯誤追蹤:', {
      message: error.message,
      stack: error.stack.split('\n').slice(0,3).join('\n'), // 精簡堆疊
      systemPath: error.path || undefined,
      apiResponse: error.originalError?.response?.data || undefined
    });
    process.exit(1);
  }
}


// 自執行 async 函數
(async () => {
  try {
    await deployRichMenu();
  } catch (finalError) {
    process.exit(1);
  }
})();
