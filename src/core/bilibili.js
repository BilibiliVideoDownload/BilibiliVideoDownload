import formatDataTime from '../utlis/formatDataTime'
import formatSeconed from '../utlis/formatSeconed'
import filterTitle from '../utlis/filterTitle'
import randomNum from '../utlis/randomNum'
import sleep from '../utlis/sleep'
import { quality } from '../assets/data/quality'
import UA from '../assets/data/ua'
const got = require('got')

/**
 * @params videoInfo: 当前下载的视频详情 selected：所选的分p quality：所选的清晰度
 * @returns 返回下载数据 Array
 */
const getDownloadList = async (videoInfo, selected, quality) => {
  const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
  const isFolder = window.remote.getGlobal('store').get('setting.isFolder')
  const downloadPath = window.remote.getGlobal('store').get('setting.downloadPath')
  const bfeId = window.remote.getGlobal('store').get('setting.bfe_id') ? window.remote.getGlobal('store').get('setting.bfe_id') : ''
  const config = {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA};bfe_id=${bfeId}`
    }
  }
  const downloadList = []
  for (let index = 0; index < selected.length; index++) {
    const currentPage = selected[index]
    // 请求选中清晰度视频下载地址
    const currentCid = videoInfo.page.find(item => item.page === currentPage).cid
    // 判断当前数据是否有下载地址列表，有则直接用，没有再去请求
    let video = null
    let audio = null
    if (videoInfo.downloadList[currentCid]) {
      video = videoInfo.downloadList[currentCid].video
      audio = videoInfo.downloadList[currentCid].audio
    } else {
      const { body: { data: { dash } }, headers: { 'set-cookie': responseCookies } } = await got(
        `https://api.bilibili.com/x/player/playurl?cid=${currentCid}&bvid=${videoInfo.bvid}&qn=${quality}&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
        {
          ...config,
          responseType: 'json'
        }
      )
      video = dash.video
      audio = dash.audio
      // 保存返回的cookies
      saveResponseCookies(responseCookies)
    }
    let videoTitle = '', videoDuration = '', videoUrl = ''
    if (videoInfo.page.length > 1) {
      videoTitle = `[P${currentPage}]${filterTitle(videoInfo.page.find(item => item.page === currentPage).title)}`
      videoDuration = formatSeconed(videoInfo.page.find(item => item.page === currentPage).duration)
      videoUrl = `${videoInfo.url}?p=${currentPage}`
    } else {
      videoTitle = filterTitle(videoInfo.title)
      videoDuration = videoInfo.duration
      videoUrl = videoInfo.url
    }
    const taskId = `${new Date().getTime()}${randomNum(1000, 9999)}`
    let delDir = []
    if (isFolder) {
      delDir = `${downloadPath}/${videoTitle}-${taskId}/`
    } else {
      delDir.push(`${downloadPath}/${videoTitle}-${taskId}.mp4`, `${downloadPath}/${videoTitle}-${taskId}.png`, `${downloadPath}/${videoTitle}-${taskId}-video.m4s`, `${downloadPath}/${videoTitle}-${taskId}-audio.m4s`)
    }
    const videoData = {
      ...videoInfo,
      id: taskId,
      title: videoTitle,
      quality: quality,
      duration: videoDuration,
      status: 4,
      progress: 0,
      size: null,
      url: videoUrl,
      downloadLink: {
        video: video.find(item => item.id === quality) ? video.find(item => item.id === quality).baseUrl : video[0].baseUrl,
        audio: audio[0].baseUrl
      },
      fileDir: {
        dir: isFolder ? `${downloadPath}/${videoTitle}-${taskId}/` : `${downloadPath}/`,
        file: isFolder ? `${videoTitle}` : `${videoTitle}-${taskId}`,
        delDir: delDir
      }
    }
    console.log(videoData)
    downloadList.push(videoData)
    if (index !== selected.length - 1) {
      await sleep(1000)
    }
  }
  return downloadList
}

/**
 *
 * @returns 保存cookie中的bfe_id
 */
const saveResponseCookies = cookies => {
  if (cookies && cookies.length) {
    const cookiesString = cookies.join(';')
    const setting = window.remote.getGlobal('store').get('setting')
    window.remote.getGlobal('store').set('setting', {
      ...setting,
      bfe_id: cookiesString
    })
  }
}

/**
 *
 * @returns 0: 未登录 1：普通会员 2：大会员
 */
const checkLogin = async () => {
  const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
  const { body } = await got('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`
    },
    responseType: 'json'
  })
  if (!body.data.isLogin) return 0
  if (body.data.isLogin && !body.data.vipStatus) return 1
  if (body.data.isLogin && body.data.vipStatus) return 2
}

const getAcceptQuality = async (cid, bvid) => {
  const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
  const bfeId = window.remote.getGlobal('store').get('setting.bfe_id') ? window.remote.getGlobal('store').get('setting.bfe_id') : ''
  const config = {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA};bfe_id=${bfeId}`
    }
  }
  const { body: { data: { accept_quality, dash: { video, audio } } } } = await got(
    `https://api.bilibili.com/x/player/playurl?cid=${cid}&bvid=${bvid}&qn=127&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
    {
      ...config,
      responseType: 'json'
    }
  )
  return {
    accept_quality,
    video,
    audio
  }
}

const checkUrl = url => {
  const mapUrl = {
    'video/BV': 'BV',
    'play/ss': 'ss',
    'play/ep': 'ep'
  }
  let flag = false
  for (const key in mapUrl) {
    if (url.includes(key)) {
      flag = true
      return mapUrl[key]
    }
  }
  if (!flag) {
    return -1
  }
}

const parseHtml = (html, type, url) => {
  switch (type) {
    case 'BV':
      return parseBV(html, url)
    case 'ss':
      return parseSS(html, url)
    case 'ep':
      return parseEP(html, url)
    default:
      return -1
  }
}

const parseBV = async (html, url) => {
  try {
    const videoInfo = html.match(/\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)/)[1]
    const { videoData } = JSON.parse(videoInfo)
    // 获取视频下载地址
    let acceptQuality = null
    try {
      let downLoadData = html.match(/\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=/)[1]
      downLoadData = JSON.parse(downLoadData)
      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio
      }
    } catch (error) {
      acceptQuality = await getAcceptQuality(videoData.cid, videoData.bvid)
    }
    if (!acceptQuality) {
      acceptQuality = await getAcceptQuality(videoData.cid, videoData.bvid)
    }
    console.log('acceptQuality')
    console.log(acceptQuality)
    const obj = {
      title: videoData.title,
      url,
      bvid: videoData.bvid,
      cid: videoData.cid,
      cover: videoData.pic,
      createdTime: formatDataTime({ isNow: true, rules: 'YYYY-MM-DD HH:mm:ss' }),
      watch: videoData.stat.view,
      danmu: videoData.stat.danmaku,
      comment: videoData.stat.reply,
      duration: formatSeconed(videoData.duration),
      up: videoData.hasOwnProperty('staff') ? videoData.staff.map(item => ({ name: item.name, mid: item.mid })) : [{ name: videoData.owner.name, mid: videoData.owner.mid }],
      qualityOptions: acceptQuality.accept_quality.map(item => ({ label: quality[item], value: item })),
      page: videoData.pages.map(item => ({ title: item.part, page: item.page, duration: item.duration, cid: item.cid })),
      subtitle: videoData.subtitle.list,
      downloadLink: {},
      downloadList: {
        [videoData.cid]: {
          video: acceptQuality.video,
          audio: acceptQuality.audio
        }
      },
      fileDir: {}
    }
    return obj
  } catch (error) {
    console.log(error)
    return -1
  }
}

const parseEP = async (html, url) => {
  try {
    const videoInfo = html.match(/\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/)[1]
    const { h1Title, mediaInfo, epInfo } = JSON.parse(videoInfo)
    const acceptQuality = await getAcceptQuality(epInfo.cid, epInfo.bvid)
    console.log('acceptQuality')
    console.log(acceptQuality)
    const allEps = mediaInfo.episodes
    const duration = allEps.find(item => item.cid === epInfo.cid) ? allEps.find(item => item.cid === epInfo.cid).duration : 0
    const obj = {
      title: h1Title,
      url,
      bvid: epInfo.bvid,
      cid: epInfo.cid,
      cover: `http:${mediaInfo.cover}`,
      createdTime: formatDataTime({ isNow: true, rules: 'YYYY-MM-DD HH:mm:ss' }),
      watch: mediaInfo.stat.views,
      danmu: mediaInfo.stat.danmakus,
      comment: mediaInfo.stat.reply,
      duration: formatSeconed(duration),
      up: [{ name: mediaInfo.upInfo.name, mid: mediaInfo.upInfo.mid }],
      qualityOptions: acceptQuality.accept_quality.map(item => ({ label: quality[item], value: item })),
      page: [{ page: 1, cid: epInfo.cid }],
      subtitle: [],
      downloadLink: {},
      downloadList: {
        [epInfo.cid]: {
          video: acceptQuality.video,
          audio: acceptQuality.audio
        }
      },
      fileDir: {}
    }
    return obj
  } catch (error) {
    console.log(error)
    return -1
  }
}

const parseSS = async html => {
  const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
  const videoInfo = html.match(/\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/)[1]
  const { mediaInfo } = JSON.parse(videoInfo)
  const params = {
    url: `https://www.bilibili.com/bangumi/play/ep${mediaInfo.newestEp.id}`,
    config: {
      headers: {
        'User-Agent': `${UA}`,
        cookie: `SESSDATA=${SESSDATA}`
      }
    }
  }
  try {
    const { body } = await got(params.url, params.config)
    return parseEP(body, params.url)
  } catch (error) {
    console.log(error)
    return -1
  }
}

export {
  checkUrl,
  parseHtml,
  checkLogin,
  getDownloadList
}
