import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import './assets/style/main.less'
Vue.use(antd)

const { ipcRenderer, remote } = require('electron')
window.ipcRenderer = ipcRenderer
window.remote = remote

// checkUpdate checkLogin 组件中用到了ipcRenderer所以需放到其引入下面
import checkUpdate from './components/CheckUpdate/index'
import LoginModal from './components/LoginModal/LoginModal'
import UserModal from './components/UserModal'
Vue.use(checkUpdate)
Vue.component('LoginModal', LoginModal)
Vue.component('UserModal', UserModal)

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
