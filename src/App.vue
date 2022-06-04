<template>
  <a-config-provider :locale="zhCN">
    <TitleBar
      title="BilibiliVideoDownload"
      :isBackground="false"
      :isMinimizable="true"
      :isMaximizable="false"
      @onClose="onClose"
      @onMinimize="onMinimize"
    />
    <TabBar />
    <CheckUpdate ref="checkUpdate" />
    <router-view/>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TitleBar from './components/TitleBar/index.vue'
import TabBar from './components/TabBar/index.vue'
import CheckUpdate from './components/CheckUpdate/index.vue'
import zh_CN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { pinia, store } from './store'
import { checkLogin, addDownload } from './core/bilibili'
import { downloadDanmaku } from './core/danmaku'
import { SettingData, TaskData, TaskList } from './type'
import { sleep } from './utils'

dayjs.locale('zh-cn')
const zhCN = ref(zh_CN)
const checkUpdate = ref<any>(null)

const onMinimize = () => {
  window.electron.minimizeApp()
}

const onClose = () => {
  window.electron.closeApp()
}

onMounted(() => {
  // 初始化pinia数据
  window.electron.once('init-store', async ({ setting, taskList }: { setting: SettingData, taskList: TaskData[] }) => {
    store.settingStore(pinia).setSetting(setting)
    const loginStatus = await checkLogin(store.settingStore(pinia).SESSDATA)
    store.baseStore(pinia).setLoginStatus(loginStatus)
    const taskMap: TaskList = new Map()
    for (const key in taskList) {
      const task = taskList[key]
      taskMap.set(task.id, task)
    }
    store.taskStore(pinia).setTaskList(taskMap)
    const taskId = store.taskStore(pinia).taskListArray[0] ? store.taskStore(pinia).taskListArray[0][0] : ''
    if (taskId) store.taskStore(pinia).setRightTaskId(taskId)
  })
  // 监听下载进度
  window.electron.on('download-video-status', async ({ id, status, progress }: { id: string, status: number, progress: number }) => {
    const task = store.taskStore(pinia).getTask(id) ? JSON.parse(JSON.stringify(store.taskStore(pinia).getTask(id))) : null
    // 成功和失败 更新 pinia electron-store，减少正在下载数；检查taskList是否有等待中任务，有则下载
    if (task && (status === 0 || status === 5)) {
      window.log.info(`${id} ${status}`)
      let size = -1
      if (status === 0) {
        size = await window.electron.getVideoSize(id)
      }
      store.taskStore(pinia).setTask([{ ...task, status, progress, size }])
      store.baseStore(pinia).reduceDownloadingTaskCount(1)
      // 检查下载
      const taskList = store.taskStore(pinia).taskList
      let allowDownload: TaskData[] = []
      taskList.forEach((value) => {
        if (value.status === 4) allowDownload.push(JSON.parse(JSON.stringify(value)))
      })
      allowDownload = addDownload(allowDownload)
      let count = 0
      for (const key in allowDownload) {
        const item = allowDownload[key]
        if (item.status === 1) {
          window.electron.downloadVideo(item)
          count += 1
        }
        await sleep(300)
      }
      store.baseStore(pinia).addDownloadingTaskCount(count)
    }
    // 视频下载中 音频下载中 合成中 只更新pinia
    if (task && (status === 1 || status === 2 || status === 3)) {
      store.taskStore(pinia).setTaskEasy([{ ...task, status, progress }])
    }
  })
  // 下载弹幕
  window.electron.on('download-danmuku', (cid: number, title: string, path: string) => {
    downloadDanmaku(cid, title, path)
  })
  // 检查软件更新
  checkUpdate.value.checkUpdate()
})
</script>

<style lang="less" scoped>
</style>
