<template>
  <a-modal
    wrapClassName="custom-modal-padding"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ disabled: !(quality !== -1 && selected.length !== 0) }"
    :closable="false"
    :maskClosable="false"
    title="当前视频信息"
    okText="下载"
    cancelText="取消"
    @cancel="cancel"
    @ok="handleDownload">
    <div class="video-modal custom-scroll-bar">
      <div class="video-info fr">
        <div class="image">
          <a-image :src="videoInfo.cover" />
        </div>
        <div class="content fc jsa pl16">
          <div class="text-active ellipsis-2" @click="openBrowser(videoInfo.url)">{{ videoInfo.title }}</div>
          <div class="ellipsis-1">up：<span v-for="(item, index) in videoInfo.up" :key="index" class="text-active mr8" @click="openBrowser(`https://space.bilibili.com/${item.mid}`)">{{item.name}}</span></div>
        </div>
      </div>
      <div class="mt16">
        选择清晰度：
        <div class="mt8">
          <a-radio-group v-model:value="quality">
            <a-radio class="custom-radio" v-for="(item, index) in videoInfo.qualityOptions" :key="index" :value="item.value">
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
            <template #title>
              {{ item.title }}
            </template>
            <span class="ellipsis-1">{{ item.title }}</span>
          </a-tooltip>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../../store'
import { getDownloadList, addDownload } from '../../core/bilibili'
import { userQuality } from '../../assets/data/quality'
import { VideoData } from '../../type'
import { videoData } from '../../assets/data/default'
import { sleep } from '../../utils'

const visible = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
const quality = ref<number>(-1)
const videoInfo = ref<VideoData>(videoData)
const selected = ref<number[]>([])
const allSelected = ref<boolean>(false)
const router = useRouter()

const cancel = () => {
  visible.value = false
  confirmLoading.value = false
  quality.value = -1
  selected.value = []
}

const handleDownload = async () => {
  confirmLoading.value = true
  // 获取当前选中视频的下载数据
  const list = await getDownloadList(toRaw(videoInfo.value), toRaw(selected.value), quality.value)
  console.log(list)
  const taskList = addDownload(list)
  store.taskStore().setTask(taskList)
  let count = 0
  let selectedTask = ''
  for (const key in taskList) {
    const task = taskList[key]
    if (task.status === 1) {
      window.electron.downloadVideo(task)
      count += 1
      if (!selectedTask) selectedTask = task.id
    }
    await sleep(300)
  }
  store.baseStore().addDownloadingTaskCount(count)
  confirmLoading.value = false
  visible.value = false
  store.taskStore().setRightTaskId(selectedTask)
  router.push({ name: 'download' })
}

const open = (data: VideoData) => {
  const quality = userQuality[store.baseStore().loginStatus]
  data.qualityOptions.filter((item: any) => quality.includes(item.value))
  videoInfo.value = data
  visible.value = true
  // 如果是单p，则默认选中
  if (videoInfo.value.page.length === 1) {
    selected.value.push(videoInfo.value.page[0].page)
  }
}

const onAllSelectedChange = (e: any) => {
  allSelected.value = e.target.checked
  selected.value = []
  if (e.target.checked) {
    videoInfo.value.page.forEach((element: any) => {
      selected.value.push(element.page)
    })
  }
}

const toggle = (page: number) => {
  const index = selected.value.indexOf(page)
  if (index === -1) {
    selected.value.push(page)
  } else {
    selected.value.splice(index, 1)
  }
}

const openBrowser = (url: string) => {
  window.electron.openBrowser(url)
}

defineExpose({
  open
})

</script>

<style scoped lang="less">
.video-modal{
  height: 260px;
  overflow-y: overlay;
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
