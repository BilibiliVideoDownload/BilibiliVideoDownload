<template>
  <div class="tab">
    <download-outlined v-if="routeName === 'home'" :style="{fontSize: '36px'}" @click="goRouter(routeName)" />
    <rollback-outlined v-if="routeName === 'download'" :style="{fontSize: '36px'}" @click="goRouter(routeName)" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DownloadOutlined, RollbackOutlined } from '@ant-design/icons-vue'
const route = useRoute()
const router = useRouter()
const routeName = ref<string>('')
watch(() => route.name, (name) => {
  if (typeof name === 'string') {
    routeName.value = name
  }
}, { immediate: true })

const goRouter = (name: string): void => {
  router.push({ name: name === 'home' ? 'download' : 'home' })
}
</script>

<style scoped lang="less">
.tab{
  position: absolute;
  top: 38px;
  right: 8px;
  z-index: 99;
  cursor: pointer;
  color: @primary-color;
}
</style>
