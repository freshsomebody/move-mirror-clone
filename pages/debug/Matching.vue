<template>
  <div>
    <select
      v-model="selectedImage"
    >
      <option
        v-for="image in debugImages"
        :key="image"
        :value="image"
      >
        {{ image }}
      </option>
    </select>

    <img
      ref="debugImage"
      :src="require(`~/assets/images/debug/${selectedImage}`)"
      @load="estimateAndMatchPose"
    >

    <hr>

    <img
      v-for="image in mirrorImages"
      :key="image"
      class="mirrorImage"
      :src="require(`~/assets/images/mirror-poses/${image}`)"
    >
  </div>
</template>

<script>
import { vectorizeAndNormalize } from 'posenet-similarity'
import PosenetMixin from '@/mixins/posenet.mixin'

export default {
  mixins: [
    PosenetMixin
  ],

  data () {
    return {
      net: null, // Posenet model

      frameWidth: 300,
      frameHeight: 540,

      mirrorImages: []
    }
  },

  async asyncData ({ $axios }) {
    // Load the list of debugging images
    const debugImages = await $axios.$get('/api/images/debug')
    return {
      debugImages,
      selectedImage: debugImages[0]
    }
  },

  methods: {
    async estimateAndMatchPose ({ target }) {
      const pose = await this.estimatePose(target)

      if (!pose) {
        return
      }

      // Vectorize and normalize the pose
      const [vectorXY, vectorConfidence] = vectorizeAndNormalize(pose, {})

      // Get 5 most similar mirror images from vptree
      this.mirrorImages = await this.$axios.$post('/api/searchTree/nearestMatches/5', { userPose: { vectorXY, vectorConfidence } })
    }
  }
}
</script>

<style lang="scss" scoped>
select {
  display: block;
}

.mirrorImage {
  width: 240px;
  height: 432px;
}
</style>
