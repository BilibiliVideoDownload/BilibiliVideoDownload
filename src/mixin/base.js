
export default {
  data: () => ({
    got: window.remote.getGlobal('got'),
    store: window.remote.getGlobal('store')
  })
}
