import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loginStatus: 0,
    showLoginModal: true
  },
  mutations: {
    setLoginStatus (state, data) {
      state.loginStatus = data
    },
    setShowLoginModal (state, data) {
      state.showLoginModal = data
    }
  },
  actions: {
  },
  modules: {
  }
})
