const Store = require('electron-store')
const store = new Store()

const getStore = key => {
  return store.get(key)
}

const setStore = (key, value) => {
  store.set(key, value)
}

const deleteStore = key => {
  store.delete(key)
}

export {
  getStore,
  setStore,
  deleteStore
}