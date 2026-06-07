import type { RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import BioView from '@/views/BioView.vue'

const AdminView = () => import('@/views/AdminView.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/:slug', name: 'bio', component: BioView },
]
