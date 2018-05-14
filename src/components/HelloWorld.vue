<template>
  <div class="mdui-container">
    <div class="mdui-row">
      <div class="mdui-col-xs-12 mdui-col-sm-6 mdui-col-offset-sm-2">
        <div class="mdui-textfield">
          <input class="mdui-textfield-input" type="text" v-model="avNum" placeholder="请输入AV号"/>
        </div>
      </div>
      <div class="mdui-col-xs-6 mdui-col-sm-2 mdui-text-right">
        <div class="mdui-textfield">
          <button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" @click="getInfo">下载</button>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  import axios from 'axios'
  import result from './Result.vue'
  import mdui from 'mdui'
export default {
  name: 'HelloWorld',
  components: {
    'w-result': result
  },
  data () {
    return {
      avNum: ''
    }
  },
  mounted(){

  },
  methods: {
    getInfo(){
      let that = this;
      mdui.prompt('请输入文本',
        function (value) {
          mdui.alert('你输入了：' + value + '，点击了确认按钮');
        },
        function (value) {
          mdui.alert('你输入了：' + value + '，点击了取消按钮');
        },
        {
          confirmText: '确定',
          cancelText: '取消'
        }
      );
//      axios.get()
//        .then(res => {
//          console.log(res);
//
//        })
//        .catch(error => {
//          console.log(error);
//        })
    }
  }
}
</script>

<style scoped>

</style>
