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

const printVideoInfo = (title,size,author,duration,resolution,isDanmu) => {
  let info = `***************视频信息***************
              
视频名称：${title}

视频大小：${size}MB(不准确)

up主：${author}

视频时长：${duration}min

下载清晰度：${resolution}

是否下载弹幕：${isDanmu}

*************视频信息 END**************`;
  return info;
};

const getQualityNumber = str => {
  switch (str) {
	case '高清1080P60(大会员)':
      return 116;
	case '高清1080P+(大会员)':
      return 112;
    case '高清1080P':
      return 80;  
	case '高清720P60(大会员)':
      return 74;
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
      cid = JSON.parse(videoInfo).cid,resArray = [];
  let downloadInfo = await rp({
        uri: `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=116&otype=json`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0',
          'Host': 'api.bilibili.com',
          'Cookie': 'SESSDATA=560f605d%2C1570783582%2C9881e691'
        }
      }),
      quality = JSON.parse(downloadInfo).data.accept_quality;
  console.log(JSON.parse(downloadInfo).data.quality);
  quality.forEach(function (item,index) {
    switch (item) {
      case 116:
        resArray.push('高清1080P60(大会员)');
		break;
      case 112:
        resArray.push('高清1080P+(大会员)');
		break;
      case 80:
        resArray.push('高清1080P');
		break;
      case 74:
        resArray.push('高清720P60(大会员)');
		break;
      case 64:
        resArray.push('高清720P');
		break;
      case 32:
        resArray.push('清晰480P');
		break;
      case 16:
        resArray.push('流畅360P');
		break;
      default:
        resArray.push('获取视频清晰度错误!!!');
		break;
    }
  });
  return resArray;
};

const getDownloadUrl = async (pNum,aid,quality) => {
  console.log(quality);
  let qualityNum = getQualityNumber(quality),
      videoInfo = await rp(`https://api.bilibili.com/x/web-interface/view?aid=${aid}`),
      cid = JSON.parse(videoInfo).data.cid,
      author = JSON.parse(videoInfo).data.owner.name,
      title = filterSpecialStr(JSON.parse(videoInfo).data.title);
  console.log(qualityNum);
  let downloadInfo = await rp({
        uri: `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=${qualityNum}&otype=json`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0',
          'Host': 'api.bilibili.com',
          'Cookie': 'SESSDATA=560f605d%2C1570783582%2C9881e691'
        }
      }),
      downloadInfoPares = JSON.parse(downloadInfo),
      videoFormat = downloadInfoPares.data.format,
      dUrlArr = downloadInfoPares.data.durl,durl = [];
  
  
  dUrlArr.forEach(function (item,index) {
    let obj = {};
    obj.videoAid = aid;
    obj.videoTitle = `[p${pNum}]${title}-${index}`;
    obj.author = author;
    obj.cid = cid;
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
  isMore: isMore,
  printVideoInfo: printVideoInfo
}