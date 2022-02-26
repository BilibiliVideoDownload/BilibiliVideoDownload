import UA from '../assets/data/ua'
import FFmpeg from '../core/ffmpeg'
import sleep from '../utlis/sleep'
import { downloadSubtitle } from './subtitle'
const stream = require('stream');
const {promisify} = require('util');
const fs = require('fs');
const got = require('got');
const pipeline = promisify(stream.pipeline);

function delFile (setting, videoInfo, event, fileName) {
  // 删除原视频
  if (setting.isDelete) {
    fs.rmdir(`${fileName}-video.m4s`, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('video-删除成功')
      }
    })
    fs.rmdir(`${fileName}-audio.m4s`, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('audio-删除成功')
      }
    })
  } else {
    event.reply('reply-download-video', {
      id: videoInfo.id,
      status: 0,
      progress: 100
    })
  }
}

export default async (videoInfo, event, setting) => {
  // throttle start
  let videoLastTime = null
  let videoTimer = null
  let audioLastTime = null
  let audioTimer = null
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
  let fileName = `${videoInfo.fileDir.dir}${videoInfo.fileDir.file}`
  if (setting.isFolder) {
    // 创建文件夹
    try {
      fs.mkdirSync(`${videoInfo.fileDir.dir}`)
    } catch (error) {
      console.log(`创建文件夹失败：${error}`)
    }
  }
  // 下载封面
  await pipeline(
    got.stream(videoInfo.cover, imageConfig)
      .on('error', error => {
        console.log(error)
      }),
    fs.createWriteStream(`${fileName}.png`)
  )
  // 下载字幕
  if (setting.isSubtitle) {
    downloadSubtitle(fileName, videoInfo.subtitle)
  }
  // 下载视频
  await pipeline(
    got.stream(videoInfo.downloadLink.video, downloadConfig)
      .on('downloadProgress', progress => {
        let nowTime = +new Date()
        clearTimeout(videoTimer)
        if (!videoLastTime || nowTime - videoLastTime > 1000) {
          event.reply('reply-download-video', {
            id: videoInfo.id,
            status: 1,
            progress: parseInt(parseFloat(parseFloat(progress.percent).toFixed(2)) * 100)
          })
          videoLastTime = nowTime
        } else {
          videoTimer = setTimeout(() => {
            event.reply('reply-download-video', {
              id: videoInfo.id,
              status: 1,
              progress: parseInt(parseFloat(parseFloat(progress.percent).toFixed(2)) * 100)
            })
          }, 200)
        }
      })
      .on('error', error => {
        console.log(error)
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: -1,
          progress: 100
        })
      }),
    fs.createWriteStream(`${fileName}-video.m4s`)
  )
  await sleep(500)
  // 下载音频
  await pipeline(
    got.stream(videoInfo.downloadLink.audio, downloadConfig)
      .on('downloadProgress', progress => {
        let nowTime = +new Date()
        clearTimeout(audioTimer)
        if (!audioLastTime || nowTime - audioLastTime > 1000) {
          event.reply('reply-download-video', {
            id: videoInfo.id,
            status: 2,
            progress: parseInt(parseFloat(parseFloat(progress.percent).toFixed(2)) * 100)
          })
          audioLastTime = nowTime
        } else {
          audioTimer = setTimeout(() => {
            event.reply('reply-download-video', {
              id: videoInfo.id,
              status: 2,
              progress: parseInt(parseFloat(parseFloat(progress.percent).toFixed(2)) * 100)
            })
          }, 200)
        }
      })
      .on('error', error => {
        console.log(error)
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: -1,
          progress: 100
        })
      }),
    fs.createWriteStream(`${fileName}-audio.m4s`)
  )
  await sleep(500)
  // 合成视频
  if (setting.isMerge) {
    const ffmpeg = new FFmpeg({
      videoPath: `${fileName}-video.m4s`,
      audioPath: `${fileName}-audio.m4s`,
      mergePath: `${fileName}.mp4`
    })
    ffmpeg.startMerge(res => {
      if (res === 'start') {
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: 3,
          progress: 100
        })
      }
      if (res === 'end') {
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: 0,
          progress: 100
        })
        // 删除原视频
        delFile(setting, videoInfo, event, fileName)
      }
      if (res === 'error') {
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: -1,
          progress: 100
        })
        delFile(setting, videoInfo, event, fileName)
      }
    })
  } else {
    event.reply('reply-download-video', {
      id: videoInfo.id,
      status: 0,
      progress: 100
    })
    delFile(setting, videoInfo, event, fileName)
  }
}
