<template>
  <div class="cameraAndSkeleton">
    <h3 v-if="!isVideoStreamReady">
      Initializing camera...
    </h3>
    <h3 v-if="!isPosenetModelReady">
      Loading model...
    </h3>
    <h3
      v-if="initError"
      class="error"
    >
      {{ initError }}
    </h3>

    <video ref="video" autoplay />
    <canvas ref="skeletonOutput" />
  </div>
</template>

<script>
import * as Posenet from '@tensorflow-models/posenet'
import { vectorizeAndNormalize } from 'posenet-similarity'
import PosenetMixin from '@/mixins/posenet.mixin'

export default {
  mixins: [
    PosenetMixin
  ],

  data () {
    return {
      // States of initialization
      isVideoStreamReady: false,
      isPosenetModelReady: false,
      initError: null,

      video: null, // <video> ref
      net: null, // Posenet model

      // width and height of video and canvas
      frameWidth: 0,
      frameHeight: 0,

      // override posenetInferenceConfig in mixin
      posenetInferenceConfig: {
        flipHorizontal: true
      }
    }
  },

  async mounted () {
    try {
      // Wait until webcam and Posenet model are loaded
      const [video, net] = await Promise.all([
        this.initWebcamStream(),
        this.loadPosenetModel()
      ])

      this.video = video
      this.net = net
    } catch (error) {
      this.isVideoStreamReady = true
      this.isPosenetModelReady = true
      this.initError = error
    }

    // Add event listener on window.resize to reset the <video> and <canvas> sizes
    window.addEventListener('resize', this.setFrameSize)

    // Start estimating and drawing the pose in the video frame
    this.poseEstimationFrame()
  },

  destroyed () {
    // Remove the event listener when this component is destroyed
    window.removeEventListener('resize', this.setFrameSize)
  },

  methods: {
    // Initialize webcam
    async initWebcamStream () {
      // If the browser doesn't support mediaDevices.getUserMedia API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support mediaDevices.getUserMedia API')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false, // Don't capture audio
        video: { facingMode: 'user' } // use the front camera if there is
      })

      const video = this.$refs.video
      try {
        video.srcObject = stream
      } catch (error) {
        // Support older browsers
        video.src = URL.createObjectURL(stream)
      }

      /*
        Posenet estimateSinglePose api will try to get the <video> size from the HTML width and height attributes,
          which means <video> width and height attributes needs to be set before called Posenet estimateSinglePose.
        To keep the <video> responsive, I get the initial video size when it's loaded (onloadedmetadata).
        Then addEventListener on resize, which will assign the width and height values.
      */
      return new Promise((resolve, reject) => {
        // When video is loaded
        video.onloadedmetadata = () => {
          // set the initial size
          this.setFrameSize()
          this.isVideoStreamReady = true
          resolve(video)
        }
      })
    },

    // Set the width and height attributes of video and canvas
    setFrameSize () {
      // set max width as 600
      this.frameWidth = document.documentElement.clientWidth
      // set the height according to the video ratio
      this.frameHeight = document.documentElement.clientHeight

      // set video width and height
      const video = this.$refs.video
      video.width = this.frameWidth
      video.height = this.frameHeight
      // set canvas width and height
      const canvas = this.$refs.skeletonOutput
      canvas.width = this.frameWidth
      canvas.height = this.frameHeight
    },

    // Load the Posenet model
    async loadPosenetModel () {
      const net = await Posenet.load(this.posenetModelConfig)
      this.isPosenetModelReady = true
      return net
    },

    /**
     * Detect the pose from the video and render the skeleton onto canvas.
     * It will do 3 things:
     * 1. Estimate the pose in the video
     * 2. Emit a predict event with normalized pose vector to the parent page/ component
     * 3. Draw pose Skeleton
     */
    async poseEstimationFrame () {
      const {
        video,
        frameWidth,
        frameHeight } = this
      const ctx = this.$refs.skeletonOutput.getContext('2d')

      const pose = await this.estimatePose(video)

      if (!pose) {
        requestAnimationFrame(this.poseEstimationFrame)
        return
      }

      // Vectorize and normalize the pose
      const option = {
        // Lower the weights of facial parts
        customWeight: {
          mode: 'multiply',
          scores: [0.5, 0.5, 0.5, 0.5, 0.5]
        }
      }
      const [vectorXY, vectorConfidence] = vectorizeAndNormalize(pose, option)
      // Pass pose to the parent component
      this.$emit('predict', { vectorXY, vectorConfidence })

      // Clear canvas
      ctx.clearRect(0, 0, frameWidth, frameHeight)
      // Draw the resulting skeleton and keypoints if over certain confidence scores
      this.drawPose(pose, ctx)

      requestAnimationFrame(this.poseEstimationFrame)
    }
  }
}
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
