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
          <img :src="videoInfo.cover | formatCover" alt="">
        </div>
        <div class="content fc jsa pl16">
          <div class="text-active ellipsis-2" @click="openExternal(videoInfo.url)">{{ videoInfo.title }}</div>
          <div>up：<span v-for="(item, index) in videoInfo.up" :key="index" class="text-active mr8" @click="openExternal(`https://space.bilibili.com/${item.mid}`)">{{item.name}}</span></div>
        </div>
      </div>
      <div class="mt16">
        选择清晰度：
        <div class="mt8">
          <a-radio-group v-model="quality" :options="videoInfo.qualityOptions" />
        </div>
      </div>
      <div v-if="videoInfo.page && videoInfo.page.length > 1" class="fr ac jsb mt16">
        <div>这是一个多P视频，请选择</div>
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
import randomNum from '../utlis/randomNum'
import sleep from '../utlis/sleep'
import filterTitle from '../utlis/filterTitle'
import UA from '../assets/data/ua'
import formatSeconed from '../utlis/formatSeconed'
export default {
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
      got: null
    }
  },
  components: {},
  computed: {},
  watch: {},
  filters: {
    formatCover (img) {
      return `http://127.0.0.1:8964/?img=${img}`
    }
  },
  mounted () {},
  created () {
    this.got = window.remote.getGlobal('got')
  },
  methods: {
    openExternal (url) {
      if (url) {
        window.ipcRenderer.send('open-external', url)
      }
    },
    show (info) {
      this.visible = true
      this.videoInfo = info
    },
    async handleOk () {
      // 判断是否选择清晰度
      if (!this.quality) {
        this.$message.info('请选择清晰度')
        return
      }
      const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
      const bfeId = window.remote.getGlobal('store').get('setting.bfe_id') ? window.remote.getGlobal('store').get('setting.bfe_id') : ''
      if (!SESSDATA) {
        this.$message.error('请设置SESSDATA')
        return
      }
      const config = {
        headers: {
          'User-Agent': `${UA}`,
          cookie: `SESSDATA=${SESSDATA};bfe_id=${bfeId}`
        }
      }
      this.confirmLoading = true
      // 判断是否多p视频
      if (this.videoInfo.page.length > 1) {
        if (!this.selected.length) {
          this.$message.info('请选择分P')
          return
        }
        for (let index = 0; index < this.selected.length; index++) {
          const currentPage = this.selected[index]
          // 请求选中清晰度视频下载地址
          const cid = this.videoInfo.page.find(item => item.page === currentPage).cid
          const { body: { data: { dash: { video, audio } } }, headers: { 'set-cookie': responseCookies } } = await this.got(
            `https://api.bilibili.com/x/player/playurl?cid=${cid}&bvid=${this.videoInfo.bvid}&qn=${this.quality}&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
            {
              ...config,
              responseType: 'json'
            }
          )
          // 保存返回的cookies
          this.saveResponseCookies(responseCookies)
          const videoInfo = {
            id: `${new Date().getTime()}${randomNum(1000, 9999)}`,
            ...this.videoInfo,
            title: `[P${currentPage}]${filterTitle(this.videoInfo.page.find(item => item.page === currentPage).title)}}`,
            quality: this.quality,
            duration: formatSeconed(this.videoInfo.page.find(item => item.page === currentPage).duration),
            status: 1,
            progress: 0,
            size: null,
            url: `${this.videoInfo.url}?p=${currentPage}`,
            downloadPath: {
              video: video.find(item => item.id === this.quality).baseUrl,
              audio: audio[0].baseUrl
            }
          }
          console.log(videoInfo)
          // 保存数据
          let taskList = window.remote.getGlobal('store').get('taskList') ? window.remote.getGlobal('store').get('taskList') : []
          taskList = taskList.concat(videoInfo)
          window.remote.getGlobal('store').set('taskList', taskList)
          // 调用下载
          window.ipcRenderer.send('download-video', videoInfo)
          if (index !== this.selected.length - 1) {
            await sleep(1000)
          }
        }
        this.confirmLoading = false
        // 跳转到下载页面
        this.$router.push('/download')
      } else {
        // 请求选中清晰度视频下载地址
        const { body: { data: { dash: { video, audio } } }, headers: { 'set-cookie': responseCookies } } = await this.got(
          `https://api.bilibili.com/x/player/playurl?cid=${this.videoInfo.cid}&bvid=${this.videoInfo.bvid}&qn=${this.quality}&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
          {
            ...config,
            responseType: 'json'
          }
        )
        // 保存返回的cookies
        this.saveResponseCookies(responseCookies)
        const videoInfo = {
          id: `${new Date().getTime()}${randomNum(1000, 9999)}`,
          ...this.videoInfo,
          title: filterTitle(this.videoInfo.title),
          quality: this.quality,
          status: 1,
          progress: 0,
          size: null,
          downloadPath: {
            video: video.find(item => item.id === this.quality).baseUrl,
            audio: audio[0].baseUrl
          }
        }
        console.log(videoInfo)
        // 保存数据
        let taskList = window.remote.getGlobal('store').get('taskList') ? window.remote.getGlobal('store').get('taskList') : []
        taskList = taskList.concat(videoInfo)
        window.remote.getGlobal('store').set('taskList', taskList)
        this.confirmLoading = false
        // 调用下载
        window.ipcRenderer.send('download-video', videoInfo)
        this.$router.push('/download')
      }
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
        const setting = window.remote.getGlobal('store').get('setting')
        window.remote.getGlobal('store').set('setting', {
          ...setting,
          bfe_id: cookiesString
        })
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
</style>
