<template>
  <a-config-provider :locale="zh_CN">
    <div id="app">
      <LayoutHeader />
      <router-view></router-view>
    </div>
  </a-config-provider>
</template>

<script>
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
import LayoutHeader from './components/LayoutHeader'
export default {
  data () {
    return {
      wallpaper: require('./assets/images/bg.png'),
      zh_CN
    }
  },
  components: {
    LayoutHeader
  },
  computed: {},
  watch: {},
  mounted () {
    // 检查更新
    this.$checkUpdate.checkUpdate()
  },
  created () {},
  methods: {}
}
</script>

<style lang="less">
#app {
  position: relative;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  user-select: none;
  background-image: url('./assets/images/bg.png');
  background-size: 100% 100%;
}
</style>
