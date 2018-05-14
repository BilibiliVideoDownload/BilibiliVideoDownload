// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueProgressiveImage from 'vue-progressive-image'
import router from './router'
import '../node_modules/mdui/dist/css/mdui.css'
import '../node_modules/mdui/dist/js/mdui.js'
Vue.use(VueProgressiveImage)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
