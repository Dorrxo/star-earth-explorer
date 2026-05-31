<template>
  <div class="bottom-info glass-panel">
    <div class="info-item">
      <span class="label">📍 坐标</span>
      <span class="value">{{ coordinates.lat.toFixed(4) }}°, {{ coordinates.lng.toFixed(4) }}°</span>
    </div>
    <div class="separator"></div>
    <div class="info-item">
      <span class="label">💡 提示</span>
      <span class="value">拖拽旋转地球 | 滚轮缩放 | 双击景点查看详情</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  coordinates: { lat: number; lng: number }
}>()
</script>

<style scoped>
.bottom-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  z-index: 100;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-size: 13px;
  opacity: 0.7;
}

.value {
  font-size: 13px;
  font-weight: 500;
}

.separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}
</style>
