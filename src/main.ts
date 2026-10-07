import { ViteSSG } from 'vite-ssg'

import App from './App.vue'
import { routes } from './router'
import { initAnalytics } from './composables/use-analytics'
import { initConsent } from './composables/use-consent'
import { IS_DEMO_INSTANCE } from './lib/demo'

import './assets/theme.css'
import './assets/tailwind.css'

export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ isClient }) => {
    if (isClient && !IS_DEMO_INSTANCE) {
      // Consent Mode + cookie banner PRIMA di caricare GTM/PostHog.
      initConsent()
      initAnalytics()
    }
  },
)
