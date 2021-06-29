const formConfig = [
  {
    label: '登录状态',
    placeholder: '请填写SESSDATA',
    type: 'status',
    decorator: ['SESSDATA', { rules: [{ required: false, message: '请填写SESSDATA' }] }],
    tips: '登录后账号是普通账号最大下载1080P视频，大会员可以下载4K视频，不登录最大下载480P视频',
    full: true
  },
  {
    label: '下载地址',
    placeholder: '请设置下载地址',
    type: 'downloadPath',
    decorator: ['downloadPath', { rules: [{ required: true, message: '请设置下载地址' }] }],
    tips: '没有设置下载地址不能下载',
    full: true
  },
  {
    label: '下载成功后是否进行转码合并',
    type: 'switch',
    decorator: ['isMerge', { rules: [{ required: false }], valuePropName: 'checked' }],
    tips: '下载的源文件是音视频分离的m4s文件，故需要合并',
    full: true
  },
  {
    label: '下载成功后是否删除原视频',
    type: 'switch',
    decorator: ['isDelete', { rules: [{ required: false }], valuePropName: 'checked' }],
    tips: '删除合并前的m4s文件',
    full: true
  },
  {
    label: '下载字幕',
    type: 'switch',
    decorator: ['isSubtitle', { rules: [{ required: false }], valuePropName: 'checked' }],
    tips: '开启后如果检测到当前下载视频有字幕则会下载',
    full: true
  }
]

const settingStore = {
  downloadPath: '',
  SESSDATA: null,
  isMerge: true,
  isDelete: true,
  bfe_id: null,
  isSubtitle: true
}

export {
  settingStore,
  formConfig
}
