export default [
  {
    label: '下载地址',
    placeholder: '请设置下载地址',
    type: 'downloadPath',
    decorator: ['downloadPath', { rules: [{ required: true, message: '请设置下载地址' }] }],
    tips: '没有设置下载地址不能下载',
    full: true
  },
  {
    label: 'SESSDATA',
    placeholder: '请填写SESSDATA',
    type: 'input',
    decorator: ['SESSDATA', { rules: [{ required: true, message: '请填写SESSDATA' }] }],
    tips: '设置SESSDATA教程：',
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
  }
]
