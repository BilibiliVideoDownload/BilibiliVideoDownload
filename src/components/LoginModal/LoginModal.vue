<template>
  <div>
    <a-modal
      v-model="visible"
      title="扫码登录Bilibili账号"
      okText="确认登录"
      cancelText="不登录"
      :ok-button-props="{ props: { disabled: statusText !== '已登录' } }"
      :closable="false"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel">
      <div class="fc jc ac login">
        <div class="fc jc img-box">
          <div class="fr ac jc img-modal" v-if="!countDown">
            <a-icon class="icon" type="redo" @click="getQrcodeData()" />
          </div>
          <img class="img" :src="qrCodeImg" alt="">
        </div>
        <div class="mt16 status">{{ statusText }}</div>
        <div class="mt16 desc">注：软件登录后只会获取你的SESSDATA来用做下载，账号是普通账号最大下载1080P视频，大会员可以下载4K视频，不登录最大下载480P视频</div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import base from '../../mixin/base'
import qrCode from 'qrcode'
import { checkLogin } from '../../core/bilibili'
export default {
  mixins: [base],
  data () {
    return {
      visible: false,
      qrCodeImg: null,
      oauthKey: '',
      countDown: 180,
      timer: null,
      qrCodeConfig: {
        margin: 0,
        errorCorrectionLevel: 'H',
        width: 400
      },
      statusText: '未扫码',
      isCheck: true,
      SESSDATA: ''
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {},
  created () {},
  methods: {
    async openLoginModal () {
      await this.getQrcodeData()
      this.statusText = '未扫码'
      this.visible = true
      this.isCheck = true
      this.checkLoginStatus(this.oauthKey)
    },
    hideLoginModal () {
      this.isCheck = false
      setTimeout(() => {
        clearInterval(this.timer)
        this.timer = null
      }, 3000)
      this.visible = false
    },
    async getQrcodeData () {
      const { body } = await this.got('http://passport.bilibili.com/qrcode/getLoginUrl', { responseType: 'json' })
      this.createQrcode(body.data.url)
      this.oauthKey = body.data.oauthKey
      // 开始倒计时
      this.countDown = 180
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.timer = setInterval(() => {
        if (!this.countDown) {
          clearInterval(this.timer)
          return
        }
        this.countDown -= 1
      }, 1000)
    },
    createQrcode (data) {
      qrCode.toDataURL(data, this.qrCodeConfig)
        .then(res => {
          this.qrCodeImg = res
        })
    },
    checkLoginStatus (oauthKey) {
      const _this = this
      run(oauthKey)
      async function run (oauthKey) {
        if (!_this.isCheck) return
        const { body } = await _this.got('http://passport.bilibili.com/qrcode/getLoginInfo', {
          method: 'POST',
          responseType: 'json',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          form: { oauthKey }
        })
        console.log(body)
        if (!body.status) {
          if (body.data === -4) {
            _this.statusText = '未扫码'
          }
          if (body.data === -5) {
            _this.statusText = '已扫码'
          }
          setTimeout(() => {
            run(oauthKey)
          }, 3000)
          return
        }
        // 获取SESSDATA
        _this.SESSDATA = body.data.url.match(/SESSDATA=(\S*)&bili_jct/)[1]
        _this.statusText = '已登录'
        _this.isCheck = false
      }
    },
    async handleOk () {
      this.store.set('setting.SESSDATA', this.SESSDATA)
      // 设置登录状态
      const status = await checkLogin()
      this.$store.commit('setLoginStatus', status)
      this.hideLoginModal()
    },
    handleCancel () {
      this.SESSDATA = ''
      this.$store.commit('setShowLoginModal', false)
      this.hideLoginModal()
    }
  }
}
</script>

<style scoped lang="less">
.login{
  .img-box{
    position: relative;
    z-index: 10;
    width: 200px;
    .img-modal{
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      z-index: 12;
      background: rgba(255, 255, 255, 0.8);
      .icon{
        font-size: 24px;
      }
    }
    .img{
      display: block;
      position: relative;
      z-index: 11;
      width: 100%;
    }
  }
}
</style>
