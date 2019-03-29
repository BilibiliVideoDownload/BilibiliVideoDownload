const rp = require('request-promise');

const isMore = async aid => {
  let res = await rp(`http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id=${aid}&page=2`);
  return {
    cid: JSON.parse(res).cid,
    title: JSON.parse(res).title
  }
}

const parseFormat = format => {
  let str = format.replace(/[0-9]/g,'');
  return str;
}

const filterSpecialStr = str => {
  let str1 = str.replace(/\//g,'');
  return str1;
}

const getQualityNumber = str => {
  switch (str) {
    case '高清1080P':
      return 80;
    case '高清720P':
      return 64;
    case '清晰480P':
      return 32;
    case '流畅360P':
      return 16;
    default:
      return '获取视频清晰度错误!!!';
  }
}

const getQuality = async (aid,pNum) => {
  let videoInfo = await rp(`http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id=${aid}&page=${pNum}`),
      cid = JSON.parse(videoInfo).cid;
  let downloadInfo = await rp({
        uri: `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=80&otype=json`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0',
          'Host': 'api.bilibili.com',
          'Cookie': 'SESSDATA=bd125cdd%2C1554519358%2C6d4df231'
        }
      }),
      quality = JSON.parse(downloadInfo).data.quality;
  switch (quality) {
    case 80:
      return ['高清1080P','高清720P','清晰480P','流畅360P'];
    case 64:
      return ['高清720P','清晰480P','流畅360P'];
    case 32:
      return ['清晰480P','流畅360P'];
    case 16:
      return ['流畅360P'];
    default:
      return '获取视频清晰度错误!!!';
  }

};

const getDownloadUrl = async (pNum,aid,quality) => {
  let qualityNum = getQualityNumber(quality),
      videoInfo = await rp(`https://api.bilibili.com/x/web-interface/view?aid=${aid}`),
      cid = JSON.parse(videoInfo).data.cid,
      title = filterSpecialStr(JSON.parse(videoInfo).data.title);
  let downloadInfo = await rp({
        uri: `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=${qualityNum}&otype=json`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0',
          'Host': 'api.bilibili.com',
          'Cookie': 'SESSDATA=bd125cdd%2C1554519358%2C6d4df231'
        }
      }),
      downloadInfoPares = JSON.parse(downloadInfo),
      videoFormat = downloadInfoPares.data.format,
      dUrlArr = downloadInfoPares.data.durl,durl = [];
  
  
  dUrlArr.forEach(function (item,index) {
    let obj = {};
    obj.videoAid = aid;
    obj.videoTitle = `[p${pNum}]${title}-${index}`;
    obj.videoLength = item.length;
    obj.videoSize = item.size;
    obj.videoFormat = parseFormat(videoFormat);
    obj.url = item.url;
    durl.push(obj);
  });
  return durl;
};

module.exports = {
  getQuality: getQuality,
  getDownloadUrl: getDownloadUrl,
  isMore: isMore
}