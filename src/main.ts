import { createApp } from 'vue'
import { pinia } from './store'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import './assets/style/main.less'

const app = createApp(App)
app.use(router)
app.use(Antd)
app.use(pinia)
app.mount('#app')
