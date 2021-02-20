import UA from '../assets/data/ua'
import FFmpeg from '../core/ffmpeg'
import sleep from '../utlis/sleep'
const stream = require('stream');
const {promisify} = require('util');
const fs = require('fs');
const got = require('got');
const pipeline = promisify(stream.pipeline);

function delFile (setting, videoInfo, event, dir) {
  // 删除原视频
  if (setting.isDelete) {
    fs.rmdir(`${dir}${videoInfo.title}-video.m4s`, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('video-删除成功')
      }
    })
    fs.rmdir(`${dir}${videoInfo.title}-audio.m4s`, { recursive: true }, err => {
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

export default async (videoInfo, event) => {
  // throttle start
  let videoLastTime = null
  let videoTimer = null
  let audioLastTime = null
  let audioTimer = null
  // throttle end
  const setting = global.store.get('setting')
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
  const dir = `${setting.downloadPath}/${videoInfo.title}-${videoInfo.id}/`
  // 创建文件夹
  try {
    fs.mkdirSync(dir)
  } catch (error) {
    console.log(`创建文件夹失败：${error}`)
  }
  // 下载封面
  await pipeline(
    got.stream(videoInfo.cover, imageConfig)
      .on('error', error => {
        console.log(error)
      }),
    fs.createWriteStream(`${dir}${videoInfo.title}.png`)
  )
  // 下载视频
  await pipeline(
    got.stream(videoInfo.downloadPath.video, downloadConfig)
      .on('downloadProgress', progress => {
        let nowTime = +new Date()
        clearTimeout(videoTimer)
        if (!videoLastTime || nowTime - videoLastTime > 1000) {
          console.log('--下载视频进度--')
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
    fs.createWriteStream(`${dir}${videoInfo.title}-video.m4s`)
  )
  await sleep(500)
  // 下载音频
  await pipeline(
    got.stream(videoInfo.downloadPath.audio, downloadConfig)
      .on('downloadProgress', progress => {
        let nowTime = +new Date()
        clearTimeout(audioTimer)
        if (!audioLastTime || nowTime - audioLastTime > 1000) {
          console.log('--下载音频进度--')
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
    fs.createWriteStream(`${dir}${videoInfo.title}-audio.m4s`)
  )
  await sleep(500)
  // 合成视频
  if (setting.isMerge) {
    const ffmpeg = new FFmpeg({
      videoPath: `${dir}${videoInfo.title}-video.m4s`,
      audioPath: `${dir}${videoInfo.title}-audio.m4s`,
      mergePath: `${dir}${videoInfo.title}.mp4`
    })
    ffmpeg.startMerge(res => {
      console.log('--合成视频--')
      console.log(res)
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
        delFile(setting, videoInfo, event, dir)
      }
      if (res === 'error') {
        event.reply('reply-download-video', {
          id: videoInfo.id,
          status: -1,
          progress: 100
        })
        delFile(setting, videoInfo, event, dir)
      }
    })
  } else {
    event.reply('reply-download-video', {
      id: videoInfo.id,
      status: 0,
      progress: 100
    })
    delFile(setting, videoInfo, event, dir)
  }
}
