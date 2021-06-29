import formatDataTime from '../utlis/formatDataTime'
import formatSeconed from '../utlis/formatSeconed'
import { quality } from '../assets/data/quality'
import UA from '../assets/data/ua'
const got = require('got')

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
  console.log(SESSDATA)
  console.log(body)
  if (!body.data.isLogin) return 0
  if (body.data.isLogin && !body.data.vipStatus) return 1
  if (body.data.isLogin && body.data.vipStatus) return 2
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

const parseBV = (html, url) => {
  return new Promise((resolve, reject) => {
    try {
      const downloadInfo = html.match(/\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=/)[1]
      const videoInfo = html.match(/\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)/)[1]
      const { data } = JSON.parse(downloadInfo)
      const { videoData } = JSON.parse(videoInfo)
      console.log('parseBV')
      console.log(data)
      console.log(videoData)
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
        qualityOptions: data.accept_quality.map(item => ({ label: quality[item], value: item })),
        page: videoData.pages.map(item => ({ title: item.part, page: item.page, duration: item.duration, cid: item.cid })),
        subtitle: videoData.subtitle.list,
        downloadPath: {}
      }
      resolve(obj)
    } catch (error) {
      console.log(error)
      const err = -1
      reject(err)
    }
  })
}

const parseEP = (html, url) => {
  return new Promise((resolve, reject) => {
    try {
      const downloadInfo = html.match(/\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_BILI\_CONFIG\_\_\=\{\"show_bv\"\:true\}/)[1]
      const videoInfo = html.match(/\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/)[1]
      const { data } = JSON.parse(downloadInfo)
      const { h1Title, mediaInfo, epInfo } = JSON.parse(videoInfo)
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
        duration: formatSeconed(data.dash.duration),
        up: [{ name: mediaInfo.upInfo.name, mid: mediaInfo.upInfo.mid }],
        qualityOptions: data.accept_quality.map(item => ({ label: quality[item], value: item })),
        page: [],
        subtitle: [],
        downloadPath: {}
      }
      resolve(obj)
    } catch (error) {
      console.log(error)
      const err = -1
      reject(err)
    }
  })
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
  checkLogin
}
