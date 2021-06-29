import LoginModal from './LoginModal'
const obj = {}
obj.install = function (Vue) {
  const UpdateContry = Vue.extend(LoginModal)
  const loginModal = new UpdateContry()
  loginModal.$mount(document.createElement('div'))
  document.body.appendChild(loginModal.$el)
  Vue.prototype.$loginModal = loginModal
}
export default obj
