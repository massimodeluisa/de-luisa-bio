import fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

function bioRoutes(): string[] {
  const dir = fileURLToPath(new URL('./content/bios', import.meta.url))
  const slugs = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
  return ['/', '/privacy', '/cookie-policy', ...slugs.map((slug) => `/${slug}`)]
}

const config: UserConfig & { ssgOptions?: ViteSSGOptions } = {
  base: '/',
  build: { target: 'es2022' },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [tailwindcss(), vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssgOptions: {
    includedRoutes: () => bioRoutes(),
    beastiesOptions: {},
  },
}

export default defineConfig(config)
