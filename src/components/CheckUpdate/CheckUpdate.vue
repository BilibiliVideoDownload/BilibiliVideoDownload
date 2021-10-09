<template>
  <a-modal
    v-model="visible"
    title="有新版本了"
    okText="更新"
    cancelText="取消"
    @ok="handleOk"
    @cancel="handleCancel">
    <p>检查到新版本<a>v{{ newVersion }}</a>，当前版本<a>v{{ oldVersion }}</a>可能有BUG，请及时更新。安装新版本前请先卸载旧版本！</p>
    <p>更新内容：{{ updateContent }}</p>
  </a-modal>
</template>

<script>
import base from '../../mixin/base'
const packageInfo = require('../../../package.json')
export default {
  mixins: [base],
  data () {
    return {
      visible: false,
      newVersion: '',
      oldVersion: '',
      htmlUrl: '',
      updateContent: ''
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {
    this.oldVersion = packageInfo.version
  },
  created () {},
  methods: {
    handleOk () {
      window.ipcRenderer.send('open-external', this.htmlUrl)
    },
    handleCancel () {
      this.visible = false
    },
    checkUpdate () {
      if (this.visible) {
        return
      }
      this.got('https://api.github.com/repos/blogwy/BilibiliVideoDownload/releases/latest', { responseType: 'json' })
        .then(res => {
          this.newVersion = res.body.tag_name.substr(1)
          this.htmlUrl = res.body.html_url
          this.updateContent = res.body.body
          const newVersionArray = res.body.tag_name.substr(1).split('.').map(item => Number(item))
          const oldVersionArray = this.oldVersion.split('.').map(item => Number(item))
          if (newVersionArray[0] > oldVersionArray[0]) {
            this.visible = true
            return
          }
          if (newVersionArray[1] > oldVersionArray[1]) {
            this.visible = true
            return
          }
          if (newVersionArray[2] > oldVersionArray[2]) {
            this.visible = true
            return
          }
        })
    }
  }
}
</script>

<style scoped lang="less"></style>
