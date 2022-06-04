import { VideoData, SettingData, TaskData } from '../../type'

export const videoData: VideoData = {
  id: '',
  title: '',
  url: '',
  bvid: '',
  cid: -1,
  cover: '',
  createdTime: -1,
  quality: -1,
  view: -1,
  danmaku: -1,
  reply: -1,
  duration: '',
  up: [],
  qualityOptions: [],
  page: [],
  subtitle: [],
  video: [],
  audio: [],
  filePathList: [],
  fileDir: '',
  size: -1,
  downloadUrl: {
    audio: '',
    video: ''
  }
}

export const settingData: SettingData = {
  downloadPath: '',
  SESSDATA: '',
  isMerge: true,
  isDelete: true,
  bfeId: '',
  isSubtitle: true,
  isDanmaku: true,
  isFolder: true,
  isCover: true,
  downloadingMaxSize: 5
}

export const taskData: TaskData = {
  ...videoData,
  status: -1,
  progress: -1
}