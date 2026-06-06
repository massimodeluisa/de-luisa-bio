import { createApp } from 'vue'

import App from './App.vue'
import { initAnalytics } from './composables/use-analytics'

import './assets/theme.css'
import './assets/tailwind.css'

initAnalytics()

createApp(App).mount('#app')
