<template>
  <header :class="['title-bar', isBackground ? 'bg' : '']">
    <div class="block"></div>
    <div class="title">{{title}}</div>
    <div class="btn-group">
      <div v-if="getPlatform() !== 'mac' && isMinimizable" class="btn" @click="emit('onMinimize')">
        <svg version="1.1" aria-hidden="true" width="10" height="10" fill="currentColor">
          <path d="M 0,5 10,5 10,6 0,6 Z" />
        </svg>
      </div>
      <div v-if="getPlatform() !== 'mac' && isMaximizable" class="btn" @click="emit('onMaximize')">
        <svg version="1.1" aria-hidden="true" width="10" height="10" fill="currentColor">
          <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z" />
        </svg>
      </div>
      <div v-if="getPlatform() !== 'mac' && isClosable" class="btn btn-close" @click="emit('onClose')">
        <svg aria-hidden="true" version="1.1" width="10" height="10" fill="currentColor">
          <path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z" />
        </svg>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  isMinimizable: {
    type: Boolean,
    default: true
  },
  isMaximizable: {
    type: Boolean,
    default: true
  },
  isClosable: {
    type: Boolean,
    default: true
  },
  isBackground: {
    type: Boolean,
    default: true
  }
})

const {
  title,
  isMaximizable,
  isMinimizable,
  isClosable,
  isBackground
} = toRefs(props)

const emit = defineEmits(['onMinimize', 'onMaximize', 'onClose'])

const getPlatform = () => {
  if (/mac/i.test(navigator.userAgent)) return 'mac'
  if (/win/i.test(navigator.userAgent)) return 'win'
  if (/linux/i.test(navigator.userAgent)) return 'linux'
  return 'win'
}

</script>

<style scoped lang="less">
.title-bar{
  height: 28px;
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  &.bg{
    background: @primary-color;
  }
  .block,
  .title{
    width: 33.33%;
    text-align: center;
    color: @primary-color;
    font-weight: 800;
  }
  .btn-group{
    display: flex;
    width: 33.33%;
    height: 100%;
    cursor: pointer;
    justify-content: end;
    .btn,
    .btn-close{
      width: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-app-region: no-drag;
      &:hover{
        background: rgba(255, 255, 255, 0.3);
      }
    }
    .btn-close{
      &:hover{
        background: rgba(232, 17, 35, 1);
      }
    }
  }
}
</style>
