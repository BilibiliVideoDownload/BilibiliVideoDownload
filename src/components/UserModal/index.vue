<template>
  <a-modal
    v-model:visible="visible"
    :closable="true"
    :footer="null">
    <div class="user fc ac">
      <img src="../../assets/images/user.png" alt="" class="avatar">
      <div class="version mt16">
        {{ `${projectName} - v${version}` }} <ReloadOutlined @click="checkUpdate.checkUpdate()" />
      </div>
      <div class="git mt16">项目地址：<span class="text-active" @click="openBrowser(projectUrl)">{{ projectUrl }}</span></div>
      <div class="desc mt16">个人作品，代码稀烂，大佬轻喷，如有问题，<span class="text-active" @click="openBrowser(`${projectUrl}/issues`)">请点这里</span></div>
    </div>
  </a-modal>
  <CheckUpdate ref="checkUpdate" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import CheckUpdate from '../CheckUpdate/index.vue'

const checkUpdate = ref<any>(null)
const packageInfo = require('../../../package.json')
const visible = ref<boolean>(false)
const projectName = ref<string>(packageInfo.name)
const version = ref<string>(packageInfo.version)
const projectUrl = ref<string>(packageInfo.homepage)

const toogleVisible = () => {
  visible.value = !visible.value
}
const openBrowser = (url: string):void => {
  window.electron.openBrowser(url)
}
defineExpose({
  toogleVisible
})
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
