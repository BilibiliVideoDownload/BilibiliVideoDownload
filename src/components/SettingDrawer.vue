<template>
  <a-drawer
    title="设置"
    :width="320"
    :visible="visible"
    :closable="false"
    wrapClassName="custom-drawer-scroll-bar"
    @close="hide">
    <a-form :form="form">
      <a-form-item
        v-for="(item, index) in formConfig"
        :key="index"
        :labelCol="item.full ? { span: 24, offset: 0 } : formItemLayout.labelCol"
        :wrapperCol="item.full ? { span: 24, offset: 0 } : formItemLayout.wrapperCol"
        :class="`${item.full ? 'is-full' : ''}`">
        <span slot="label">
          {{ item.label }}
          <a-tooltip>
            <template slot="title">
              {{ item.tips }} <a v-if="item.label === 'SESSDATA'" @click="openExternal('https://blog.wangyu.link/2020/01/25/2020-01-25/')">查看</a>
            </template>
            <a-icon type="info-circle" style="font-size: 12px;display: inline-block;margin-left: 4px;" />
          </a-tooltip>
        </span>
        <div v-if="item.type === 'downloadPath'" id="customInput">
          <a-input v-decorator="item.decorator" :placeholder="item.placeholder" class="custom-input" @click="openFolder">
            <a-icon slot="suffix" type="folder" style="color: rgba(0,0,0,.45)" />
          </a-input>
        </div>
        <a-slider v-if="item.type === 'slider'" :max="5" :min="1" v-decorator="item.decorator" />
        <a-input v-if="item.type === 'input'" v-decorator="item.decorator" :placeholder="item.placeholder"></a-input>
        <a-switch v-if="item.type === 'switch'" v-decorator="item.decorator" />
        <div v-if="item.type === 'status'">
          <span :class="['dot', statusText === '未登录' ? 'offline' : 'line']"></span>
          {{ statusText }}
          <a-icon v-if="statusText === '未登录'" type="login" @click="$refs.loginModal.openLoginModal()" />
          <a-popconfirm
            v-if="statusText !== '未登录'"
            title="你确定要退出登录吗?"
            ok-text="是"
            cancel-text="否"
            @confirm="logout"
          >
            <a-icon type="logout" />
          </a-popconfirm>
          <a-input v-show="false" v-decorator="item.decorator"></a-input>
        </div>
      </a-form-item>
    </a-form>
    <!-- <div class="custom-drawer-footer-placeholder"></div> -->
    <LoginModal ref="loginModal" />
  </a-drawer>
</template>

<script>
import base from '../mixin/base'
import { formConfig } from '../assets/data/setting'
import { checkLogin } from '../core/bilibili'
export default {
  mixins: [base],
  data () {
    return {
      visible: false,
      form: this.$form.createForm(this),
      formConfig,
      formItemLayout: {
        labelCol: { span: 7, offset: 0 },
        wrapperCol: { span: 16, offset: 1 }
      },
      statusText: '未登录',
      mapStatus: ['未登录', '普通会员', '大会员']
    }
  },
  components: {},
  computed: {},
  watch: {
    '$store.state.loginStatus' (val) {
      if (typeof val === 'number') {
        this.statusText = this.mapStatus[val]
        // 表单重新赋值
        const setting = this.store.get('setting')
        setTimeout(() => {
          this.form.setFieldsValue(setting)
        }, 300)
      }
    }
  },
  mounted () {
    window.ipcRenderer.on('dir-dialog-reply', (event, arg) => {
      if (!arg.canceled) {
        this.form.setFieldsValue({
          downloadPath: arg.filePaths[0]
        })
      }
    })
  },
  created () {},
  methods: {
    openExternal (url) {
      if (url) {
        window.ipcRenderer.send('open-external', url)
      }
    },
    hide () {
      this.form.validateFields((error, values) => {
        if (!error) {
          this.store.set('setting', values)
          this.visible = false
          this.form.resetFields()
        }
      })
    },
    async show (info) {
      if (info) {
        setTimeout(() => {
          this.form.setFieldsValue(info)
        }, 300)
      }
      const status = await checkLogin()
      this.statusText = this.mapStatus[status]
      this.$store.commit('setLoginStatus', status)
      this.visible = true
      // input设置readOnly
      this.$nextTick(() => {
        document.getElementById('customInput').childNodes[0].childNodes[0].setAttribute('readOnly', true)
      })
    },
    openFolder () {
      window.ipcRenderer.send('open-dir-dialog', 'open')
    },
    logout () {
      this.form.validateFields(async (error, values) => {
        if (!error) {
          values.SESSDATA = null
          this.store.set('setting', values)
          const status = await checkLogin()
          this.$store.commit('setLoginStatus', status)
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.custom-input{
  /deep/ .ant-input{
    cursor: pointer;
  }
}
</style>
