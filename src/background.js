'use strict'

import { app, protocol, BrowserWindow, Menu, MenuItem, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import downloadTask from './core/download'
import { settingStore } from './assets/data/setting'
import { getStore, setStore, deleteStore } from './core/store'
const isDevelopment = process.env.NODE_ENV !== 'production'
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// set menu
const template = [
  {
    label: app.name,
    submenu: [
      { label: '关于', role: 'about' },
      { label: '缩小', role: 'minimize' },
      { label: '退出', role: 'quit' }
    ]
  },
  {
    label: '操作',
    submenu: [
      { label: '全选', role: 'selectAll' },
      { label: '复制', role: 'copy' },
      { label: '粘贴', role: 'paste' }
    ]
  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

let win = null

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    title: 'BilibiliVideoDownload',
    center: true,
    frame: false,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

function registerLocalResourceProtocol () {
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      return callback(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}

function initSetting () {
  const curSetting = getStore('setting')
  if (!curSetting) {
    setStore('setting', {
      ...settingStore,
      downloadPath: app.getPath('downloads')
    })
  } else {
    setStore('setting', {
      ...settingStore,
      ...curSetting
    })
  }
}

function addDropdownMenu (win, callBack1, callBack2, callBack3) {
  // 注册右键事件
  const menu = new Menu()
  menu.append(new MenuItem({
    label: '删除任务',
    type: 'normal',
    click: () => {
      callBack1()
    }
  }))
  menu.append(new MenuItem({
    label: '打开文件夹',
    type: 'normal',
    click: () => {
      callBack2()
    }
  }))
  menu.append(new MenuItem({
    label: '全选',
    type: 'normal',
    click: () => {
      callBack3()
    }
  }))
  menu.popup(win)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  // 初始化设置
  initSetting()

  // 注册自定义协议
  registerLocalResourceProtocol()

  // 打开选择文件夹
  ipcMain.on('open-dir-dialog', (event, arg) => {
    dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
      .then(res => {
        event.reply('dir-dialog-reply', res)
      })
      .catch(error => {
        console.log(error)
      })
  })

  // 打开文件夹
  ipcMain.on('open-dir', (event, arg) => {
    shell.openPath(arg)
  })

  // 关闭软件
  ipcMain.on('open-close-dialog', (event, arg) => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: '提示',
      message: '是否关闭应用程序？',
      buttons: ['取消', '关闭']
    })
      .then(res => {
        if (res.response === 1) {
          app.exit()
        }
      })
      .catch(error => {
        console.log(error)
      })
  })

  // 最小化软件
  ipcMain.on('minimize-window', (event, arg) => {
    win.minimize()
  })

  // 删除视频
  ipcMain.on('open-delete-video-dialog', (event, arg) => {
    console.log(arg.length)
    dialog.showMessageBox(win, {
      type: 'info',
      title: '提示',
      message: `当前选中${arg.length}个任务，你确定要删除吗？`,
      checkboxLabel: '同时删除文件',
      buttons: ['取消', '删除']
    })
      .then(res => {
        console.log(res)
        event.reply('delete-video-dialog-reply', {
          result: res,
          videoInfo: arg
        })
      })
      .catch(error => {
        console.log(error)
      })
  })

  // 打开浏览器
  ipcMain.on('open-external', (event, arg) => {
    shell.openExternal(arg)
  })

  // 下载视频
  ipcMain.on('download-video', async (event, arg) => {
    await downloadTask(arg, event, getStore('setting'))
  })

  // 获取store
  ipcMain.on('get-store', (event, arg) => {
    event.returnValue = getStore(arg)
  })
  
  // 设置store
  ipcMain.on('set-store', (event, arg) => {
    setStore(arg[0], arg[1])
  })

  // 删除store
  ipcMain.on('delete-store', (event, arg) => {
    deleteStore(arg)
  })

  // 添加右键菜单
  ipcMain.on('add-dropdown-menu', (event, arg) => {
    // arg 为当前选中任务index
    addDropdownMenu(win,
      () => {
        // 删除
        event.reply('contextmenu-delete', 'hello')
      },
      () => {
        // 打开文件夹
        console.log('main:', arg)
        event.reply('contextmenu-opendir', arg)
      },
      () => {
        // 全选
        event.reply('contextmenu-allselected', 'hello')
      }
    )
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
