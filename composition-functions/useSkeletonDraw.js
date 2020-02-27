import { reactive } from '@vue/composition-api'
import * as Posenet from '@tensorflow-models/posenet'

export default function useSkeletonDraw () {
  const drawOption = reactive({
    minPoseConfidence: 0.1,
    minPartConfidence: 0.4,
    partColor: 'aqua',
    partColorLowConfidence: 'red',
    segmentLineWidth: 4
  })

  /**
   * Draw pose skeleton on canvas
   * @param { Object } pose PoseNet pose object
   * @param { CanvasRenderingContext2D } ctx canvas context 2d
   * @param { boolean } debug whether runs in debugging mode
   */
  const drawPose = (pose, ctx, debug = false) => {
    const { score, keypoints } = pose
    if (score >= drawOption.minPoseConfidence) {
      drawSkeleton(keypoints, (debug ? 0 : drawOption.minPartConfidence), ctx)
      drawKeypoints(keypoints, drawOption.minPartConfidence, ctx, 1, debug)
    }
  }

  /**
   * Draws a pose skeleton by looking up all adjacent keypoints/joints
   */
  const drawSkeleton = (keypoints, minConfidence, ctx, scale = 1) => {
    const adjacentKeyPoints =
      Posenet.getAdjacentKeyPoints(keypoints, minConfidence)

    adjacentKeyPoints.forEach((keypoints) => {
      drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), drawOption.partColor,
        scale, ctx)
    })
  }

  /**
   * Draw pose keypoints onto a canvas
   */
  const drawKeypoints = (keypoints, minConfidence, ctx, scale = 1, debugging = false) => {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i]

      const { y, x } = keypoint.position
      if (keypoint.score < minConfidence) {
        if (debugging) {
          drawPoint(ctx, y * scale, x * scale, 5, drawOption.partColorLowConfidence)
        }
        continue
      }

      drawPoint(ctx, y * scale, x * scale, 5, drawOption.partColor)
    }
  }

  const toTuple = ({ y, x }) => {
    return [y, x]
  }

  const drawPoint = (ctx, y, x, r, partColor) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = partColor
    ctx.fill()
  }

  const drawSegment = ([ay, ax], [by, bx], partColor, scale, ctx) => {
    ctx.beginPath()
    ctx.moveTo(ax * scale, ay * scale)
    ctx.lineTo(bx * scale, by * scale)
    ctx.lineWidth = drawOption.segmentLineWidth
    ctx.strokeStyle = partColor
    ctx.stroke()
  }

  return {
    drawOption,
    drawPose
  }
}
