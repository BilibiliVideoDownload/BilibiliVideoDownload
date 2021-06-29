<template>
  <div class="container">
    <div class="download-icon">
      <a-badge>
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
    <div class="setting" v-if="$route.path === '/'">
      <a-icon type="setting" class="icon" @click="$refs.settingDrawer.show(store.get('setting'))" />
    </div>
    <div class="user" v-if="$route.path === '/'">
      <a-icon type="user" class="icon" @click="$refs.userModal.show()"/>
    </div>
    <VideoModal ref="videoModal" />
    <SettingDrawer ref="settingDrawer" />
    <UserModal ref="userModal" />
    <LoginModal ref="loginModal" />
  </div>
</template>

<script>
import base from '../mixin/base'
import { checkUrl, parseHtml, checkLogin } from '../core/bilibili'
import UA from '../assets/data/ua'
import VideoModal from '../components/VideoModal'
import SettingDrawer from '../components/SettingDrawer'
export default {
  mixins: [base],
  data () {
    return {
      url: ''
    }
  },
  components: {
    VideoModal,
    SettingDrawer
  },
  computed: {},
  watch: {},
  mounted () {},
  created () {},
  methods: {
    test () {
      this.$refs.loginModal.openLoginModal()
      // this.$store.commit('setShowLoginModal', false)
    },
    goDownload () {
      this.$router.push('/download')
    },
    async download () {
      // 检测url
      if (!this.url) {
        this.$message.info('请输入视频地址')
        return
      }
      // 检测登录状态
      if (this.$store.state.showLoginModal) {
        const status = await checkLogin()
        this.$store.commit('setLoginStatus', status)
        if (status === 0) {
          this.$refs.loginModal.openLoginModal()
          return
        }
      }
      const params = {
        url: this.url,
        config: {
          headers: {
            'User-Agent': `${UA}`,
            cookie: `SESSDATA=${this.store.get('setting.SESSDATA')}`
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
  height: calc(100% - 28px);
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
  .setting{
    position: absolute;
    left: 16px;
    bottom: 16px;
    z-index: 100;
    color: @primary-color;
    font-size: 16px;
  }
  .user{
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 100;
    color: @primary-color;
    font-size: 16px;
  }
}
</style>
