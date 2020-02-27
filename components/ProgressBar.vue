<template>
  <div class="progressBar">
    <div
      :style="{ width: progressPercentage }"
      class="progress"
    />

    <b class="message">
      {{ progressMessage }}
    </b>

    <b v-if="taskCount" class="message">
      {{ `${finishedTaskCount} / ${totalTaskCount}` }}
    </b>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'

export default {
  props: {
    totalTaskCount: {
      type: Number,
      default: 1
    },
    finishedTaskCount: {
      type: Number,
      default: 0
    },
    progressMessage: {
      type: String,
      default: ''
    },
    taskCount: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const progressPercentage = computed(() => {
      const percentage = props.finishedTaskCount / props.totalTaskCount
      return `${percentage * 100}%`
    })

    return { progressPercentage }
  }
}
</script>

<style lang="scss" scoped>
.progressBar {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 32px;

  border: 1px solid gray;
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: red;
}

.message {
  z-index: 1;
  padding: 8px;
}
</style>
