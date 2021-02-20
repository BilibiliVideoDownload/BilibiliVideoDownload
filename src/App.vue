<template>
  <div id="app">
    <LayoutHeader></LayoutHeader>
    <router-view></router-view>
    <div class="bg">
      <img :src="wallpaper" alt="" ref="img">
    </div>
    <div class="setting" v-if="$route.path === '/'">
      <a-icon type="setting" class="icon" @click="openSetting" />
    </div>
    <div class="user" v-if="$route.path === '/'">
      <a-icon type="user" class="icon" @click="openUser"/>
    </div>
    <SettingDrawer ref="settingDrawer"></SettingDrawer>
    <UserModal ref="userModal"></UserModal>
  </div>
</template>

<script>
import LayoutHeader from './components/LayoutHeader'
import SettingDrawer from './components/SettingDrawer'
import UserModal from './components/UserModal'
export default {
  data () {
    return {
      wallpaper: require('./assets/images/bg.png')
    }
  },
  components: {
    LayoutHeader,
    SettingDrawer,
    UserModal
  },
  computed: {},
  watch: {},
  mounted () {},
  created () {},
  methods: {
    openSetting () {
      const setting = window.remote.getGlobal('store').get('setting')
      this.$refs.settingDrawer.show(setting)
    },
    openUser () {
      this.$refs.userModal.show()
    }
  }
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
  .bg{
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    z-index: -1;
    img{
      width: 100%;
      height: 100%;
    }
  }
  .setting{
    position: absolute;
    left: 16px;
    bottom: 16px;
    z-index: 100;
    color: @primary-color;
    font-size: 16px;
  }
  .user{
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 100;
    color: @primary-color;
    font-size: 16px;
  }
}
</style>
