import { contextBridge, ipcRenderer } from 'electron'
const log = require('electron-log')

contextBridge.exposeInMainWorld('log', log.functions)

contextBridge.exposeInMainWorld('electron', {
  openBrowser (url) {
    ipcRenderer.send('open-browser', url)
  },
  openPath (path) {
    ipcRenderer.send('open-path', path)
  },
  openDirDialog () {
    return ipcRenderer.invoke('open-dir-dialog')
  },
  got (url, option) {
    return ipcRenderer.invoke('got', url, option)
  },
  gotBuffer (url, option) {
    return ipcRenderer.invoke('got-buffer', url, option)
  },
  getStore (path) {
    return ipcRenderer.invoke('get-store', path)
  },
  setStore (path, data) {
    ipcRenderer.send('set-store', path, data)
  },
  deleteStore (path) {
    ipcRenderer.send('delete-store', path)
  },
  showContextmenu (type) {
    return ipcRenderer.invoke('show-context-menu', type)
  },
  openDir (list) {
    ipcRenderer.send('open-dir', list)
  },
  openDeleteVideoDialog (count) {
    return ipcRenderer.invoke('open-delete-video-dialog', count)
  },
  deleteVideos (list) {
    return ipcRenderer.invoke('delete-videos', list)
  },
  downloadVideo (task) {
    ipcRenderer.send('download-video', task)
  },
  getVideoSize (id) {
    return ipcRenderer.invoke('get-video-size', id)
  },
  closeApp () {
    ipcRenderer.send('close-app')
  },
  minimizeApp () {
    ipcRenderer.send('minimize-app')
  },
  openReloadVideoDialog (count) {
    return ipcRenderer.invoke('open-reload-video-dialog', count)
  },
  saveDanmukuFile (content, path) {
    ipcRenderer.send('save-danmuku-file', content, path)
  },
  on (channel, func) {
    const validChannels = [
      'download-video-status',
      'download-danmuku'
    ]
    if (validChannels.includes(channel)) {
      const subscription = (_event, ...args) =>
        func(...args)
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, subscription)

      return () => ipcRenderer.removeListener(channel, subscription)
    }

    return undefined
  },
  once (channel, func) {
    const validChannels = ['init-store']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
    }
  }
})
