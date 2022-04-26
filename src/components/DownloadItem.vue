<template>
  <div
    :class="['fr', 'download-item', selected.includes(index) ? 'active' : '']"
    @click.left.exact="switchItem(index)"
    @click.shift.exact="multiSelect(index)"
    @click.right="showContextmenu(index)"
  >
    <div class="img fr ac">
      <img :src="source.cover" :alt="source.title" />
    </div>
    <div class="content fc jsb">
      <div class="ellipsis-1">{{ source.title }}</div>
      <div>
        状态：<span class="text-active">{{
          source.status | formatProgress
        }}</span>
      </div>
      <div>
        <a-progress
          :percent="source.progress"
          :status="source.status | formatStatus"
          strokeColor="#fb7299"
        ></a-progress>
      </div>
    </div>
  </div>
</template>
<script>
import taskStatus from '../assets/data/status'
export default {
  props: {
    index: {
      type: Number
    },
    source: {
      type: Object,
      default () {
        return {}
      }
    },
    selected: {
      type: Array,
      default () {
        return []
      }
    },
    switchItem: {
      type: Function,
      default () {
        return () => {}
      }
    },
    showContextmenu: {
      type: Function,
      default () {
        return () => {}
      }
    },
    multiSelect: {
      type: Function,
      default () {
        return () => {}
      }
    }
  },
  filters: {
    formatStatus (status) {
      return taskStatus[status]['value']
    },
    formatProgress (status) {
      return taskStatus[status]['label']
    }
  }
}
</script>

<style scoped lang="less">
  .download-item {
    border-bottom: 1px solid #eeeeee;
    cursor: pointer;
    &.active {
      background: rgba(251, 114, 153, 0.2);
    }
    .img {
      flex: none;
      width: 106px;
      height: 79px;
      overflow: hidden;
      position: relative;
      img {
        display: block;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .content {
      box-sizing: border-box;
      flex: none;
      width: 364px;
      padding: 8px;
    }
  }
</style>
