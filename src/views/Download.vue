<template>
  <div :class="['container fr', !taskList || !taskList.length ? 'ac jc' : 'bg-fff']">
    <a-empty v-if="!taskList || !taskList.length" :image="require('../assets/images/no-data.png')">
      <span slot="description" class="text-active" style="font-weight: bold">暂无数据</span>
    </a-empty>
    <template v-else>
      <div class="left">
        <div v-for="(item, index) in taskList" :key="index" :class="['fr', 'download-item', selected === index ? 'active' : '']" @click="switchItem(index)">
          <div class="img fr ac">
            <img :src="item.cover | formatCover" :alt="item.title">
          </div>
          <div class="content fc jsb">
            <div class="ellipsis-1">{{ item.title }}</div>
            <div>状态：<span class="text-active">{{ item.status | formatProgress }}</span></div>
            <div>
              <a-progress :percent="item.progress" :status="item.status | formatStatus" strokeColor="#fb7299"></a-progress>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="image">
          <img :src="current.cover | formatCover" :alt="current.title">
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
        <div class="operate fr ac jc">
          <a-button icon="delete" type="primary" @click="delDir(current)">删除</a-button>
          <a-button class="ml16" icon="folder" type="primary" @click="openFolder(current)">打开</a-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import base from '../mixin/base'
import { quality } from '../assets/data/quality'
import taskStatus from '../assets/data/status'
import sleep from '../utlis/sleep'
const fs = require('fs')
export default {
  mixins: [base],
  data () {
    return {
      taskList: [],
      selected: null,
      current: null
    }
  },
  components: {},
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
  },
  created () {},
  destroyed () {
    window.ipcRenderer.removeListener('reply-download-video', this.handleProgress)
  },
  methods: {
    openFolder (videoInfo) {
      const setting = this.store.get('setting')
      let dir = ''
      if (process.platform === 'win32') {
        dir = `${setting.downloadPath}\\${videoInfo.title}-${videoInfo.id}`
      } else {
        dir = `${setting.downloadPath}/${videoInfo.title}-${videoInfo.id}`
      }
      window.remote.shell.showItemInFolder(dir)
    },
    delDir (videoInfo) {
      this.$confirm({
        title: '你确定要删除当前任务吗？',
        content: '视频文件也会被删除',
        cancelText: '取消',
        okText: '删除',
        onOk: () => {
          // 删除文件
          const setting = this.store.get('setting')
          fs.rmdir(`${setting.downloadPath}/${videoInfo.title}-${videoInfo.id}`, { recursive: true }, err => {
            if (err) {
              console.log(err)
            } else {
              console.log('video-删除成功')
            }
          })
          // 删除记录
          const taskList = this.store.get('taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList.splice(index, 1)
          this.store.set('taskList', taskList)
          this.$message.success('删除成功')
          this.getTaskList()
        },
        onCancel () {
          console.log('取消')
        }
      })
    },
    getVideoSize (videoInfo) {
      const setting = this.store.get('setting')
      fs.stat(`${setting.downloadPath}/${videoInfo.title}-${videoInfo.id}/${videoInfo.title}.mp4`, (err, info) => {
        if (err) {
          console.log(err)
        } else {
          const taskList = this.store.get('taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList[index].size = `${(info.size / 1000 / 1000).toFixed(2)}MB`
          this.store.set('taskList', taskList)
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
          const taskList = this.store.get('taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList[index].status = videoInfo.status
          taskList[index].progress = videoInfo.progress
          this.store.set('taskList', taskList)
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
      this.taskList = this.store.get('taskList') ? this.store.get('taskList').reverse() : []
      if (this.taskList && this.taskList.length) {
        this.switchItem(0)
      }
    },
    switchItem (index) {
      this.selected = index
      this.current = this.taskList[index]
    },
    async continueDownload () {
      // 从当前下载列表中找出可以继续下载的视频，并提交下载
      const allowDownTask = this.store.get('setting.downloadingSize') - this.$store.state.downloadingTask
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
    overflow-y: scroll;
    &::-webkit-scrollbar{
      display: none;
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
