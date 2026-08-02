'use strict'

const crypto = require('crypto')
const fs = require('fs')
const https = require('https')
const path = require('path')
const { pipeline } = require('stream/promises')

const VERSION = '2026.07.04'
const DOWNLOAD_URL = `https://github.com/yt-dlp/yt-dlp/releases/download/${VERSION}/yt-dlp.exe`
const SHA256 = '52fe3c26dcf71fbdc85b528589020bb0b8e383155cfa81b64dd447bbe35e24b8'
const cacheDir = path.resolve(__dirname, '..', 'cache')
const targetPath = path.join(cacheDir, 'yt-dlp.exe')
const tempPath = `${targetPath}.${process.pid}.tmp`

const hashFile = async (filePath) => {
  const hash = crypto.createHash('sha256')
  for await (const chunk of fs.createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex')
}

const getResponse = (url, redirects = 0) => new Promise((resolve, reject) => {
  if (redirects > 5) return reject(new Error('yt-dlp 下载重定向次数过多'))

  const request = https.get(url, {
    headers: { 'User-Agent': 'BilibiliVideoDownload-build' }
  }, response => {
    if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      response.resume()
      const redirectUrl = new URL(response.headers.location, url)
      if (redirectUrl.protocol !== 'https:') return reject(new Error('yt-dlp 下载地址必须使用 HTTPS'))
      return resolve(getResponse(redirectUrl, redirects + 1))
    }
    if (response.statusCode !== 200) {
      response.resume()
      return reject(new Error(`yt-dlp 下载失败，HTTP ${response.statusCode}`))
    }
    resolve(response)
  })

  request.setTimeout(30000, () => request.destroy(new Error('yt-dlp 下载连接超时')))
  request.on('error', reject)
})

const main = async () => {
  if (process.platform !== 'win32') {
    console.log('yt-dlp Windows binary is not required on this platform')
    return
  }

  await fs.promises.mkdir(cacheDir, { recursive: true })

  try {
    if (await hashFile(targetPath) === SHA256) {
      console.log(`yt-dlp ${VERSION} cache verified`)
      return
    }
    console.log('Cached yt-dlp checksum mismatch, downloading a verified copy')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  await fs.promises.rm(tempPath, { force: true })
  const response = await getResponse(DOWNLOAD_URL)
  response.setTimeout(30000, () => response.destroy(new Error('yt-dlp 下载超时')))
  await pipeline(response, fs.createWriteStream(tempPath, { flags: 'wx' }))

  const downloadedHash = await hashFile(tempPath)
  if (downloadedHash !== SHA256) {
    throw new Error(`yt-dlp SHA-256 校验失败：${downloadedHash}`)
  }

  await fs.promises.rm(targetPath, { force: true })
  await fs.promises.rename(tempPath, targetPath)
  console.log(`yt-dlp ${VERSION} downloaded and verified: ${targetPath}`)
}

main().catch(async error => {
  await fs.promises.rm(tempPath, { force: true }).catch(() => undefined)
  console.error(error.message)
  process.exitCode = 1
})
