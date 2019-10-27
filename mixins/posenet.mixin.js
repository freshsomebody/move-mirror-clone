import * as Posenet from '@tensorflow-models/posenet'

export default {
  data () {
    return {
      progressMessage: '',

      net: null, // PoseNet model
      posenetModelConfig: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: 513,
        multiplier: 0.75
      },
      posenetInferenceConfig: {
        flipHorizontal: false,
        maxDetections: 1,
        scoreThreshold: 0.5,
        nmsRadius: 20
      },
      minPoseConfidence: 0.1,
      minPartConfidence: 0.4,

      partColor: 'aqua',
      partColorLowConfidence: 'red',
      segmentLineWidth: 4
    }
  },

  methods: {
    /**
     * Estimate the pose in an image
     * @param { ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement } img
     * @returns pose: Object
     */
    async estimatePose (img) {
      if (!this.net) {
        this.progressMessage = 'Loading model...'
        this.net = await Posenet.load(this.posenetModelConfig)
      }
      this.progressMessage = 'Estimating poses...'
      const poses = await this.net.estimateMultiplePoses(img, this.posenetInferenceConfig)

      return poses[0]
    },

    /**
     * Draw pose skeleton on canvas
     * @param { Object } pose PoseNet pose object
     * @param { CanvasRenderingContext2D } ctx canvas context 2d
     * @param { boolean } debug whether runs in debugging mode
     */
    drawPose (pose, ctx, debug = false) {
      const {
        minPoseConfidence,
        minPartConfidence } = this

      const { score, keypoints } = pose
      if (score >= minPoseConfidence) {
        this.drawSkeleton(keypoints, (debug ? 0 : minPartConfidence), ctx)
        this.drawKeypoints(keypoints, minPartConfidence, ctx, 1, debug)
      }
    },

    toTuple ({ y, x }) {
      return [y, x]
    },

    drawPoint (ctx, y, x, r, partColor) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = partColor
      ctx.fill()
    },

    drawSegment ([ay, ax], [by, bx], partColor, scale, ctx) {
      ctx.beginPath()
      ctx.moveTo(ax * scale, ay * scale)
      ctx.lineTo(bx * scale, by * scale)
      ctx.lineWidth = this.segmentLineWidth
      ctx.strokeStyle = partColor
      ctx.stroke()
    },

    /**
     * Draws a pose skeleton by looking up all adjacent keypoints/joints
     */
    drawSkeleton (keypoints, minConfidence, ctx, scale = 1) {
      const adjacentKeyPoints =
        Posenet.getAdjacentKeyPoints(keypoints, minConfidence)

      adjacentKeyPoints.forEach((keypoints) => {
        this.drawSegment(
          this.toTuple(keypoints[0].position), this.toTuple(keypoints[1].position), this.partColor,
          scale, ctx)
      })
    },

    /**
     * Draw pose keypoints onto a canvas
     */
    drawKeypoints (keypoints, minConfidence, ctx, scale = 1, debugging = false) {
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i]

        const { y, x } = keypoint.position
        if (keypoint.score < minConfidence) {
          if (debugging) {
            this.drawPoint(ctx, y * scale, x * scale, 5, this.partColorLowConfidence)
          }
          continue
        }

        this.drawPoint(ctx, y * scale, x * scale, 5, this.partColor)
      }
    }
  }
}
