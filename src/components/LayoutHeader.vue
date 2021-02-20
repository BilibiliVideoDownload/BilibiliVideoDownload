<template>
  <div class="header fr ac jc">
    {{projectName}}
    <div class="icons">
      <a-icon class="icon icon1" @click="close" type="close" />
      <a-icon class="icon icon2 ml8" @click="min" type="minus" />
    </div>
  </div>
</template>

<script>
const info = require('../../package.json')
export default {
  data () {
    return {
      projectName: info.name
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {},
  created () {},
  methods: {
    close () {
      window.ipcRenderer.send('open-close-dialog', 'hello')
    },
    min () {
      const win = window.remote.getCurrentWindow()
      win.minimize()
    }
  }
}
</script>

<style scoped lang="less">
.header{
  position: relative;
  box-sizing: border-box;
  height: 28px;
  -webkit-app-region: drag;
  color: @primary-color;
  font-weight: bold;
  .icons{
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    z-index: 1000;
    -webkit-app-region: no-drag;
    .icon{
      border-radius: 50%;
      font-size: 10px;
      font-weight: bold;
      padding: 2px;
      &.icon1{
        background: rgb(223, 96, 88);
        color: rgb(223, 96, 88);
      }
      &.icon2{
        background: rgb(237, 186, 63);
        color: rgb(237, 186, 63);
      }
      &:hover{
        &.icon1{
          color: rgb(27, 27, 27);
        }
        &.icon2{
          color: rgb(27, 27, 27);
        }
      }
    }
  }
}
</style>
