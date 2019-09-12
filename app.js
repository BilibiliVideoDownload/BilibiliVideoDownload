const getUrl = require('./utils/getUrl');
const downloadFile = require('./utils/download');
const concat = require('./utils/concat');
const readlineSync = require('readline-sync');
const xml = require('./utils/danmu/danmu');
const excel = require('./utils/danmu/excel');
const excelData = require('./utils/danmu/parser');

async function main() {
  let aid,isMoreRes,pNum = 1,quality,qualityAll,downloadUrls,promises,isDanmu,cid;
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

  isDanmu = readlineSync.keyInSelect(['是','否'],'是否要下载弹幕？');
  let _title,_author,_allSize = 0,_allduration = 0;
  downloadUrls.forEach((item,index) => {
    _allSize += parseInt(item.videoSize/1048576);
    _allduration += parseInt(item.videoLength/60000);
    if (index === 0){
      _title = item.videoTitle;
      _author = item.author;
      cid = item.cid;
    }
  });
  console.log(getUrl.printVideoInfo(_title,_allSize,_author,_allduration,qualityAll[quality],isDanmu === 0 ? '是' : '否'));

  // 下载弹幕
  if (isDanmu === 0){
    xml.xmlToString('https://api.bilibili.com/x/v1/dm/list.so?oid='+cid).then(res => {
      let data = excelData.parserDanmu(res);
      excel.creatExcel(data,_title);
    }).catch(err => {
      console.log(err);
    });
  }
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

