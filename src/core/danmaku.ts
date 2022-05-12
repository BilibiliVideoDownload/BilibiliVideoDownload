
import { IpcMainEvent } from 'electron'
import { inflateRawSync } from 'zlib'
import UA from '../assets/data/ua'
import { VideoData } from '../type'
const got = require('got')

export const getDanmakuXml = async (path: string, videoInfo: VideoData, event: IpcMainEvent) => {
  const body = await got(`https://comment.bilibili.com/${videoInfo.cid}.xml`, {
    headers: {
      'User-Agent': `${UA}`
    },
    decompress: false
  }).buffer();
  event.reply('danmuku-xml-data', {
    quality: videoInfo.quality,
    data: inflateRawSync(body).toString(),
    save: `${path}.ass`
  })
}