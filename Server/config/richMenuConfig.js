const path = require('path');
// const mime = require('mime-types'); // 需先安裝 npm install mime-types

// const imageBuffer = await fs.readFile(imageFullPath);
// const contentType = mime.lookup(imageFullPath) || 'image/png';

// await client.setRichMenuImage(richMenuId, imageBuffer, contentType);
// console.log(`🖼️ 已上傳圖片 (${contentType})`);
module.exports = {
  // 在 config/richMenuConfig.js 添加以下驗證邏輯


  // 統一使用 __dirname 基準路徑 (更穩定)
  imagePath: path.resolve(__dirname, '../assets/richmenu.png'), // 圖片路徑

  template: {
    size: { 
      width: 2500, 
      height: 843  // 修正為LINE全螢幕標準高度
    },
    // selected: true,
    name: "FoodExpoMenu",
    chatBarText: "展覽服務選單",
    areas: [
      // 三欄式佈局 (3欄x2列)
      {
        bounds: { x: 0, y: 0, width: 833, height: 421 }, // 第一欄-上
        action: { 
          type: "postback",
          data: "action=promotions&page=1",
          displayText: "優惠活動"
        }
      },
      {
        bounds: { x: 0, y: 422, width: 833, height: 421 }, // 第一欄-下
        action: {
          type: "postback",
          data: "action=vendors&type=list",
          displayText: "商家清單"
        }
      },
      {
        bounds: { x: 834, y: 0, width: 833, height: 421 }, // 第二欄-上
        action: {
          type: "uri",
          uri: "https://yourapp.com/expo-map",
          label: "展場地圖"  // 新增標籤屬性
        }
      },
      {
        bounds: { x: 834, y: 422, width: 833, height: 421 }, // 第二欄-下
        action: {
          type: "postback",
          data: "action=transportation",
          displayText: "交通方式"
        }
      },
      {
        bounds: { x: 1667, y: 0, width: 833, height: 421 }, // 第三欄-上
        action: {
          type: "postback",
          data: "action=favorites",
          displayText: "我的最愛"
        }
      },
      {
        bounds: { x: 1667, y: 422, width: 833, height: 421 }, // 第三欄-下
        action: {
          type: "message",
          text: "常見問題",
          label: "客服支援"  // 新增標籤屬性
        }
      }
    ]
  }

  
};


// function validateTemplate(template) {
//   const { size, areas } = template;
  
//   // 座標範圍檢查
//   areas.forEach((area, index) => {
//     const { x, y, width, height } = area.bounds;
//     if (x + width > size.width || y + height > size.height) {
//       throw new Error(`區域 ${index} 超出畫布範圍 (x:${x}, y:${y}, w:${width}, h:${height})`);
//     }
//   });

//   // 數值型別檢查
//   if (typeof size.width !== 'number' || typeof size.height !== 'number') {
//     throw new Error('size 必須為數字類型');
//   }
// }

// // 導出前調用驗證
// validateTemplate(template);
