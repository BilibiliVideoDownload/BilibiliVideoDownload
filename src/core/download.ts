import { IpcMainEvent } from 'electron'
import fs from 'fs-extra'
import UA from '../assets/data/ua'
import { mergeVideoAudio } from './media'
import { sleep } from '../utils'
import { downloadSubtitle } from './subtitle'
import { TaskData, SettingData } from '../type'

const stream = require('stream')
const { promisify } = require('util')
const got = require('got')
const log = require('electron-log')
const pipeline = promisify(stream.pipeline)

function handleDeleteFile (setting: SettingData, videoInfo: TaskData) {
  // 当设置为需要合并转码且要删除源文件时才删除源文件
  if (setting.isDelete && setting.isMerge) {
    ['videoSource', 'audioSource'].forEach((key) => {
      const filePath = videoInfo.filePaths[key]
      if (filePath && fs.existsSync(filePath)) {
        fs.removeSync(filePath)
      }
    })
  }
}

export default async (videoInfo: TaskData, event: IpcMainEvent, setting: SettingData) => {
  // throttle start
  let videoLastTime = 0
  let videoTimer: any = null
  let audioLastTime = 0
  let audioTimer: any = null
  // throttle end
  const imageConfig = {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${setting.SESSDATA}`
    }
  }
  const downloadConfig = {
    headers: {
      'User-Agent': `${UA}`,
      referer: videoInfo.url
    }
  }
  // 去掉扩展名的文件路径
  const fileName = videoInfo.filePaths.taget.substring(0, videoInfo.filePaths.taget.length - 4)
  if (setting.isFolder) {
    // 创建文件夹
    try {
      fs.mkdirSync(`${videoInfo.fileDir}`)
      log.info(`文件夹创建成功：${videoInfo.fileDir}`)
    } catch (error) {
      log.error(`创建文件夹失败：${error}`)
    }
  }
  // 下载封面
  if (setting.isCover && videoInfo.filePaths.cover) {
    await pipeline(
      got.stream(videoInfo.cover, imageConfig)
        .on('error', (error: any) => {
          console.log(error)
        }),
      fs.createWriteStream(videoInfo.filePaths.cover)
    )
  }
  // 下载字幕
  if (setting.isSubtitle) {
    downloadSubtitle(fileName, videoInfo.subtitle)
  }
  // 下载弹幕
  if (setting.isDanmaku) {
    event.reply('download-danmuku', videoInfo.cid, videoInfo.title, `${fileName}.ass`)
  }
  if (!setting.isAudioOnly && videoInfo.filePaths.videoSource) {
    // 下载视频
    await pipeline(
      got.stream(videoInfo.downloadUrl.video, downloadConfig)
        .on('downloadProgress', (progress: any) => {
          const nowTime = +new Date()
          clearTimeout(videoTimer)
          if (!videoLastTime || nowTime - videoLastTime > 1000) {
            event.reply('download-video-status', {
              id: videoInfo.id,
              status: 1,
              progress: Math.round(progress.percent * 100 * 0.75)
            })
            videoLastTime = nowTime
          } else {
            videoTimer = setTimeout(() => {
              event.reply('download-video-status', {
                id: videoInfo.id,
                status: 1,
                progress: Math.round(progress.percent * 100 * 0.75)
              })
            }, 200)
          }
        })
        .on('error', (error: any) => {
          log.error(`视频下载失败：${videoInfo.title} ${error.message}`)
          event.reply('download-video-status', {
            id: videoInfo.id,
            status: 5,
            progress: 100
          })
        }),
      fs.createWriteStream(videoInfo.filePaths.videoSource)
    )
    await sleep(500)
  }
  if (videoInfo.filePaths.audioSource) {
    // 下载音频
    await pipeline(
      got.stream(videoInfo.downloadUrl.audio, downloadConfig)
        .on('downloadProgress', (progress: any) => {
          const nowTime = +new Date()
          clearTimeout(audioTimer)
          if (!audioLastTime || nowTime - audioLastTime > 1000) {
            event.reply('download-video-status', {
              id: videoInfo.id,
              status: 2,
              progress: Math.round((progress.percent * 100 * 0.22) + 75)
            })
            audioLastTime = nowTime
          } else {
            audioTimer = setTimeout(() => {
              event.reply('download-video-status', {
                id: videoInfo.id,
                status: 2,
                progress: Math.round((progress.percent * 100 * 0.22) + 75)
              })
            }, 200)
          }
        })
        .on('error', (error: any) => {
          log.error(`音频下载失败：${videoInfo.title} ${error.message}`)
          event.reply('download-video-status', {
            id: videoInfo.id,
            status: 5,
            progress: 100
          })
        }),
      fs.createWriteStream(videoInfo.filePaths.audioSource)
    )
  }

  await sleep(500)
  // 合成视频
  if (setting.isMerge) {
    event.reply('download-video-status', {
      id: videoInfo.id,
      status: 3,
      progress: 98
    })
    mergeVideoAudio(
      videoInfo.filePaths.videoSource,
      videoInfo.filePaths.audioSource,
      videoInfo.filePaths.taget
    )
      .then((res: any) => {
        log.info(`音视频合成成功：${videoInfo.title} ${res}`)
        event.reply('download-video-status', {
          id: videoInfo.id,
          status: 0,
          progress: 100
        })
        // 删除原视频
        handleDeleteFile(setting, videoInfo)
      })
      .catch((error: any) => {
        log.error(`音视频合成失败：${videoInfo.title} ${error.message}`)
        event.reply('download-video-status', {
          id: videoInfo.id,
          status: 5,
          progress: 100
        })
        handleDeleteFile(setting, videoInfo)
      })
  } else {
    event.reply('download-video-status', {
      id: videoInfo.id,
      status: 0,
      progress: 100
    })
    handleDeleteFile(setting, videoInfo)
  }
}
