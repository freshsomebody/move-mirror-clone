<template>
  <div class="cameraAndSkeleton">
    <h3 v-if="!isVideoStreamReadyRef">
      Initializing camera...
    </h3>
    <h3 v-if="!isPosenetModelReadyRef">
      Loading model...
    </h3>
    <h3
      v-if="initError"
      class="error"
    >
      {{ initError }}
    </h3>

    <video ref="video" autoplay />
    <canvas id="skeletonOutput" ref="skeletonOutput" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from '@vue/composition-api'
import useWebcamStream from '@/composition-functions/useWebcamStream'
import usePoseNetEstimation from '@/composition-functions/usePoseNetEstimation'
import useSkeletonDraw from '@/composition-functions/useSkeletonDraw'

export default defineComponent({
  setup (props, { emit }) {
    const { isVideoStreamReadyRef, initWebcamStream } = useWebcamStream()
    const { isPosenetModelReadyRef, loadPosenetModel, poseRef, posenetInferenceConfigRef, normalizedPoseRef, detectPoseInRealTime } = usePoseNetEstimation()
    const { drawPose } = useSkeletonDraw()

    const video = ref(null) // video DOM refs
    const skeletonOutput = ref(null) // canvas DOM refs
    const net = ref(null) // PoseNet Model
    const initError = ref(null)

    // Width and height of video and canvas need to be set to
    //  estimate and draw skeleton correctly
    const frameWidth = ref(0) // width of video and canvas
    const frameHeight = ref(0) // height of video and canvas
    const setFrameSize = () => {
      frameWidth.value = video.value.clientWidth
      frameHeight.value = video.value.clientHeight

      video.value.width = frameWidth.value
      video.value.height = frameHeight.value

      skeletonOutput.value.width = frameWidth.value
      skeletonOutput.value.height = frameHeight.value
    }

    onMounted(async () => {
      try {
        const initResolves = await Promise.all([
          initWebcamStream(video.value),
          loadPosenetModel()
        ])

        net.value = initResolves[1]

        window.addEventListener('resize', setFrameSize)
        setFrameSize()

        posenetInferenceConfigRef.value.flipHorizontal = true
        detectPoseInRealTime(video.value, net.value)
      } catch (error) {
        initError.value = error
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', setFrameSize)
    })

    watch(() => {
      // If a pose is estimated by PoseNet
      // => Draw the skeleton
      if (poseRef.value && skeletonOutput.value) {
        const ctx = skeletonOutput.value.getContext('2d')
        ctx.clearRect(0, 0, frameWidth.value, frameHeight.value)
        drawPose(poseRef.value, ctx)
      }

      // If a pose is normalized
      // => emit a predict event with normalized value
      if (normalizedPoseRef.value) {
        emit('predict', normalizedPoseRef.value)
      }
    })

    return {
      video,
      skeletonOutput,
      isVideoStreamReadyRef,
      isPosenetModelReadyRef,
      initError
    }
  }
})
</script>

<style lang="scss" scoped>
.cameraAndSkeleton {
  position: relative;
  width: 100%;
  height: 100%;
}

video, canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

video {
  // Flip video horizontally
  transform: scaleX(-1);
}

.error {
  color: red;
}
</style>
