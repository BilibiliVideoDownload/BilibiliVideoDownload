<template>
  <div class="container">
    <div class="download-icon">
      <a-badge :color="isDot ? '#fb7299' : ''">
        <a-icon type="download" class="icon" @click="goDownload" />
      </a-badge>
    </div>
    <div class="download-logo fr ac jc">
      <img src="../assets/images/logo.png" alt="">
    </div>
    <div class="download-box">
      <a-input v-model="url" size="large" placeholder="请输入视频地址">
        <a-icon slot="addonAfter" type="arrow-down" class="icon" @click="download" />
      </a-input>
    </div>
    <VideoModal ref="videoModal"></VideoModal>
  </div>
</template>

<script>
import { checkUrl, parseHtml } from '../utlis/bilibili'
import UA from '../assets/data/ua'
import VideoModal from '../components/VideoModal'
export default {
  data () {
    return {
      url: '',
      got: null,
      isDot: false
    }
  },
  components: {
    VideoModal
  },
  computed: {},
  watch: {},
  mounted () {},
  created () {
    this.got = window.remote.getGlobal('got')
  },
  methods: {
    goDownload () {
      this.$router.push('/download')
    },
    async download () {
      const SESSDATA = window.remote.getGlobal('store').get('setting.SESSDATA')
      if (!SESSDATA) {
        this.$message.info('请设置SESSDATA')
        return
      }
      const params = {
        url: this.url,
        config: {
          headers: {
            'User-Agent': `${UA}`,
            cookie: `SESSDATA=${SESSDATA}`
          }
        }
      }
      try {
        const res = await this.got(params.url, params.config)
        // 检测是否有重定向
        const url = res.redirectUrls[0] ? res.redirectUrls[0] : this.url
        const type = checkUrl(url)
        if (type === -1) {
          this.$message.error('请输入正确的视频地址')
          return
        }
        const videoInfo = await parseHtml(res.body, type, url)
        console.log(videoInfo)
        this.$refs.videoModal.show(videoInfo)
      } catch (error) {
        console.log(error)
        if (error === -1) {
          this.$message.info('不支持当前视频')
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
  .download-icon{
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
  .download-logo{
    margin: 130px 0px 50px 0px;
    img{
      transform: scale(.6);
    }
  }
  .download-box{
    padding: 0px 64px;
    /deep/ .ant-input-group-addon{
      background: @primary-color;
      border: none;
    }
    .icon{
      color: #ffffff;
      font-size: 18px;
    }
  }
}
</style>
