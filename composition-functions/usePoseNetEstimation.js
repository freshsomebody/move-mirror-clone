import { ref, computed } from '@vue/composition-api'
import * as Posenet from '@tensorflow-models/posenet'
import { vectorizeAndNormalize } from 'posenet-similarity'

export default function usePoseNetEstimation () {
  const isPosenetModelReadyRef = ref(false)
  const posenetModelConfigRef = ref({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: 513,
    multiplier: 0.75
  })
  const loadPosenetModel = async () => {
    try {
      const net = await Posenet.load(posenetModelConfigRef.value)
      return net
    } catch (error) {
      throw error
    } finally {
      isPosenetModelReadyRef.value = true
    }
  }

  const poseRef = ref({})
  const posenetInferenceConfigRef = ref({
    flipHorizontal: false,
    maxDetections: 1,
    scoreThreshold: 0.5,
    nmsRadius: 20
  })
  const normalizationOptionRef = ref({
    customWeight: {
      mode: 'multiply',
      scores: [0.5, 0.5, 0.5, 0.5, 0.5]
    }
  })

  const normalizedPoseRef = computed(() => {
    if (poseRef.value && poseRef.value.keypoints) {
      const [vectorXY, vectorConfidence] = vectorizeAndNormalize(poseRef.value, normalizationOptionRef.value)
      return { vectorXY, vectorConfidence }
    }
    return null
  })

  const detectPoseOnce = async (image, net) => {
    const estPoses = await net.estimateMultiplePoses(image, posenetInferenceConfigRef.value)
    poseRef.value = estPoses[0]
  }

  const detectPoseInRealTime = (video, net) => {
    async function poseEstimationFrame () {
      const estPoses = await net.estimateMultiplePoses(video, posenetInferenceConfigRef.value)
      poseRef.value = estPoses[0]
      requestAnimationFrame(poseEstimationFrame)
    }
    poseEstimationFrame()
  }

  return {
    isPosenetModelReadyRef,
    posenetModelConfigRef,
    loadPosenetModel,
    poseRef,
    posenetInferenceConfigRef,
    normalizationOptionRef,
    normalizedPoseRef,
    detectPoseOnce,
    detectPoseInRealTime
  }
}
