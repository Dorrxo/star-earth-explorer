import { createRouter, createWebHistory } from 'vue-router'
import EarthExplorer from '@/pages/EarthExplorer.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'EarthExplorer',
      component: EarthExplorer
    }
  ]
})

export default router
