module.exports = {
  pluginOptions: {
    electronBuilder: {
      externals: ['ffmpeg-static', 'fluent-ffmpeg'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      preload: 'src/preload.js',
      builderOptions: {
        productName: 'BilibiliVideoDownload',
        appId: 'com.blogwy.bilibilivideodownload',
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ],
          sign: false,
          icon: 'build/icons/icon.ico'
        },
        mac: {
          icon: 'build/icons/icon.icns',
          identity: null,
          target: {
            target: 'dmg'
          }
        },
        nsis: {
          oneClick: false,
          perMachine: false,
          allowToChangeInstallationDirectory: true,
          installerIcon: 'build/icons/icon.ico',
          uninstallerIcon: 'build/icons/icon.ico',
          installerHeaderIcon: 'build/icons/icon.ico',
          createDesktopShortcut: true
        },
        win: {
          icon: 'build/icons/icon.ico',
          target: 'nsis'
        },
        linux: {
          icon: 'build/icons'
        }
      }
    }
  },
  configureWebpack: {},
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            // less 全局变量
            // 主色
            'primary-color': '#fb7299',
            'link-color': '#fb7299',
            'text-color': 'rgba(0, 0, 0, 0.65)'
          }
        }
      }
    }
  }
}
