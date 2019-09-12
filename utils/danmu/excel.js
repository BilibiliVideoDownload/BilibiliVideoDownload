const Excel = require("exceljs");

const creatExcel = (data,filename) => {
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
      header: '发送时间',
      key: 'time',
      width: 30
    },
    {
      header: '用户主页',
      key: 'uid',
      width: 45,
    }
  ];

/// 根据ID添加值
  data.forEach((item,index) => {
    worksheet.addRow({
      id: index+1,
      danmu: item.danmu,
      time: item.time,
      uid: item.uid
    });
  });

// 直接创建一个Excel表
  workbook.xlsx.writeFile(`./danmu/${filename}.xlsx`).then(function () {
    console.log(`${filename} -- 弹幕下载成功！！！`);
  });
};

module.exports = {
  creatExcel
};