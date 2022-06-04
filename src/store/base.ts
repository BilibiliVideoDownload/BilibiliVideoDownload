import { defineStore } from 'pinia'

interface BaseData {
  loginStatus: 0 | 1 | 2,
  downloadingTaskCount: number,
  allowLogin: boolean
}

export const baseStore = defineStore('base', {
  state: () => {
    const base: BaseData = {
      // 登录状态 0: 游客 1：普通用户 2：大会员
      loginStatus: 0,
      // 当前正在下载任务数量
      downloadingTaskCount: 0,
      // 是否需要登录
      allowLogin: true
    }
    return base
  },
  getters: {},
  actions: {
    setLoginStatus (status: 0 | 1 | 2) {
      this.loginStatus = status
    },
    setdownloadingTaskCount (num: number) {
      this.downloadingTaskCount = num
    },
    reduceDownloadingTaskCount (count: number) {
      if (this.downloadingTaskCount) {
        this.downloadingTaskCount -= count
      }
    },
    addDownloadingTaskCount (count: number) {
      this.downloadingTaskCount += count
    },
    setAllowLogin (flag: boolean) {
      this.allowLogin = flag
    }
  }
})
