
const rp = require('request');
const fs = require('fs');
const progress = require('progress-stream');
const ProgressBar  = require('../progress-bar');


function downloadFile(aid,totalSize,totalTime,uri,filename){
  return new Promise(function (resolve, reject) {
    let pb = new ProgressBar('下载进度', 50);
    let str = progress({
      time: 1000
    });
    str.on('progress', function(progress) {
      pb.render({
        completed: progress.transferred ? progress.transferred : 0,
        total: totalSize
      });
    });
    let writeStream = fs.createWriteStream('./video/' + filename);
    let readStream = rp({
      url: uri,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Range': 'bytes=0-',
        'Referer': 'http://www.bilibili.com/video/av'+ aid +'/',
        'Origin': 'https://www.bilibili.com',
        'Connection': 'keep-alive'
      }
    });
    readStream.pipe(str).pipe(writeStream);
    readStream.on('error',function (err) {
      reject(err)
    });
    readStream.on('end',function (err) {
      console.log('\n' + filename + '下载完成');
    });
    writeStream.on('finish',function (err) {
      writeStream.end();
      resolve({
        name: filename,
        time: totalTime
      });
    });
  })
}

module.exports = {
  get: downloadFile
};