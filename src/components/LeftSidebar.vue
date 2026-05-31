<template>
  <div class="left-sidebar glass-panel">
    <div class="sidebar-header">
      <h1 class="title">🌍 星途地球</h1>
    </div>

    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索景点、城市..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
    </div>

    <div class="sidebar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <div class="sidebar-content">
      <div v-if="activeTab === 'explore'" class="category-list">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          @click="$emit('select-category', cat.id)"
        >
          <span class="category-icon">{{ cat.icon }}</span>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>

      <div v-if="activeTab === 'explore'" class="attraction-list">
        <div
          v-for="attraction in attractions"
          :key="attraction.id"
          class="attraction-item"
          @click="$emit('select-attraction', attraction)"
        >
          <img :src="attraction.images[0]" :alt="attraction.name" class="attraction-thumb" />
          <div class="attraction-info">
            <div class="attraction-name">{{ attraction.name }}</div>
            <div class="attraction-desc">{{ attraction.shortDesc }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'favorites'" class="attraction-list">
        <div
          v-for="id in favorites"
          :key="id"
          class="attraction-item"
          @click="$emit('select-attraction', getAttractionById(id))"
        >
          <img :src="getAttractionById(id)?.images[0]" class="attraction-thumb" />
          <div class="attraction-info">
            <div class="attraction-name">{{ getAttractionById(id)?.name }}</div>
            <div class="attraction-desc">{{ getAttractionById(id)?.shortDesc }}</div>
          </div>
          <button
            class="remove-favorite"
            @click.stop="$emit('toggle-favorite', id)"
          >
            ×
          </button>
        </div>
        <div v-if="favorites.length === 0" class="empty-state">
          还没有收藏的景点
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="attraction-list">
        <div
          v-for="id in history"
          :key="id"
          class="attraction-item"
          @click="$emit('select-attraction', getAttractionById(id))"
        >
          <img :src="getAttractionById(id)?.images[0]" class="attraction-thumb" />
          <div class="attraction-info">
            <div class="attraction-name">{{ getAttractionById(id)?.name }}</div>
            <div class="attraction-desc">{{ getAttractionById(id)?.shortDesc }}</div>
          </div>
        </div>
        <div v-if="history.length === 0" class="empty-state">
          还没有浏览记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Attraction } from '@/types'
import { attractions } from '@/data/attractions'

const props = defineProps<{
  attractions: Attraction[]
  favorites: string[]
  history: string[]
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'select-category', category: string): void
  (e: 'select-attraction', attraction: Attraction): void
  (e: 'toggle-favorite', id: string): void
}>()

const searchQuery = ref('')
const activeTab = ref('explore')

const tabs = [
  { id: 'explore', name: '探索', icon: '🗺️' },
  { id: 'favorites', name: '收藏', icon: '❤️' },
  { id: 'history', name: '历史', icon: '🕐' }
]

const categories = [
  { id: 'all', name: '全部', icon: '🌍' },
  { id: 'natural', name: '自然风光', icon: '🏔️' },
  { id: 'cultural', name: '人文古迹', icon: '🏛️' },
  { id: 'urban', name: '城市风光', icon: '🏙️' },
  { id: 'island', name: '海岛海滩', icon: '🏝️' }
]

const getAttractionById = (id: string) => {
  return props.attractions.find(a => a.id === id)
}

const handleSearch = () => {
  if (searchQuery.value) {
    emit('search', searchQuery.value)
  }
}
</script>

<style scoped>
.left-sidebar {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 300px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.search-section {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.tab-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.tab-button.active {
  color: white;
  border-bottom: 2px solid #1677ff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.category-list {
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 5px;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-icon {
  font-size: 20px;
}

.category-name {
  font-size: 14px;
}

.attraction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attraction-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.attraction-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.attraction-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.attraction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.attraction-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.attraction-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-favorite {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
}

.remove-favorite:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>
