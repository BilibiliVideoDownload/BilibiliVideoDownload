export interface SettingData {
  downloadPath: string,
  SESSDATA: string,
  isMerge: boolean,
  isDelete: boolean,
  bfeId: string,
  isSubtitle: boolean,
  isDanmaku: boolean,
  isFolder: boolean,
  isCover: boolean,
  downloadingMaxSize: number
}

export interface SettingDataEasy {
  downloadPath?: string,
  SESSDATA?: string,
  isMerge?: boolean,
  isDelete?: boolean,
  bfeId?: string,
  isSubtitle?: boolean,
  isDanmaku?: boolean,
  isFolder?: boolean,
  downloadingMaxSize?: number
}

export enum LoginStatus {
  visitor,
  user,
  vip
}

export interface UP {
  name: string,
  mid: number
}

export interface QualityItem {
  label: string,
  value: number
}

export interface Page {
  title: string,
  url: string,
  bvid: string,
  cid: number,
  duration: string,
  page: number
}

export interface Subtitle {
  title: string,
  url: string
}

export interface Video {
  id: number,
  cid: number,
  url: string
}

export interface Audio {
  id: number,
  cid: number,
  url: string
}

export interface DownloadUrl {
  video: string,
  audio: string
}

export interface VideoData {
  id: string,
  title: string,
  url: string,
  bvid: string,
  cid: number,
  cover: string,
  createdTime: number,
  quality: number,
  view: number,
  danmaku: number,
  reply: number,
  duration: string,
  up: UP[],
  qualityOptions: QualityItem[],
  page: Page[],
  subtitle: Subtitle[],
  video: Video[],
  audio: Audio[],
  filePathList: string[],
  fileDir: string,
  size: number,
  downloadUrl: DownloadUrl
}

export interface TaskData extends VideoData {
  status: number,
  progress: number
}

export type TaskList = Map<string, TaskData>