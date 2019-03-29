
const request = require('superagent');
const http2 = require('http2');

const xml2js = require('xml2js').parseString;
const fs = require('fs');

request
    .get('https://www.jianshu.com/p/ea0c6ce04cd4')
    // .type('xml')
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err);
    });


// let parser = new xml2js.Parser();
//
// fs.readFile('../danmu/test.xml', function(err, data) {
//   parser.parseString(data, function (err, result) {
//     console.log(result);
//     let strings = result.i.d;
//     strings.forEach((item,index) => {
//       console.log(item._);
//     })
//   });
// });

// let writeStream = fs.createWriteStream('../danmu/danmu.xml');
// rp({
//   url: 'https://api.bilibili.com/x/v1/dm/list.so?oid=78328965',
//   headers: {
//     'Content-Type': 'text/xml',
//     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
//     'Accept-Encoding': 'gzip, deflate',
//     'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,la;q=0.7',
//     'Host': 'api.bilibili.com',
//     'Content-Encoding' :'deflate',
//     'Transfer-Encoding' : 'chunked',
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
//   }
// },function (err, response, body) {
//   console.log(body);
// });
// readStream.pipe(writeStream);
// readStream.on('error',function (err) {
//   console.log(err);
// });
// readStream.on('end',function (res) {
//   console.log('下载完成');
// });
// writeStream.on('finish',function (res) {
//   writeStream.end();
//   console.log('写入完成');
// });