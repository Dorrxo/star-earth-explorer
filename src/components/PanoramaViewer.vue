<template>
  <div class="panorama-viewer">
    <div class="panorama-header">
      <h3>📍 {{ attraction.name }}</h3>
      <button class="close-button" @click="$emit('close')">✕</button>
    </div>
    <div ref="panoramaContainer" class="panorama-container"></div>
    <div class="panorama-controls">
      <p class="hint">🖱️ 拖拽旋转视角 | 🔍 滚轮缩放</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Attraction } from '@/types'

const props = defineProps<{
  attraction: Attraction
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const panoramaContainer = ref<HTMLDivElement>()
let viewer: any = null

onMounted(() => {
  if (panoramaContainer.value && (window as any).pannellum) {
    viewer = (window as any).pannellum.viewer(panoramaContainer.value, {
      type: 'equirectangular',
      panorama: props.attraction.images[0],
      autoLoad: true,
      showControls: true,
      compass: true,
      autoRotate: -2,
      autoRotateStopDelay: 5000
    })
  }
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
  }
})
</script>

<style scoped>
.panorama-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.panorama-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  z-index: 10;
}

.panorama-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.panorama-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

.panorama-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  z-index: 10;
}

.hint {
  margin: 0;
  color: white;
  font-size: 14px;
  opacity: 0.8;
}

:deep(.pnlm-container) {
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
