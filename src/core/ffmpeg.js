const ffmpeg = require('@ffmpeg-installer/ffmpeg')
const { exec } = require('child_process')
const isDevelopment = process.env.NODE_ENV !== 'production'
let ffmpegPath = ''

if (isDevelopment) {
  ffmpegPath = ffmpeg.path
} else {
  // see: https://github.com/electron/electron-packager/issues/740
  ffmpegPath = ffmpeg.path.replace('app.asar', 'app.asar.unpacked')
}

export default class FFmpeg {
  constructor (params) {
    this.ffmpeg = null
    this.videoPath = params.videoPath
    this.audioPath = params.audioPath
    this.mergePath = params.mergePath
  }

  kill () {
    if (this.ffmpeg) {
      this.ffmpeg.kill()
    }
  }

  startMerge (fun) {
    fun('start')
    this.ffmpeg = exec(`${ffmpegPath} -i "${this.videoPath}" -i "${this.audioPath}" -codec copy "${this.mergePath}"`, (error, stdout) => {
      if (error) {
        console.log('an error happened: ' + error)
        fun('error')
      } else {
        console.log('file has been converted succesfully')
        fun('end')
      }
    })
  }
}
