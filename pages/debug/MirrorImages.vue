<template>
  <div>
    <div>
      <button
        v-if="poseEstimationCompleted"
        @click="buildSearchTree"
      >
        Build search tree
      </button>
      <ProgressBar
        v-if="!poseEstimationCompleted"
        :total-task-count="images.length"
        :finished-task-count="estimatedImageCount"
        :progress-message="progressMessage"
        task-count
      />
    </div>
    <div class="imageContainer">
      <div
        v-for="(image, index) in images"
        :key="image"
        class="card"
      >
        <img
          :ref="`i${image}`"
          :src="require(`~/assets/images/mirror-poses/${image}`)"
        >
        <canvas
          :ref="`c${image}`"
        />

        <button
          v-if="poseEstimationCompleted"
          @click="deleteImage(index)"
          class="btnDelete"
        >
          X
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { vectorizeAndNormalize } from 'posenet-similarity'
import PosenetMixin from '@/mixins/posenet.mixin'
import ProgressBar from '@/components/ProgressBar'

export default {
  components: {
    ProgressBar
  },

  mixins: [
    PosenetMixin
  ],

  data () {
    return {
      net: null, // Posenet model

      normalizedVectors: [],

      progressMessage: '',
      estimatedImageCount: 0
    }
  },

  computed: {
    poseEstimationCompleted () {
      return this.images.length === this.estimatedImageCount
    }
  },

  async asyncData ({ $axios }) {
    const images = await $axios.$get('/api/images')
    return { images }
  },

  async mounted () {
    // Align canvas heights with image heights
    this.setCanvasHeight()

    // Estimate poses in images and draw skeletons
    for (const image of this.images) {
      const [img] = this.$refs[`i${image}`]
      const [canvas] = this.$refs[`c${image}`]

      const pose = await this.estimatePose(img)

      // If PoseNet cannot estimate the pose of this image
      // => skip it
      if (!pose) {
        this.estimatedImageCount++
        continue
      }

      // Draw pose skeleton in debugging mode
      const ctx = canvas.getContext('2d')
      this.drawPose(pose, ctx, true)

      // Push normalized pose vector
      const [vectorXY, vectorConfidence] = vectorizeAndNormalize(pose, {})
      this.normalizedVectors.push({
        image,
        vectorXY,
        vectorConfidence
      })

      this.estimatedImageCount++
    }
    // Clear the progress message
    this.progressMessage = ''
  },

  methods: {
    setCanvasHeight () {
      this.images.forEach((image) => {
        const imageHeight = this.$refs[`i${image}`][0].height
        this.$refs[`c${image}`][0].height = imageHeight
      })
    },

    // Update poseData and build search tree
    async buildSearchTree () {
      try {
        await this.$axios.$post('/api/searchTree/poseData', this.normalizedVectors)
        await this.$axios.$post('/api/searchTree/build')

        alert('Vptree has been built')
      } catch (error) {
        alert('Failed to build the vptree')
      }
    },

    // Delete an image
    async deleteImage (index) {
      const isDelete = confirm('Are you sure to delete this image?')

      if (!isDelete) {
        return
      }

      const image = this.images[index]

      // Send delete request
      await this.$axios.$delete(`/api/images/${image}`)

      // Remove the image from the displaying list and normalizedVectors
      this.images.splice(index, 1)
      this.normalizedVectors.splice(index, 1)

      this.estimatedImageCount--
    }
  }
}
</script>

<style lang="scss" scoped>
.imageContainer {
  display: flex;
  flex-wrap: wrap;
}

.card {
  position: relative;
  flex: 0 1;
  padding: 4px;

  img, canvas {
    width: 300px;
    // height: 540px;
  }

  canvas, .btnDelete {
    position: absolute;
    top: 4px;
    left: 4px;
  }
}
</style>
