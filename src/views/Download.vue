<template>
  <div :class="['container fr', !taskList || !taskList.length ? 'ac jc' : 'bg-fff']">
    <div class="back-icon">
      <a-icon type="rollback" class="icon" @click="goHome" />
    </div>
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
        <div class="fr ac pl16 mt8">
          UP：<div v-for="(item, index) in current.up" :key="index" class="mr16">
            <a @click="openExternal(`https://space.bilibili.com/${item.mid}`)">{{ item.name }}</a>
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
      const mapData = {
        1: 'active',
        2: 'active',
        3: 'active',
        0: 'success',
        '-1': 'exception'
      }
      return mapData[status]
    },
    formatProgress (status) {
      const mapData = {
        1: '视频下载中',
        2: '音频下载中',
        3: '视频合成中',
        0: '已完成',
        '-1': '下载失败'
      }
      return `${mapData[status]}`
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
        this.$set(this.taskList, index, {
          ...this.taskList[index],
          status: videoInfo.status,
          progress: videoInfo.progress
        })
        // 成功/失败 后更新数据
        if (videoInfo.status === 0 || videoInfo.status === -1) {
          const taskList = this.store.get('taskList')
          const index = taskList.findIndex(item => item.id === videoInfo.id)
          taskList[index].status = videoInfo.status
          taskList[index].progress = videoInfo.progress
          this.store.set('taskList', taskList)
        }
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
    goHome () {
      this.$router.push('/')
    },
    switchItem (index) {
      this.selected = index
      this.current = this.taskList[index]
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
  .back-icon{
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 99;
    cursor: pointer;
    .icon{
      font-size: 36px;
      color: @primary-color;
    }
  }
  .left{
    flex: 5;
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
  }
}
/deep/.ant-progress-status-success .ant-progress-text{
  color: @primary-color;
}
</style>
