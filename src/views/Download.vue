<template>
  <div :class="['container fr', !taskList || !taskList.length ? 'ac jc' : 'bg-fff']">
    <a-empty v-if="!taskList || !taskList.length" :image="require('../assets/images/no-data.png')">
      <span slot="description" class="text-active" style="font-weight: bold">暂无数据</span>
    </a-empty>
    <template v-else>
      <div class="left">
        <VuePerfectScrollbar class="scroll-area" :settings="settings">
          <div
            v-for="(item, index) in taskList" :key="index"
            :class="['fr', 'download-item', selected.includes(index) ? 'active' : '']"
            @click.left.exact="switchItem(index)"
            @click.shift.exact="multiSelect(index)"
            @click.right="showContextmenu(index)">
            <div class="img fr ac">
              <img :src="item.cover" :alt="item.title">
            </div>
            <div class="content fc jsb">
              <div class="ellipsis-1">{{ item.title }}</div>
              <div>状态：<span class="text-active">{{ item.status | formatProgress }}</span></div>
              <div>
                <a-progress :percent="item.progress" :status="item.status | formatStatus" strokeColor="#fb7299"></a-progress>
              </div>
            </div>
          </div>
        </VuePerfectScrollbar>
      </div>
      <div class="right">
        <div class="image">
          <img :src="current.cover" :alt="current.title">
        </div>
        <div class="pl16 mt8 text-active" @click="openExternal(current.url)">{{ current.title }}</div>
        <div class="fr ac pl16 mt8 up-list">
          UP：<div v-for="(item, index) in current.up" :key="index" class="mr16">
            <a class="ellipsis-1 up-name" @click="openExternal(`https://space.bilibili.com/${item.mid}`)">{{ item.name }}</a>
          </div>
        </div>
        <div class="mt8 pl16">创建时间：<span class="text-active">{{ current.createdTime }}</span></div>
        <div class="mt8 pl16">视频大小：<span class="text-active">{{ current.size ? current.size : '' }}</span></div>
        <div class="mt8 pl16">视频时长：<span class="text-active">{{ current.duration }}</span></div>
        <div class="mt8 pl16">清晰度：<span class="text-active">{{ current.quality | formatQuality }}</span></div>
        <div class="mt8 pl16">播放：<span class="text-active">{{ current.watch }}</span></div>
        <div class="mt8 pl16">弹幕：<span class="text-active">{{ current.danmu }}</span></div>
        <div class="mt8 pl16">评论：<span class="text-active">{{ current.comment }}</span></div>
      </div>
    </template>
  </div>
</template>

<script>
import base from '../mixin/base'
import { quality } from '../assets/data/quality'
import taskStatus from '../assets/data/status'
import sleep from '../utlis/sleep'
import formatPath from '../utlis/formatPath'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
const fs = require('fs')
export default {
  mixins: [base],
  data () {
    return {
      taskList: [],
      selected: [],
      current: null,
      settings: {
        minScrollbarLength: 50
      }
    }
  },
  components: { VuePerfectScrollbar },
  computed: {},
  watch: {},
  filters: {
    formatStatus (status) {
      return taskStatus[status]['value']
    },
    formatProgress (status) {
      return taskStatus[status]['label']
    },
    formatQuality (id) {
      return quality[id]
    },
    formatCover (img) {
      return `http://127.0.0.1:8964/?img=${img}`
    }
  },
  mounted () {
    this.getTaskList()
    window.ipcRenderer.on('reply-download-video', this.handleProgress)
    window.ipcRenderer.on('delete-video-dialog-reply', this.handleDelVideo)
    window.ipcRenderer.on('contextmenu-delete', this.onContextmenuDelete)
    window.ipcRenderer.on('contextmenu-opendir', this.onContextmenuOpendir)
    window.ipcRenderer.on('contextmenu-allselected', this.onContextmenuAllselect)
  },
  created () {},
  destroyed () {
    window.ipcRenderer.removeListener('reply-download-video', this.handleProgress)
    window.ipcRenderer.removeListener('delete-video-dialog-reply', this.handleDelVideo)
    window.ipcRenderer.removeListener('contextmenu-delete', this.onContextmenuDelete)
    window.ipcRenderer.removeListener('contextmenu-opendir', this.onContextmenuOpendir)
    window.ipcRenderer.removeListener('contextmenu-allselected', this.onContextmenuAllselect)
  },
  methods: {
    switchItem (index) {
      console.log('switchItem', index)
      this.selected = [index]
      this.current = this.taskList[index]
    },
    // 按shift+click触发多选
    multiSelect (index) {
      console.log('multiSelect', index)
      this.selected.push(index)
    },
    onContextmenuDelete () {
      const cur = []
      this.selected.forEach(item => {
        cur.push(this.taskList[item])
      })
      this.delDir(cur)
    },
    onContextmenuOpendir (event, index) {
      console.log('onContextmenuOpendir', index)
      const videoInfo = this.taskList[index]
      if (videoInfo.fileDir.dir) {
        const dir = formatPath(videoInfo.fileDir.dir)
        window.ipcRenderer.send('open-dir', dir)
      }
    },
    onContextmenuAllselect () {
      const cur = []
      this.taskList.forEach((item, index) => {
        cur.push(index)
      })
      this.selected = cur
    },
    showContextmenu (index) {
      window.ipcRenderer.send('add-dropdown-menu', index)
    },
    delDir (videoInfo) {
      window.ipcRenderer.send('open-delete-video-dialog', videoInfo)
    },
    handleDelVideo (event, { result, videoInfo }) {
      console.log('handleDelVideo')
      console.log(videoInfo)
      if (!result.response) return
      // 删除记录
      for (let idx = 0; idx < videoInfo.length; idx++) {
        const element = videoInfo[idx]
        const taskList = window.ipcRenderer.sendSync('get-store', 'taskList')
        const index = taskList.findIndex(item => item.id === element.id)
        taskList.splice(index, 1)
        window.ipcRenderer.send('set-store', ['taskList', taskList])
        if (result.checkboxChecked) {
          if (!element.fileDir.delDir) {
            return
          }
          // 删除文件
          const flag = Array.isArray(element.fileDir.delDir)
          if (!flag) {
            try {
              fs.rmdirSync(`${element.fileDir.dir}`, { recursive: true })
            } catch (error) {
              console.log(error)
              this.$message.error('视频文件删除失败')
            }
          } else {
            try {
              const fileList = element.fileDir.delDir
              for (let index = 0; index < 3; index++) {
                fs.unlinkSync(fileList[index])
              }
            } catch (error) {
              console.log(error)
              // this.$message.error('视频文件删除失败')
            }
          }
        }
      }
      this.$message.success('删除成功')
      this.getTaskList()
    },
    getVideoSize (videoInfo) {
      fs.stat(`${videoInfo.fileDir.dir}${videoInfo.fileDir.file}.mp4`, (err, info) => {
        if (err) {
          console.log(err)
        } else {
          const taskList = window.ipcRenderer.sendSync('get-store', 'taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList[index].size = `${(info.size / 1000 / 1000).toFixed(2)}MB`
          window.ipcRenderer.send('set-store', ['taskList', taskList])
          this.getTaskList()
        }
      })
    },
    handleProgress (event, videoInfo) {
      // console.log(JSON.stringify(videoInfo))
      const index = this.taskList.findIndex(item => item.id === videoInfo.id)
      if (index !== -1) {
        // 更新页面下载进度和状态
        this.$set(this.taskList, index, {
          ...this.taskList[index],
          status: videoInfo.status,
          progress: videoInfo.progress
        })
        // 成功/失败 后更新store数据结果
        if (videoInfo.status === 0 || videoInfo.status === -1) {
          const taskList = window.ipcRenderer.sendSync('get-store', 'taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList[index].status = videoInfo.status
          taskList[index].progress = videoInfo.progress
          window.ipcRenderer.send('set-store', ['taskList', taskList])
          // 减少正在下载数
          this.$store.commit('reduceDownloadingTask', 1)
          // 继续下载
          this.continueDownload()
        }
        // 下载成功后更新当前任务的videoSize页面和store
        if (videoInfo.status === 0) {
          this.getVideoSize({
            ...this.taskList[index],
            status: videoInfo.status,
            progress: videoInfo.progress
          })
        }
      }
    },
    openExternal (url) {
      if (url) {
        window.ipcRenderer.send('open-external', url)
      }
    },
    getTaskList () {
      this.taskList = window.ipcRenderer.sendSync('get-store', 'taskList') ? window.ipcRenderer.sendSync('get-store', 'taskList').reverse() : []
      if (this.taskList && this.taskList.length) {
        this.switchItem(0)
      }
    },
    async continueDownload () {
      // 从当前下载列表中找出可以继续下载的视频，并提交下载
      const allowDownTask = window.ipcRenderer.sendSync('get-store', 'setting.downloadingSize') - this.$store.state.downloadingTask
      const waitTasks = this.taskList.filter(item => item.status === 4)
      const waitTaskIndex = []
      const allowDownTaskData = []
      if (allowDownTask > 0) {
        for (let index = 0; index < allowDownTask; index++) {
          if (waitTasks[index]) {
            waitTaskIndex.push(this.taskList.findIndex(item => item.id === waitTasks[index].id))
            allowDownTaskData.push(waitTasks[index])
          }
        }
      }
      for (let index = 0; index < waitTaskIndex.length; index++) {
        const element = waitTaskIndex[index]
        this.$set(this.taskList, element, {
          ...this.taskList[element],
          status: 1
        })
      }
      // 提交下载
      for (let index = 0; index < allowDownTaskData.length; index++) {
        console.log('当前下载：', allowDownTaskData[index])
        window.ipcRenderer.send('download-video', allowDownTaskData[index])
        this.$store.commit('addDownloadingTask', 1)
        if (index !== allowDownTaskData.length - 1) {
          await sleep(300)
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.container{
  box-sizing: border-box;
  padding: 16px;
  position: relative;
  height: calc(100vh - 28px);
  &.bg-fff{
    background: #ffffff;
  }
  .left{
    flex: 5;
    width: 0;
    border-top: 1px solid #eeeeee;
    border-right: 1px solid #eeeeee;
    .scroll-area{
      width: 100%;
      height: 100%;
    }
    .download-item{
      border-bottom: 1px solid #eeeeee;
      cursor: pointer;
      &.active{
        background: rgba(251, 114, 153, 0.2);
      }
      .img{
        flex: none;
        width: 106px;
        height: 79px;
        overflow: hidden;
        position: relative;
        img{
          display: block;
          width: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .content{
        box-sizing: border-box;
        flex: none;
        width: 364px;
        padding: 8px;
      }
    }
  }
  .right{
    position: relative;
    flex: 3;
    width: 0;
    .image{
      height: 179px;
      overflow: hidden;
      position: relative;
      img{
        display: block;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .operate{
      position: absolute;
      width: 100%;
      bottom: 0px;
      left: 0px;
    }
    .up-list{
      width: 100%;
      overflow-x: scroll;
      &::-webkit-scrollbar{
        display: none;
      }
      .up-name{
        display: block;
        width: 65px;
      }
    }
  }
}
/deep/.ant-progress-status-success .ant-progress-text{
  color: @primary-color;
}
</style>
