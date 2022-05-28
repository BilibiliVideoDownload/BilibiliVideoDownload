const fs = require('fs/promises')
const got = require('got')
import lodash from 'lodash'
import { ascendingSort } from './utils/sort'
import { decodeDanmakuSegment, decodeDanmakuView } from './danmaku-segment'
import { DanmakuConverterConfig, DanmakuConverter } from './danmaku-converter'
import { XmlDanmaku } from './xml-danmaku'

interface GotConfig {
  headers: {
    'User-Agent': string,
    cookie: string
  }
}

export class JsonDanmaku {
  // static SegmentSize = 6 * 60
  public jsonDanmakus: {
    id: number
    idStr: string
    progress: number
    mode: number
    fontsize: number
    color: number
    midHash: string
    content: string
    ctime: number
    weight: number
    action: string
    pool: number
    attr: number
  }[] = []
  constructor(
    public cid: number | string,
  ) { }
  // get segmentCount() {
  //   return Math.ceil(this.duration / JsonDanmaku.SegmentSize)
  // }
  get xmlDanmakus() {
    return this.jsonDanmakus.map(json => ({
      content: json.content,
      time: json.progress ? (json.progress / 1000).toString() : '0',
      type: json.mode?.toString() ?? '1',
      fontSize: json.fontsize?.toString() ?? '25',
      color: json.color?.toString() ?? '16777215',
      timeStamp: json.ctime?.toString() ?? '0',
      pool: json.pool?.toString() ?? '0',
      userHash: json.midHash ?? '0',
      rowId: json.idStr ?? '0',
    }))
  }
  async fetchInfo(gotConfig: GotConfig) {
    const viewBuffer = await got(`https://api.bilibili.com/x/v2/dm/web/view?type=1&oid=${this.cid}`, gotConfig).buffer()
    if (!viewBuffer) {
      throw new Error('获取弹幕信息失败')
    }
    const view = await decodeDanmakuView(viewBuffer)
    const { total } = view.dmSge
    if (total === undefined || !total.low) {
      throw new Error(`获取弹幕分页数失败: ${JSON.stringify(lodash.omit(view, 'flag'))}`)
    }
    const segments = await Promise.all(new Array(total.low).fill(0).map(async (_, index) => {
      const buffer = await got(`https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${this.cid}&segment_index=${index + 1}`, gotConfig).buffer()
      if (!buffer) {
        console.error(new Error(`弹幕片段${index + 1}下载失败`));
        return []
      }
      const result = await decodeDanmakuSegment(buffer)
      return result.elems ?? []
    }))
    this.jsonDanmakus = segments.flat().sort(ascendingSort(it => it.progress))
    return this
  }
}

export const getUserDanmakuConfig = async (title: string) => {
  // 标题需作为参数传入
  const defaultConfig: Omit<DanmakuConverterConfig, 'title'> = {
    font: '微软雅黑',
    alpha: 0.4,
    duration: (danmaku: { type: number }) => {
      switch (danmaku.type) {
        case 4:
        case 5:
          return 4
        default:
          return 6
      }
    },
    blockTypes: [7, 8],
    resolution: {
      x: 1920,
      y: 1080,
    },
    bottomMarginPercent: 0.15,
    bold: false,
  }
  let config = { ...defaultConfig, title } as DanmakuConverterConfig
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null) {
      console.warn('danmaku config invalid for key', key, ', value =', value)
      config[key] = defaultConfig[value]
    }
  }
  return config
}

export const convertToAssFromJson = async (danmaku: JsonDanmaku, title: string) => {
  const converter = new DanmakuConverter(await getUserDanmakuConfig(title))
  const assDocument = converter.xmlDanmakuToAssDocument(
    danmaku.xmlDanmakus.map(x => new XmlDanmaku(x)),
  )
  return assDocument.generateAss()
}

export const downloadDanmaku = async (cid: number, title: string, path: string, config: GotConfig) => {
  const danmaku = await new JsonDanmaku(cid).fetchInfo(config)
  const str = await convertToAssFromJson(danmaku, title)
  await fs.writeFile(path, str, { encoding: 'utf8' })
}
