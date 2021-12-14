<template>
  <a-modal
    v-model="visible"
    :closable="true"
    :footer="null">
    <div class="user fc ac">
      <img src="../assets/images/user.png" alt="" class="avatar">
      <div class="version mt16">
        {{ `${projectName} - v${version}` }} <a-icon type="reload" @click="$checkUpdate.checkUpdate()" />
      </div>
      <div class="git mt16">项目地址：<span class="text-active" @click="openExternal(projectUrl)">{{ projectUrl }}</span></div>
      <div class="desc mt16">个人作品，代码稀烂，大佬轻喷，如有问题，<span class="text-active" @click="openExternal(`${projectUrl}/issues`)">请点这里</span></div>
    </div>
  </a-modal>
</template>

<script>
const packageInfo = require('../../package.json')
export default {
  data () {
    return {
      visible: false,
      projectName: '',
      version: '',
      projectUrl: 'https://github.com/blogwy/BilibiliVideoDownload'
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {
    this.projectName = packageInfo.name
    this.version = packageInfo.version
  },
  created () {},
  methods: {
    show () {
      this.visible = true
    },
    openExternal (url) {
      if (url) {
        window.ipcRenderer.send('open-external', url)
      }
    }
  }
}
</script>

<style scoped lang="less">
.user{
  .avatar{
    width: 150px;
    border: 1px solid #eeeeee;
    border-radius: 50%;
  }
}
</style>
