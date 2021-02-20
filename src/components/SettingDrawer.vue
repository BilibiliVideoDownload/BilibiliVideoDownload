<template>
  <a-drawer
    title="设置"
    :width="320"
    :visible="visible"
    :closable="false"
    @close="hide">
    <a-form :form="form">
      <a-form-item
        v-for="(item, index) in settingConfig"
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
        <a-input v-if="item.type === 'input'" v-decorator="item.decorator" :placeholder="item.placeholder"></a-input>
        <a-switch v-if="item.type === 'switch'" v-decorator="item.decorator" />
      </a-form-item>
    </a-form>
    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }"
    >
      <a-button :style="{ marginRight: '8px' }" @click="hide">
        取消
      </a-button>
      <a-button type="primary" @click="save">
        保存
      </a-button>
    </div>
  </a-drawer>
</template>

<script>
import settingConfig from '../assets/data/setting'
export default {
  data () {
    return {
      visible: false,
      form: this.$form.createForm(this),
      settingConfig,
      formItemLayout: {
        labelCol: { span: 7, offset: 0 },
        wrapperCol: { span: 16, offset: 1 }
      }
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {
    window.ipcRenderer.on('dir-dialog-reply', (event, arg) => {
      console.log(arg)
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
      this.visible = false
      this.form.resetFields()
    },
    show (info) {
      if (info) {
        setTimeout(() => {
          this.form.setFieldsValue(info)
        }, 300)
      }
      this.visible = true
      // input设置readOnly
      this.$nextTick(() => {
        document.getElementById('customInput').childNodes[0].childNodes[0].setAttribute('readOnly', true)
      })
    },
    save () {
      this.form.validateFields((error, values) => {
        if (!error) {
          console.log(values)
          window.remote.getGlobal('store').set('setting', values)
          this.hide()
        }
      })
    },
    openFolder () {
      console.log('openFolder')
      window.ipcRenderer.send('open-dir-dialog', 'open')
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
