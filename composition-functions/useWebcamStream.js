import { ref } from '@vue/composition-api'

export default function useWebcamStream () {
  const isVideoStreamReadyRef = ref(false)

  const initWebcamStream = async (videoDOM) => {
    // If the browser doesn't support mediaDevices.getUserMedia API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Your browser does not support mediaDevices.getUserMedia API')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false, // Don't capture audio
      video: { facingMode: 'user' } // use the front camera if there is
    })

    try {
      videoDOM.srcObject = stream
    } catch (error) {
      // Support older browsers
      videoDOM.src = URL.createObjectURL(stream)
    }

    /*
      Posenet estimateSinglePose api will try to get the <video> size from the HTML width and height attributes,
        which means <video> width and height attributes needs to be set before called Posenet estimateSinglePose.
      To keep the <video> responsive, I get the initial video size when it's loaded (onloadedmetadata).
      Then addEventListener on resize, which will assign the width and height values.
    */
    return new Promise((resolve, reject) => {
      // When video is loaded
      videoDOM.onloadedmetadata = () => {
        isVideoStreamReadyRef.value = true
        resolve(videoDOM)
      }
    })
  }

  return {
    isVideoStreamReadyRef,
    initWebcamStream
  }
}
