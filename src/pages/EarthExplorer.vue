<template>
  <div class="earth-explorer">
    <EarthCanvas
      ref="earthCanvas"
      @select-attraction="handleSelectAttraction"
    />

    <LeftSidebar
      :attractions="attractions"
      :favorites="favorites"
      :history="history"
      @search="handleSearch"
      @select-category="handleSelectCategory"
      @select-attraction="handleSelectAttraction"
      @toggle-favorite="handleToggleFavorite"
    />

    <TopToolbar
      @reset-view="handleResetView"
      @toggle-night="handleToggleNight"
      @measure-distance="handleMeasureDistance"
      @toggle-fullscreen="handleToggleFullscreen"
      @random-explore="handleRandomExplore"
    />

    <RightPanel
      v-if="selectedAttraction"
      :attraction="selectedAttraction"
      :is-favorite="isFavorite"
      @close="handleClosePanel"
      @toggle-favorite="handleToggleFavorite"
      @enter-panorama="handleEnterPanorama"
    />

    <PanoramaViewer
      v-if="showPanorama && selectedAttraction"
      :attraction="selectedAttraction"
      @close="handleExitPanorama"
    />

    <BottomInfo :coordinates="currentCoordinates" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Attraction } from '@/types'
import { attractions } from '@/data/attractions'
import EarthCanvas from '@/components/EarthCanvas.vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import TopToolbar from '@/components/TopToolbar.vue'
import RightPanel from '@/components/RightPanel.vue'
import PanoramaViewer from '@/components/PanoramaViewer.vue'
import BottomInfo from '@/components/BottomInfo.vue'

const earthCanvas = ref<InstanceType<typeof EarthCanvas>>()
const selectedAttraction = ref<Attraction | null>(null)
const showPanorama = ref(false)
const favorites = ref<string[]>([])
const history = ref<string[]>([])
const currentCoordinates = ref({ lat: 0, lng: 0 })

const isFavorite = computed(() => {
  return selectedAttraction.value ? favorites.value.includes(selectedAttraction.value.id) : false
})

const handleSelectAttraction = (attraction: Attraction) => {
  selectedAttraction.value = attraction

  if (!history.value.includes(attraction.id)) {
    history.value.unshift(attraction.id)
    if (history.value.length > 20) {
      history.value.pop()
    }
  }
}

const handleClosePanel = () => {
  selectedAttraction.value = null
}

const handleToggleFavorite = (id: string) => {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
}

const handleSearch = (query: string) => {
  const found = attractions.find(a =>
    a.name.toLowerCase().includes(query.toLowerCase())
  )
  if (found) {
    handleSelectAttraction(found)
    earthCanvas.value?.flyTo(found.latitude, found.longitude)
  }
}

const handleSelectCategory = (category: string) => {
  console.log('Select category:', category)
}

const handleResetView = () => {
  earthCanvas.value?.resetView()
}

const handleToggleNight = () => {
  earthCanvas.value?.toggleNightMode()
}

const handleMeasureDistance = () => {
  console.log('Measure distance')
}

const handleToggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleRandomExplore = () => {
  const randomIndex = Math.floor(Math.random() * attractions.length)
  const randomAttraction = attractions[randomIndex]
  handleSelectAttraction(randomAttraction)
  earthCanvas.value?.flyTo(randomAttraction.latitude, randomAttraction.longitude)
}

const handleEnterPanorama = () => {
  showPanorama.value = true
}

const handleExitPanorama = () => {
  showPanorama.value = false
}
</script>

<style scoped>
.earth-explorer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
