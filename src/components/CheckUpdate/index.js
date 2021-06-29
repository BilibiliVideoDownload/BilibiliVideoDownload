import CheckUpdate from './CheckUpdate'
const obj = {}
obj.install = function (Vue) {
  const UpdateContry = Vue.extend(CheckUpdate)
  const checkUpdate = new UpdateContry()
  checkUpdate.$mount(document.createElement('div'))
  document.body.appendChild(checkUpdate.$el)
  Vue.prototype.$checkUpdate = checkUpdate
}
export default obj
