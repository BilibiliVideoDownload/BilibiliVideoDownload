import { createPinia, Pinia } from 'pinia'
import { baseStore } from './base'
import { settingStore } from './setting'
import { taskStore } from './task'

export const pinia = createPinia()

// 组件内使用不需要传pinia，组件外使用需要传pinia
export const store = {
  baseStore: (pinia?: Pinia) => baseStore(pinia),
  settingStore: (pinia?: Pinia) => settingStore(pinia),
  taskStore: (pinia?: Pinia) => taskStore(pinia)
}
