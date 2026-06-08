import type { RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import BioView from '@/views/BioView.vue'
import LegalView from '@/views/LegalView.vue'

const AdminView = () => import('@/views/AdminView.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/admin', name: 'admin', component: AdminView },
  // Legal pages must precede the "/:slug" catch-all, otherwise they resolve as bios.
  { path: '/privacy', name: 'privacy', component: LegalView, props: { kind: 'privacy' } },
  {
    path: '/cookie-policy',
    name: 'cookie-policy',
    component: LegalView,
    props: { kind: 'cookie' },
  },
  { path: '/:slug', name: 'bio', component: BioView },
]
