const ffmpegPath = require('ffmpeg-static')
const ffmpeg = require('fluent-ffmpeg')
const log = require('electron-log')
const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  ffmpeg.setFfmpegPath(ffmpegPath)
} else {
  // see: https://github.com/electron/electron-packager/issues/740
  ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'))
}

export const mergeVideoAudio = (videoPath?: string, audioPath?: string, out?: string) => {
  if (!out) {
    throw new Error(`Output should not be empty`)
  }
  if (!videoPath && !audioPath) {
    throw new Error(`Neither videoPath nor audioPath exist`)
  }
  return new Promise((resolve, reject) => {
    let ffmpegOp = ffmpeg();
    if (videoPath) {
      ffmpegOp
        .input(videoPath)
        .videoCodec('copy')
    }

    if (audioPath) {
      ffmpegOp.input(audioPath)
      if (videoPath) {
        ffmpegOp.audioCodec('copy')
      }
    }
    ffmpegOp
      .on('start', (cmd: any) => {
        log.info(`开始转码：${cmd}`)
      })
      .on('end', () => {
        resolve('end')
      })
      .on('error', (err: any) => {
        reject(err)
      })
      .save(out)
  })
}
