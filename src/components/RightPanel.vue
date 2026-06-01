<template>
  <div class="right-panel glass-panel">
    <div class="panel-header">
      <div class="header-title">
        <h2>{{ attraction.name }}</h2>
        <p class="subtitle">{{ attraction.shortDesc }}</p>
      </div>
      <div class="header-actions">
        <button class="action-button" @click="$emit('toggle-favorite', attraction.id)">
          {{ isFavorite ? '❤️' : '🤍' }}
        </button>
        <button class="action-button" @click="$emit('close')">
          ✕
        </button>
      </div>
    </div>

    <div class="image-gallery">
      <img :src="attraction.images[0]" :alt="attraction.name" class="main-image" />
      <div class="thumbnails">
        <img
          v-for="(img, idx) in attraction.images"
          :key="idx"
          :src="img"
          :class="['thumbnail', { active: idx === 0 }]"
        />
      </div>
    </div>

    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <div class="panel-content">
      <div v-if="activeTab === 'panorama'" class="panorama-section">
        <div v-if="attraction.panoramaUrl" class="panorama-iframe-wrapper">
          <iframe
            :src="attraction.panoramaUrl"
            width="100%"
            height="300"
            style="border:0; border-radius: 8px;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div v-else class="panorama-placeholder">
          <p>暂无全景数据</p>
        </div>
        <button class="panorama-button" @click="$emit('enter-panorama')">
          📷 进入360°全景
        </button>
      </div>

      <div v-if="activeTab === 'info'" class="info-section">
        <div class="info-item">
          <span class="info-label">📍 开放时间</span>
          <span class="info-value">{{ attraction.openTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🎫 门票价格</span>
          <span class="info-value">{{ attraction.ticketPrice }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🌤️ 最佳季节</span>
          <span class="info-value">{{ attraction.bestSeason }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">⏱️ 建议游玩</span>
          <span class="info-value">{{ attraction.duration }}</span>
        </div>
        <div class="description">
          <h4>景点介绍</h4>
          <p>{{ attraction.fullDesc }}</p>
        </div>
      </div>

      <div v-if="activeTab === 'travel'" class="travel-section">
        <div class="info-block">
          <h4>🚗 交通方式</h4>
          <p>{{ attraction.transport }}</p>
        </div>
        <div class="info-block">
          <h4>📝 签证信息</h4>
          <p>{{ attraction.visa }}</p>
        </div>
        <div class="info-block">
          <h4>💱 货币</h4>
          <p>{{ attraction.currency }}</p>
        </div>
        <div class="info-block">
          <h4>🗣️ 语言</h4>
          <p>{{ attraction.language }}</p>
        </div>
        <div class="info-block">
          <h4>💡 小贴士</h4>
          <ul>
            <li v-for="(tip, idx) in attraction.tips" :key="idx">{{ tip }}</li>
          </ul>
        </div>
      </div>

      <div v-if="activeTab === 'food'" class="food-section">
        <h4>🍽️ 推荐美食</h4>
        <div class="food-list">
          <div v-for="(food, idx) in attraction.food" :key="idx" class="food-item">
            {{ food }}
          </div>
        </div>
        <h4>🏨 推荐住宿</h4>
        <div class="hotel-list">
          <div v-for="(hotel, idx) in attraction.hotels" :key="idx" class="hotel-item">
            {{ hotel }}
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'routes'" class="routes-section">
        <div
          v-for="(route, idx) in attraction.routes"
          :key="idx"
          class="route-card"
        >
          <h4>{{ route.name }}</h4>
          <p class="route-duration">{{ route.duration }}</p>
          <div class="route-highlights">
            <span v-for="(highlight, hIdx) in route.highlights" :key="hIdx" class="highlight-tag">
              {{ highlight }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Attraction } from '@/types'

const props = defineProps<{
  attraction: Attraction
  isFavorite: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-favorite', id: string): void
  (e: 'enter-panorama'): void
}>()

const activeTab = ref('panorama')

const tabs = [
  { id: 'panorama', name: '全景', icon: '📷' },
  { id: 'info', name: '介绍', icon: 'ℹ️' },
  { id: 'travel', name: '攻略', icon: '📋' },
  { id: 'food', name: '美食', icon: '🍽️' },
  { id: 'routes', name: '路线', icon: '🗺️' }
]
</script>

<style scoped>
.right-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.header-title h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-gallery {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.main-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.thumbnails {
  display: flex;
  gap: 8px;
}

.thumbnail {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  opacity: 0.6;
  cursor: pointer;
}

.thumbnail.active {
  opacity: 1;
  border: 2px solid #1677ff;
}

.panel-tabs {
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
  font-size: 12px;
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

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.panorama-section {
  text-align: center;
  padding: 20px;
}

.panorama-iframe-wrapper {
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.panorama-placeholder {
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.panorama-button {
  padding: 15px 40px;
  border: none;
  background: linear-gradient(135deg, #1677ff, #0056b3);
  color: white;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.panorama-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(22, 119, 255, 0.3);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.info-value {
  font-size: 13px;
}

.description {
  margin-top: 20px;
}

.description h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
}

.description p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}

.info-block {
  margin-bottom: 25px;
}

.info-block h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.info-block p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.info-block ul {
  margin: 0;
  padding-left: 20px;
}

.info-block li {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.food-section h4,
.routes-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
}

.food-list,
.hotel-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
}

.food-item,
.hotel-item {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 13px;
}

.route-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.route-card h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.route-duration {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.route-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.highlight-tag {
  padding: 4px 10px;
  background: rgba(22, 119, 255, 0.2);
  border: 1px solid rgba(22, 119, 255, 0.3);
  border-radius: 12px;
  font-size: 12px;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>
