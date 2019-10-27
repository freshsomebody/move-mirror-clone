<template>
  <div class="container">
    <h1 class="title">
      Move Mirror Clone
    </h1>
    <h2 class="subtitle">
      A clone of Google Move Mirror built by Nuxt.js
    </h2>

    <div class="demoArea">
      <div class="demoArea--camera">
        <CameraAndSkeleton @predict="getMirrorPose" />
      </div>

      <div class="demoArea--mirrorImage">
        <img
          v-if="mirrorImage"
          :src="require(`~/assets/images/mirror-poses/${mirrorImage}`)"
        >
      </div>
    </div>
  </div>
</template>

<script>
import CameraAndSkeleton from '@/components/CameraAndSkeleton'

export default {
  components: {
    CameraAndSkeleton
  },

  data () {
    return {
      mirrorImage: null
    }
  },

  methods: {
    // Get the most similar mirror image from vptree
    async getMirrorPose (pose) {
      const nearestImages = await this.$axios.$post('/api/searchTree/nearestMatches/1', { userPose: pose })
      this.mirrorImage = nearestImages[0]
    }
  }
}
</script>

<style lang="scss">
$lg: 1200px;
$md: 960px;
$sm: 600px;

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  text-align: center;

  margin: 0 16px;

  @media (min-width: $lg) {
    width: 1160px;
    margin: 0 auto;
  }
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 64px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 32px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.demoArea {
  display: flex;
  position: relative;
  width: 100%;
  height: 572px;

  &--camera, &--mirrorImage {
    width: 50%;
    height: 100%;
  }

  &--mirrorImage {
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
