import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 登录状态 0: 未登录 1：普通会员 2：大会员
    loginStatus: 0,
    // 是否显示登录弹窗
    showLoginModal: true,
    // 当前正在下载任务数量
    downloadingTask: 0
  },
  mutations: {
    setLoginStatus (state, data) {
      state.loginStatus = data
    },
    setShowLoginModal (state, data) {
      state.showLoginModal = data
    },
    setDownloadingTask (state, data) {
      state.downloadingTask = data
    },
    reduceDownloadingTask (state, data) {
      if (state.downloadingTask) {
        state.downloadingTask -= data
      }
    },
    addDownloadingTask (state, data) {
      state.downloadingTask += data
    }
  },
  actions: {
  },
  modules: {
  }
})
