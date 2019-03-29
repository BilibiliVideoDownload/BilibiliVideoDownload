const getUrl = require('./utils/getUrl');
const downloadFile = require('./utils/download');
const concat = require('./utils/concat');
const readlineSync = require('readline-sync');

async function main() {
  let aid,isMoreRes,pNum = 1,quality,qualityAll,downloadUrls,promises;
  aid = readlineSync.question('请输入av号...');

  // 检查是否是多P
  isMoreRes = await getUrl.isMore(aid);
  if(isMoreRes.cid){
    // 多P
    console.log('这是个多P视频\n');
    pNum = readlineSync.question('请输入你要下载的分P号...');
  }else{
    // 单P
    console.log('这是个单P视频');
  }
  qualityAll = await getUrl.getQuality(aid,pNum);
  quality = readlineSync.keyInSelect(qualityAll,'选择要下载到清晰度？');
  downloadUrls = await getUrl.getDownloadUrl(pNum,aid,qualityAll[quality]);
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

