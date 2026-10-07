import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const CONTENT_DIR = path.resolve(ROOT, process.env.OBP_CONTENT_DIR || 'content')
const PUBLIC_DIR = path.resolve(ROOT, process.env.OBP_PUBLIC_DIR || 'public')
const OUT_DIR = path.resolve(ROOT, process.env.OBP_OUT_DIR || 'dist')
const BASE = process.env.OBP_BASE || '/'
if (!BASE.startsWith('/') || !BASE.endsWith('/')) {
  throw new Error(`OBP_BASE must start and end with "/", got "${BASE}"`)
}

function bioRoutes(): string[] {
  const dir = path.join(CONTENT_DIR, 'bios')
  const slugs = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
  return [
    '/',
    '/privacy',
    '/cookie-policy',
    ...slugs.flatMap((slug) => [`/${slug}`, `/${slug}/export`]),
  ]
}

const config: UserConfig & { ssgOptions?: ViteSSGOptions } = {
  base: BASE,
  publicDir: PUBLIC_DIR,
  build: { target: 'es2022', outDir: OUT_DIR },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    tailwindcss(),
    vue({
      template: {
        /**
         * compiler-sfc is loaded from Bun's package cache. Its own require("pug")
         * starts there and never sees this project's dependency.
         */
        preprocessCustomRequire(lang: string) {
          if (lang !== 'pug') {
            throw new Error(`Unsupported template lang: ${lang}`)
          }
          return createRequire(fileURLToPath(new URL('./package.json', import.meta.url)))('pug')
        },
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': CONTENT_DIR,
    },
  },
  ssgOptions: {
    includedRoutes: () => bioRoutes(),
    beastiesOptions: { publicPath: BASE },
  },
}

export default defineConfig(config)
