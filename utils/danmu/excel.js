const Excel = require("exceljs");

const creatExcel = data => {
  let workbook = new Excel.Workbook();
// 标签创建
  let worksheet = workbook.addWorksheet("第一个标签");
// 设置列
  worksheet.columns = [
    {
      header: '序号',
      key: 'id',
      width: 5
    },
    {
      header: '弹幕',
      key: 'danmu',
      width: 45
    },
    {
      header: '用户UID',
      key: 'uid',
      width: 45,
    }
  ];

/// 根据ID添加值
  data.forEach((item,index) => {
    worksheet.addRow({
      id: index+1,
      danmu: item.danmu,
      uid: item.uid
    });
  });

// 直接创建一个Excel表
  workbook.xlsx.writeFile("12345.xlsx").then(function () {
    console.log("saved");
  });
};

module.exports = {
  creatExcel
};