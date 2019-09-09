
const xml = require('./danmu');
const excel = require('./excel');
const excelData = require('./parser');


// https://biliquery.typcn.com/api/user/hash/fa61ffe0

// <d p="107.78600,1,25,16777215,1562155722,0,674b6316,18357183055921156">诺克萨斯</d>
// <d p="161.60300,5,18,15138834,1562161509,0,fa61ffe0,18360216640815108">AD别送</d>
// <d p="190.97900,5,25,15138834,1562161557,0,fa61ffe0,18360242120687618">AD别送</d>
// <d p="205.37900,1,25,16777215,1562170736,0,9318b248,18365054688690178">黑色玫瑰见</d>
// <d p="53.87100,1,25,16777215,1562172618,0,13ba9291,18366041035898882">艾欧尼亚</d>

// 生成弹幕excel
// 弹幕 用户UID 用户名字 用户主页 弹幕原始xml链接
// https://space.bilibili.com/uid/#/
xml.xmlToString('https://api.bilibili.com/x/v1/dm/list.so?oid=72540443').then(res => {
  let data = excelData.parserDanmu(res);
  excel.creatExcel(data);
}).catch(err => {
  console.log(err);
});
