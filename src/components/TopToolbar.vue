<template>
  <div class="top-toolbar glass-panel">
    <button
      v-for="tool in tools"
      :key="tool.id"
      class="tool-button"
      :title="tool.name"
      @click="$emit(tool.event)"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
      <span class="tool-name">{{ tool.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'reset-view'): void
  (e: 'toggle-night'): void
  (e: 'measure-distance'): void
  (e: 'toggle-fullscreen'): void
  (e: 'random-explore'): void
}>()

const tools = [
  { id: 'reset', icon: '🏠', name: '重置视角', event: 'reset-view' },
  { id: 'night', icon: '🌙', name: '昼夜切换', event: 'toggle-night' },
  { id: 'measure', icon: '📏', name: '测量距离', event: 'measure-distance' },
  { id: 'fullscreen', icon: '⛶', name: '全屏模式', event: 'toggle-fullscreen' },
  { id: 'random', icon: '🎲', name: '随机探索', event: 'random-explore' }
]
</script>

<style scoped>
.top-toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  z-index: 100;
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tool-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tool-icon {
  font-size: 20px;
}

.tool-name {
  font-size: 11px;
  opacity: 0.8;
}
</style>
