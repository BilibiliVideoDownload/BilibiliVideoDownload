const getUrl = require('./utils/getUrl');
const downloadFile = require('./utils/download');
const concat = require('./utils/concat');
const readlineSync = require('readline-sync');

async function main() {
  let url,quality,qualityAll,downloadUrls,promises;
  url = readlineSync.question('请输入视频URL...');
  qualityAll = await getUrl.getQuality(url);
  quality = readlineSync.keyInSelect(qualityAll,'选择要下载到清晰度？');
  downloadUrls = await getUrl.getDownloadUrl(url,qualityAll[quality]);
  promises = downloadUrls.map((item,index) => {
    return downloadFile.get(item.videoAid,item.videoSize,item.videoLength,item.url,item.videoTitle+'.'+item.videoFormat)
  });
  Promise.all(promises)
    .then(response => {
      let arr = response[0].name.split('.'),
          len = response.length,
          time = 0;
      response.forEach(function (item,index) {
        time += item.time;
      });
      // 合并&转码视频
      concat.cancatVideos(arr[0],arr[1],time,len);
    })
    .catch(err => {
      console.log(err);
    })
}

main();

