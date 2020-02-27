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
      :src="selectedImageSrc"
      @load="estimateAndMatchPose"
    >

    <hr>

    <img
      v-for="image in mirrorImages"
      :key="image"
      :src="require(`~/assets/images/mirror-poses/${image}`)"
      class="mirrorImage"
    >
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from '@vue/composition-api'
import usePoseNetEstimation from '@/composition-functions/usePoseNetEstimation'

export default {
  setup (props, { root }) {
    const debugImages = ref([])
    const selectedImage = ref('')

    const selectedImageSrc = computed(() => {
      if (selectedImage.value === '') {
        return ''
      }
      return require(`~/assets/images/debug/${selectedImage.value}`)
    })

    onMounted(async () => {
      debugImages.value = await root.$axios.$get('/api/images/debug')
      selectedImage.value = debugImages.value[0]
    })

    let net = null
    const mirrorImages = ref([])
    const { loadPosenetModel, normalizedPoseRef, detectPoseOnce } = usePoseNetEstimation()

    const estimateAndMatchPose = async ({ target }) => {
      if (net === null) {
        net = await loadPosenetModel()
      }
      detectPoseOnce(target, net)
    }

    watch(async () => {
      if (normalizedPoseRef.value) {
        mirrorImages.value = await root.$axios.$post('/api/searchTree/nearestMatches/5', { userPose: normalizedPoseRef.value })
      }
    })

    return {
      debugImages,
      selectedImage,
      selectedImageSrc,
      mirrorImages,
      estimateAndMatchPose
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
