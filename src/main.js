import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import './assets/style/main.less'
const { ipcRenderer, remote } = require('electron')

Vue.config.productionTip = false
Vue.use(antd)
window.ipcRenderer = ipcRenderer
window.remote = remote

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
