import UA from '../assets/data/ua'
const got = require('got')
const fs = require('fs')

const downloadSubtitle = (fileName, list = []) => {
  for (let index = 0; index < list.length; index++) {
    const element = list[index]
    getSubtitleData(element.subtitle_url, `${fileName}-${element.lan_doc}.srt`)
  }
}

const getSubtitleData = async (url, path) => {
  const { body } = await got(url, {
    headers: {
      'User-Agent': `${UA}`
    },
    responseType: 'json'
  })
  const str = handleSubtitleData(body.body)
  // 生成字幕文件
  createFile(path, str)
}

const handleSubtitleData = subtitle => {
  let str = ''
  subtitle.forEach((element, index) => {
    const form = String(element.from).split('.')
    const to = String(element.to).split('.')
    str += `${index+1}\n${formatSeconds(Number(form[0]))},${ form[1] ? form[1] : '0'} --> ${formatSeconds(Number(to[0]))},${ to[1] ? to[1] : '0'}\n${element.content}\n\n`
  })
  return str
}

const formatSeconds = value => {
  let result = parseInt(value)
  let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
  let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
  let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
  let res = ''
  res += `${h}:`
  res += `${m}:`
  res += `${s}`
  return res
}

const createFile = (path, date) => {
  fs.writeFile(path, date, { encoding: 'utf8' }, err => {
    if (!err) {
      console.log('success')
    }
  })
}

export {
  downloadSubtitle
}