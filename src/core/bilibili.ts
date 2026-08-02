import UA from '../assets/data/ua'
import { formatSeconed, filterTitle, sleep } from '../utils'
import { qualityMap } from '../assets/data/quality'
import { customAlphabet } from 'nanoid'
import alphabet from '../assets/data/alphabet'
import { VideoData, Page, DownloadUrl, Subtitle, TaskData, Audio } from '../type'
import { store, pinia } from '../store'

// 自定义uuid
const nanoid = customAlphabet(alphabet, 16)

/**
 * @params videoInfo: 当前下载的视频详情 selected：所选的分p quality：所选的清晰度
 * @returns 返回下载数据 Array
 */
const getDownloadList = async (videoInfo: VideoData, selected: number[], quality: number) => {
  const downloadList: VideoData[] = []
  for (let index = 0; index < selected.length; index++) {
    const currentPage = selected[index]
    // 请求选中清晰度视频下载地址
    const currentPageData = videoInfo.page.find(item => item.page === currentPage)
    if (!currentPageData) throw new Error('获取视频下载地址错误')
    const currentCid = currentPageData.cid
    const currentBvid = currentPageData.bvid
    // 获取下载地址
    // 判断当前数据是否有下载地址列表，有则直接用，没有再去请求
    const downloadUrl: DownloadUrl = { video: '', audio: '' }
    const videoUrl = videoInfo.video.find(item => item.id === quality && item.cid === currentCid)
    const audioUrl = getHighQualityAudio(videoInfo.audio)
    if (videoUrl && audioUrl) {
      downloadUrl.video = videoUrl.url
      downloadUrl.audio = audioUrl.url
    } else {
      const { video, audio } = await getDownloadUrl(currentCid, currentBvid, quality)
      downloadUrl.video = video
      downloadUrl.audio = audio
    }
    // 获取字幕地址
    const subtitle = await getSubtitle(currentCid, currentBvid)
    const taskId = nanoid()
    const videoData: VideoData = {
      ...videoInfo,
      id: taskId,
      title: currentPageData.title,
      url: currentPageData.url,
      quality: quality,
      duration: currentPageData.duration,
      createdTime: +new Date(),
      cid: currentCid,
      bvid: currentBvid,
      downloadUrl,
      filePathList: handleFilePathList(selected.length === 1 ? 0 : currentPage, currentPageData.title, videoInfo.up[0].name, currentBvid, taskId),
      fileDir: handleFileDir(selected.length === 1 ? 0 : currentPage, currentPageData.title, videoInfo.up[0].name, currentBvid, taskId),
      subtitle
    }
    downloadList.push(videoData)
    if (index !== selected.length - 1) {
      await sleep(1000)
    }
  }
  return downloadList
}

const addDownload = (videoList: VideoData[] | TaskData[]) => {
  const allowDownloadCount = store.settingStore(pinia).downloadingMaxSize - store.baseStore(pinia).downloadingTaskCount
  const taskList: TaskData[] = []
  if (allowDownloadCount >= 0) {
    videoList.forEach((item, index) => {
      if (index < allowDownloadCount) {
        taskList.push({
          ...item,
          status: 1,
          progress: 0
        })
      } else {
        taskList.push({
          ...item,
          status: 4,
          progress: 0
        })
      }
    })
  }
  return taskList
}

/**
 *
 * @returns 保存cookie中的bfe_id
 */
const saveResponseCookies = (cookies: string[]) => {
  if (cookies && cookies.length) {
    const cookiesString = cookies.join(';')
    console.log('bfe: ', cookiesString)
    store.settingStore(pinia).setBfeId(cookiesString)
  }
}

/**
 *
 * @returns 0: 游客，未登录 1：普通用户 2：大会员
 */
// ============ wbi 签名 + buvid3 抗风控（规避 B站 412 风控）============
// wbi 混淆表（B站公开固定表）
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 22, 1, 30, 11, 8, 3, 43, 12, 52, 57, 13, 62, 29, 55,
  61, 8, 9, 60, 14, 41, 53, 24, 19, 19, 53, 61, 26, 39, 50, 25,
  15, 9, 7, 4, 6, 36, 33, 28, 22, 51, 14, 44, 49, 35, 16, 46
]
// 缓存 wbi mixin_key 与 buvid3，避免每次请求重复拉取
let wbiMixinKeyCache: string | null = null
let buvid3Cache: string | null = null

// 构造完整浏览器请求头 + 抗风控 cookie（buvid3 是 B站反爬关键指纹）
const buildHeaders = (sessdata?: string): any => {
  const SESSDATA = sessdata !== undefined ? sessdata : store.settingStore(pinia).SESSDATA
  const bfeId = store.settingStore(pinia).bfeId
  let cookie = `SESSDATA=${SESSDATA};bfe_id=${bfeId}`
  if (buvid3Cache) cookie += `;buvid3=${buvid3Cache}`
  return {
    'User-Agent': `${UA}`,
    Referer: 'https://www.bilibili.com/',
    Origin: 'https://www.bilibili.com',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    cookie
  }
}

// 获取 buvid3（finger/spi 接口，B站反爬关键指纹）
const ensureBuvid3 = async (): Promise<void> => {
  if (buvid3Cache) return
  // 参考 yt-dlp：本地生成 buvid3（uuid4 + 'infoc'），不依赖 finger/spi（该接口在风控环境也 412，且其下发的 buvid3 可能被标记）
  const hex = '0123456789abcdef'
  let u = ''
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) u += '-'
    else if (i === 14) u += '4'
    else if (i === 19) u += hex[8 + Math.floor(Math.random() * 4)]
    else u += hex[Math.floor(Math.random() * 16)]
  }
  buvid3Cache = u + 'infoc'
}

// 获取 wbi mixin_key（nav 接口的 wbi_img）
const ensureWbiMixinKey = async (): Promise<string> => {
  if (wbiMixinKeyCache) return wbiMixinKeyCache
  const { body } = await window.electron.got('https://api.bilibili.com/x/web-interface/nav', {
    headers: buildHeaders(),
    responseType: 'json'
  })
  if (body.code !== 0 || !body.data || !body.data.wbi_img) throw new Error('获取 wbi 密钥失败')
  const imgKey = body.data.wbi_img.img_url.split('/').pop()!.split('.')[0]
  const subKey = body.data.wbi_img.sub_url.split('/').pop()!.split('.')[0]
  const raw = imgKey + subKey
  let mixinKey = ''
  for (const i of MIXIN_KEY_ENC_TAB) {
    mixinKey += raw[i]
  }
  wbiMixinKeyCache = mixinKey.slice(0, 32)
  return wbiMixinKeyCache
}

// 生成 B站 playurl 反风控设备指纹参数（参考 yt-dlp _dm_params，源自 bili-user-fingerprint.min.js）
const PRINTABLE = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ \t\n\r\x0b\x0c'
const genDmParams = (): Record<string, string> => {
  const randStr = (min: number, max: number) => {
    const k = Math.floor(Math.random() * (max - min + 1)) + min
    let s = ''
    for (let i = 0; i < k; i++) s += PRINTABLE[Math.floor(Math.random() * PRINTABLE.length)]
    return s
  }
  const b64 = (min: number, max: number) => btoa(randStr(min, max)).slice(0, -2)
  const rnd114 = () => Math.floor(114 * Math.random())
  const rnd514 = () => Math.floor(514 * Math.random())
  const wh = [2 * 1920 + 2 * 1080 + 3 * rnd114(), 4 * 1920 - 1080 + rnd114(), rnd114()]
  const ofRnd = Math.floor(Math.random() * 101)
  const of = [3 * ofRnd + rnd514(), 4 * ofRnd + 2 * rnd514(), rnd514()]
  return {
    dm_img_list: '[]',
    dm_img_str: b64(16, 64),
    dm_cover_img_str: b64(32, 128),
    dm_img_inter: JSON.stringify({ ds: [], wh, of })
  }
}

// 对请求参数做 wbi 签名，返回带 wts + w_rid 的完整 query string
const encWbi = async (params: Record<string, any>): Promise<string> => {
  const mixinKey = await ensureWbiMixinKey()
  const signed: Record<string, string> = {}
  for (const k of Object.keys(params)) {
    // 过滤 wbi 不支持的字符
    signed[k] = String(params[k]).replace(/[!'()*]/g, '')
  }
  signed.wts = String(Math.floor(Date.now() / 1000))
  const keys = Object.keys(signed).sort()
  const query = keys.map(k => `${k}=${encodeURIComponent(signed[k])}`).join('&')
  const wRid = await window.electron.md5(query + mixinKey)
  return `${query}&w_rid=${wRid}`
}

const checkLogin = async (SESSDATA: string) => {
  await ensureBuvid3()
  const { body } = await window.electron.got('https://api.bilibili.com/x/web-interface/nav', {
    headers: buildHeaders(SESSDATA),
    responseType: 'json'
  })
  if (body.data.isLogin && !body.data.vipStatus) {
    return 1
  } else if (body.data.isLogin && body.data.vipStatus) {
    return 2
  } else {
    return 0
  }
}

// 检查url合法
const checkUrl = (url: string) => {
  const mapUrl = {
    'video/av': 'BV',
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
    return ''
  }
}

// 检查url是否有重定向
const checkUrlRedirect = async (videoUrl: string) => {
  await ensureBuvid3()
  try {
    const { body, redirectUrls } = await window.electron.got(videoUrl, {
      headers: buildHeaders()
    })
    const url = redirectUrls[0] ? redirectUrls[0] : videoUrl
    return { body, url }
  } catch (e: any) {
    // 网页请求被风控(412)时降级：parseBV 只需从 url 提取 BV，不依赖 body
    return { body: '', url: videoUrl }
  }
}

const parseHtml = (html: string, type: string, url: string) => {
  switch (type) {
    case 'BV':
      return parseBV(html, url)
    case 'ss':
      return parseSS(html)
    case 'ep':
      return parseEP(html, url)
    default:
      return -1
  }
}

// 从url中提取BV号或av号
const extractVideoId = (url: string): { bvid?: string, aid?: string } => {
  const bvMatch = url.match(/\/(BV[a-zA-Z0-9]{10})/)
  if (bvMatch) return { bvid: bvMatch[1] }
  const avMatch = url.match(/\/av(\d+)/i)
  if (avMatch) return { aid: avMatch[1] }
  return {}
}

// 通过官方API获取视频信息
// 不再依赖网页HTML中的__INITIAL_STATE__解析，规避B站改版/风控导致的解析失败
const getViewInfo = async (bvid?: string, aid?: string): Promise<any> => {
  await ensureBuvid3()
  const params = bvid ? { bvid } : { aid }
  const query = await encWbi(params as Record<string, any>)
  const { body, headers: { 'set-cookie': responseCookies } } = await window.electron.got(
    `https://api.bilibili.com/x/web-interface/view?${query}`,
    { headers: buildHeaders(), responseType: 'json' }
  )
  if (body.code !== 0) throw new Error(`获取视频信息失败: ${body.message}`)
  // 保存返回的cookies
  saveResponseCookies(responseCookies)
  return body.data
}

const parseBV = async (_html: string, url: string) => {
  try {
    // 从url提取BV/av号，调用官方API获取视频信息（不再解析HTML）
    const { bvid, aid } = extractVideoId(url)
    if (!bvid && !aid) throw new Error('parse bv error')
    const data: any = await getViewInfo(bvid, aid)
    // 获取视频下载地址
    const acceptQuality = await getAcceptQuality(data.cid, data.bvid)
    const obj: VideoData = {
      id: '',
      title: data.title,
      url,
      bvid: data.bvid,
      cid: data.cid,
      cover: data.pic,
      createdTime: -1,
      quality: -1,
      view: data.stat.view,
      danmaku: data.stat.danmaku,
      reply: data.stat.reply,
      duration: formatSeconed(data.duration),
      up: data.hasOwnProperty('staff') ? data.staff.map((item: any) => ({ name: item.name, mid: item.mid })) : [{ name: data.owner.name, mid: data.owner.mid }],
      qualityOptions: acceptQuality.accept_quality.map((item: any) => ({ label: qualityMap[item], value: item })),
      page: parseBVPageData({ bvid: data.bvid, title: data.title, pages: data.pages }, url),
      subtitle: [],
      video: acceptQuality.video ? acceptQuality.video.map((item: any) => ({ id: item.id, cid: data.cid, url: item.baseUrl })) : [],
      audio: acceptQuality.audio ? acceptQuality.audio.map((item: any) => ({ id: item.id, cid: data.cid, url: item.baseUrl })) : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' }
    }
    console.log('bv')
    console.log(obj)
    return obj
  } catch (error: any) {
    throw new Error(error)
  }
}

const parseEP = async (html: string, url: string) => {
  try {
    const videoInfo = html.match(/\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/)
    if (!videoInfo) throw new Error('parse ep error')
    const { h1Title, mediaInfo, epInfo, epList } = JSON.parse(videoInfo[1])
    // 获取视频下载地址
    let acceptQuality = null
    try {
      let downLoadData: any = html.match(/\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=/)
      if (!downLoadData) throw new Error('parse ep error')
      downLoadData = JSON.parse(downLoadData[1])
      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio
      }
    } catch (error) {
      acceptQuality = await getAcceptQuality(epInfo.cid, epInfo.bvid)
    }
    const obj: VideoData = {
      id: '',
      title: h1Title,
      url,
      bvid: epInfo.bvid,
      cid: epInfo.cid,
      cover: `http:${mediaInfo.cover}`,
      createdTime: -1,
      quality: -1,
      view: mediaInfo.stat.views,
      danmaku: mediaInfo.stat.danmakus,
      reply: mediaInfo.stat.reply,
      duration: formatSeconed(epInfo.duration / 1000),
      up: [{ name: mediaInfo.upInfo.name, mid: mediaInfo.upInfo.mid }],
      qualityOptions: acceptQuality.accept_quality.map((item: any) => ({ label: qualityMap[item], value: item })),
      page: parseEPPageData(epList),
      subtitle: [],
      video: acceptQuality.video ? acceptQuality.video.map((item: any) => ({ id: item.id, cid: epInfo.cid, url: item.baseUrl })) : [],
      audio: acceptQuality.audio ? acceptQuality.audio.map((item: any) => ({ id: item.id, cid: epInfo.cid, url: item.baseUrl })) : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' }
    }
    console.log('ep')
    console.log(obj)
    return obj
  } catch (error: any) {
    throw new Error(error)
  }
}

const parseSS = async (html: string) => {
  try {
    const videoInfo = html.match(/\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/)
    if (!videoInfo) throw new Error('parse ss error')
    const { mediaInfo } = JSON.parse(videoInfo[1])
    const params = {
      url: `https://www.bilibili.com/bangumi/play/ep${mediaInfo.newestEp.id}`,
      config: {
        headers: {
          'User-Agent': `${UA}`,
          cookie: `SESSDATA=${store.settingStore(pinia).SESSDATA}`
        }
      }
    }
    const { body } = await window.electron.got(params.url, params.config)
    return parseEP(body, params.url)
  } catch (error: any) {
    throw new Error(error)
  }
}

// 调用 yt-dlp 获取视频流信息（绕过 got 库请求 playurl 时的 TLS 指纹风控）
const getYtdlpFormats = async (bvid: string): Promise<{ accept_quality: number[], video: any[], audio: any[] }> => {
  const sessdata = store.settingStore(pinia).SESSDATA
  const url = `https://www.bilibili.com/video/${bvid}`
  const info: any = await window.electron.ytdlpInfo(url, sessdata)
  const formats: any[] = info.formats || []
  // video 流：按 quality 分组，avc1(H.264 兼容性最好) 优先于 hev1
  const videoMap = new Map<number, any>()
  for (const f of formats) {
    if (f.vcodec && f.vcodec !== 'none' && f.quality) {
      const q = f.quality
      const exist = videoMap.get(q)
      if (!exist || (f.vcodec.startsWith('avc1') && !exist.vcodec.startsWith('avc1'))) {
        videoMap.set(q, f)
      }
    }
  }
  const video = Array.from(videoMap.values()).map((f: any) => ({ id: f.quality, baseUrl: f.url }))
  // audio 流：format_id 越大码率越高（getHighQualityAudio 按 id 降序取最高）
  const audio = formats
    .filter((f: any) => f.acodec && f.acodec !== 'none')
    .map((f: any) => ({ id: parseInt(f.format_id) || 0, baseUrl: f.url }))
    .sort((a: any, b: any) => b.id - a.id)
  const accept_quality = Array.from(videoMap.keys()).sort((a: number, b: number) => b - a)
  return { accept_quality, video, audio }
}

// 获取视频清晰度列表（改用 yt-dlp，规避 playurl 的 got TLS 风控 412）
const getAcceptQuality = async (cid: string, bvid: string) => {
  return getYtdlpFormats(bvid)
}

// 获取指定清晰度视频下载地址
const getDownloadUrl = async (cid: number, bvid: string, quality: number) => {
  await ensureBuvid3()
  const query = await encWbi({ cid, bvid, qn: quality, fourk: 1, fnver: 0, fnval: 4048, ...genDmParams() })
  const { body: { data: { dash } }, headers: { 'set-cookie': responseCookies } } = await window.electron.got(
    `https://api.bilibili.com/x/player/wbi/playurl?${query}`,
    { headers: buildHeaders(), responseType: 'json' }
  )
  // 保存返回的cookies
  saveResponseCookies(responseCookies)
  return {
    video: dash.video.find((item: any) => item.id === quality) ? dash.video.find((item: any) => item.id === quality).baseUrl : dash.video[0].baseUrl,
    audio: getHighQualityAudio(dash.audio).baseUrl
  }
}

// 获取视频字幕
const getSubtitle = async (cid: number, bvid: string) => {
  await ensureBuvid3()
  const { body: { data: { subtitle } } } = await window.electron.got(
    `https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${bvid}`,
    { headers: buildHeaders(), responseType: 'json' }
  )
  const subtitleList: Subtitle[] = subtitle.subtitles ? subtitle.subtitles.map((item: any) => ({ title: item.lan_doc, url: item.subtitle_url })) : []
  return subtitleList
}

// 处理filePathList
const handleFilePathList = (page: number, title: string, up: string, bvid: string, id: string): string[] => {
  const downloadPath = store.settingStore().downloadPath
  const name = `${!page ? '' : `[P${page}]`}${filterTitle(`${title}-${up}-${bvid}-${id}`)}`
  const isFolder = store.settingStore().isFolder
  return [
    `${downloadPath}/${isFolder ? `${name}/` : ''}${name}.mp4`,
    `${downloadPath}/${isFolder ? `${name}/` : ''}${name}.png`,
    `${downloadPath}/${isFolder ? `${name}/` : ''}${name}-video.m4s`,
    `${downloadPath}/${isFolder ? `${name}/` : ''}${name}-audio.m4s`,
    isFolder ? `${downloadPath}/${name}/` : ''
  ]
}

// 处理fileDir
const handleFileDir = (page: number, title: string, up: string, bvid: string, id: string): string => {
  const downloadPath = store.settingStore().downloadPath
  const name = `${!page ? '' : `[P${page}]`}${filterTitle(`${title}-${up}-${bvid}-${id}`)}`
  const isFolder = store.settingStore().isFolder
  return `${downloadPath}${isFolder ? `/${name}/` : ''}`
}

// 处理bv多p逻辑
const parseBVPageData = ({ bvid, title, pages }: { bvid: string, title: string, pages: any[] }, url: string): Page[] => {
  const len = pages.length
  if (len === 1) {
    return [
      {
        title,
        url,
        page: pages[0].page,
        duration: formatSeconed(pages[0].duration),
        cid: pages[0].cid,
        bvid: bvid
      }
    ]
  } else {
    return pages.map(item => ({
      title: item.part,
      page: item.page,
      duration: formatSeconed(item.duration),
      cid: item.cid,
      bvid: bvid,
      url: `${url}?p=${item.page}`
    }))
  }
}

// 处理ep多p逻辑
const parseEPPageData = (epList: any[]): Page[] => {
  return epList.map((item, index) => ({
    title: item.share_copy,
    page: index + 1,
    duration: formatSeconed(item.duration / 1000),
    cid: item.cid,
    bvid: item.bvid,
    url: item.share_url
  }))
}

// 获取码率最高的audio
const getHighQualityAudio = (audioArray: any[]) => {
  return audioArray.sort((a, b) => b.id - a.id)[0]
}

export {
  checkLogin,
  checkUrl,
  checkUrlRedirect,
  parseHtml,
  getDownloadList,
  addDownload
}
