import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-info-before': () => h('p', { class: 'hero-eyebrow' }, 'WHITE-LABEL LINK-IN-BIO'),
    }),
} satisfies Theme
