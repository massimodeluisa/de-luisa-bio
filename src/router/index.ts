import type { RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import BioView from '@/views/BioView.vue'
import LegalView from '@/views/LegalView.vue'

const AdminView = () => import('@/views/AdminView.vue')
const ExportView = () => import('@/views/ExportView.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  // Prerendered pages are also reachable at their .html file URLs; send those to the clean routes.
  { path: '/index.html', redirect: (to) => ({ path: '/', query: to.query, hash: to.hash }) },
  {
    path: '/:slug/export.html',
    redirect: (to) => ({ path: `/${to.params.slug}/export`, query: to.query, hash: to.hash }),
  },
  {
    path: '/:slug([^/]+)\\.html',
    redirect: (to) => ({ path: `/${to.params.slug}`, query: to.query, hash: to.hash }),
  },
  { path: '/admin', name: 'admin', component: AdminView },
  // Legal pages must precede the "/:slug" catch-all, otherwise they resolve as bios.
  { path: '/privacy', name: 'privacy', component: LegalView, props: { kind: 'privacy' } },
  {
    path: '/cookie-policy',
    name: 'cookie-policy',
    component: LegalView,
    props: { kind: 'cookie' },
  },
  // "/:slug/export" must precede the "/:slug" catch-all, otherwise it resolves as a bio slug.
  { path: '/:slug/export', name: 'bio-export', component: ExportView },
  { path: '/:slug', name: 'bio', component: BioView },
]
