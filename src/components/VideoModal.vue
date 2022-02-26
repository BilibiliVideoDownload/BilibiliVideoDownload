<template>
  <a-modal
    v-model="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    :closable="false"
    title="当前视频信息"
    okText="下载"
    cancelText="取消">
    <div class="video-modal">
      <div class="video-info fr">
        <div class="image">
          <img :src="videoInfo.cover" alt="">
        </div>
        <div class="content fc jsa pl16">
          <div class="text-active ellipsis-2" @click="openExternal(videoInfo.url)">{{ videoInfo.title }}</div>
          <div class="ellipsis-1">up：<span v-for="(item, index) in videoInfo.up" :key="index" class="text-active mr8" @click="openExternal(`https://space.bilibili.com/${item.mid}`)">{{item.name}}</span></div>
        </div>
      </div>
      <div class="mt16">
        选择清晰度：
        <div class="mt8">
          <a-radio-group v-model="quality">
            <a-radio class="custom-radio" v-for="(item, index) in qualityOptions" :key="index" :value="item.value">
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </div>
      </div>
      <div v-if="videoInfo.page && videoInfo.page.length > 1" class="fr ac jsb mt16">
        <div>这是一个多P视频，请选择</div>
        <div>
          <a-checkbox @change="onAllSelectedChange">
            全选
          </a-checkbox>
        </div>
      </div>
      <div v-if="videoInfo.page && videoInfo.page.length > 1" class="fr ac warp mt16">
        <div v-for="(item, index) in videoInfo.page" :key="index" :class="['video-item', selected.includes(item.page) ? 'active' : '']" @click="toggle(item.page)">
          <a-tooltip>
            <template slot="title">
              {{ item.title }}
            </template>
            <span class="ellipsis-1">{{ item.title }}</span>
          </a-tooltip>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import base from '../mixin/base'
import { getDownloadList } from '../core/bilibili'
import sleep from '../utlis/sleep'
import { userQuality } from '../assets/data/quality'
export default {
  mixins: [base],
  data () {
    return {
      visible: false,
      confirmLoading: false,
      videoInfo: {
        title: '',
        qualityOptions: [],
        page: []
      },
      selected: [],
      videoOptions: [],
      quality: null,
      allSelected: false
    }
  },
  components: {},
  computed: {
    qualityOptions () {
      const quality = userQuality[this.$store.state.loginStatus]
      return this.videoInfo.qualityOptions.filter(item => quality.includes(item.value))
    }
  },
  watch: {},
  filters: {
    formatCover (img) {
      return `http://127.0.0.1:8964/?img=${img}`
    }
  },
  mounted () {},
  created () {},
  methods: {
    onAllSelectedChange (e) {
      this.allSelected = e.target.checked
      this.selected = []
      if (e.target.checked) {
        this.videoInfo.page.forEach(element => {
          this.selected.push(element.page)
        })
      }
    },
    openExternal (url) {
      if (url) {
        window.ipcRenderer.send('open-external', url)
      }
    },
    show (info) {
      this.visible = true
      this.videoInfo = info
      // 如果是单p，则默认选中
      if (this.videoInfo.page.length === 1) {
        this.selected.push(this.videoInfo.page[0].page)
      }
    },
    async handleOk () {
      if (!this.quality) {
        this.$message.info('请选择清晰度')
        return
      }
      if (!this.selected.length) {
        this.$message.info('请选择分P')
        return
      }
      this.confirmLoading = true
      const list = await getDownloadList(this.videoInfo, this.selected, this.quality)
      // 改状态
      const allowDownTask = window.ipcRenderer.sendSync('get-store', 'setting.downloadingSize') - this.$store.state.downloadingTask
      if (allowDownTask > 0) {
        for (let index = 0; index < allowDownTask; index++) {
          if (list[index]) list[index].status = 1
        }
      }
      let taskList = window.ipcRenderer.sendSync('get-store', 'taskList') ? window.ipcRenderer.sendSync('get-store', 'taskList') : []
      taskList = taskList.concat(list)
      window.ipcRenderer.send('set-store', ['taskList', taskList])
      const allowDownTaskData = list.filter(item => item.status === 1)
      // 调用下载
      if (allowDownTaskData.length) {
        for (let index = 0; index < allowDownTaskData.length; index++) {
          console.log('当前下载：', allowDownTaskData[index])
          window.ipcRenderer.send('download-video', allowDownTaskData[index])
          if (index !== allowDownTaskData.length - 1) {
            await sleep(300)
          }
        }
        // 增加正在下载数
        this.$store.commit('addDownloadingTask', allowDownTaskData.length)
      }
      this.confirmLoading = false
      // 跳转到下载页面
      this.$router.push('/download')
    },
    handleCancel () {
      this.visible = false
      this.confirmLoading = false
      this.quality = null
      this.selected = []
    },
    toggle (page) {
      const index = this.selected.indexOf(page)
      if (index === -1) {
        this.selected.push(page)
      } else {
        this.$delete(this.selected, index)
      }
    },
    saveResponseCookies (cookies) {
      if (cookies && cookies.length) {
        const cookiesString = cookies.join(';')
        const setting = window.ipcRenderer.sendSync('get-store', 'setting')
        window.ipcRenderer.send('set-store', ['setting', {
          ...setting,
          bfe_id: cookiesString
        }])
      }
    }
  }
}
</script>

<style scoped lang="less">
.video-modal{
  height: 260px;
  overflow-y: scroll;
  &::-webkit-scrollbar{
    display: none;
  }
  .video-info{
    height: 71.25px;
    .image{
      flex: none;
      width: 114px;
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
      width: 358px;
    }
  }
  .video-item{
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 100px;
    height: 50px;
    border: 1px solid #eeeeee;
    background: #ffffff;
    margin: 0px 18px 18px 0px;
    padding: 8px;
    cursor: pointer;
    overflow: hidden;
    user-select: none;
    &.active{
      color: #ffffff;
      background: @primary-color;
      border: 1px solid @primary-color;
    }
  }
}
.custom-radio{
  width: 130px;
}
</style>
