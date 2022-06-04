<template>
  <a-modal
    :visible="visible"
    title="有新版本了"
    okText="更新"
    cancelText="取消"
    @cancel="cancel"
    @ok="handleOk">
    <p>检查到新版本<a>v{{ newVersion }}</a>，当前版本<a>v{{ oldVersion }}</a>，安装新版本前请先卸载旧版本！</p>
    <p>更新内容：{{ updateContent }}</p>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
const packageInfo = require('../../../package.json')

const visible = ref<boolean>(false)
const newVersion = ref<string>('')
const oldVersion = ref<string>(packageInfo.version)
const updateContent = ref<string>('')
const url = ref<string>('')

const cancel = () => {
  visible.value = false
}

const handleOk = () => {
  console.log('handleOk')
  window.electron.openBrowser(url.value)
  visible.value = false
}

const checkUpdate = async () => {
  try {
    const { body } = await window.electron.got('https://api.github.com/repos/blogwy/BilibiliVideoDownload/releases/latest', { responseType: 'json' })
    newVersion.value = body.tag_name.substr(1)
    url.value = body.html_url
    updateContent.value = body.body
    const newVersionArray = body.tag_name.substr(1).split('.').map((item: any) => Number(item))
    const oldVersionArray = oldVersion.value.split('.').map(item => Number(item))
    if (newVersionArray[0] > oldVersionArray[0]) {
      visible.value = true
      return
    }
    if (newVersionArray[1] > oldVersionArray[1]) {
      visible.value = true
      return
    }
    if (newVersionArray[2] > oldVersionArray[2]) {
      visible.value = true
    }
  } catch (error) {
    message.error(`检查更新失败：${error}`)
  }
}

defineExpose({
  checkUpdate
})
</script>

<style scoped lang="less"></style>
