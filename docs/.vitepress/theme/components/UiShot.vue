<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

type TView = 'desktop' | 'mobile'
type TScheme = 'light' | 'dark'

const props = defineProps<{
  name: string
  alt: string
  url: string
  caption?: string
}>()

/**
 * Both theme images are rendered and CSS hides one: VitePress sets `.dark`
 * on <html> before first paint, so there is no flash, and lazy images hidden
 * with display: none are never fetched.
 */
const SCHEMES: TScheme[] = ['light', 'dark']

const view = ref<TView>('desktop')

function imageSrc(device: TView, scheme: TScheme): string {
  return withBase(`/screens/${props.name}-${device}-${scheme}.webp`)
}
</script>

<template>
  <figure class="ui-shot">
    <div class="ui-shot__toolbar">
      <span v-if="caption" class="ui-shot__caption">{{ caption }}</span>
      <div class="ui-shot__switch">
        <button
          type="button"
          class="ui-shot__toggle"
          aria-label="Desktop view"
          :aria-pressed="view === 'desktop'"
          @click="view = 'desktop'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </button>
        <button
          type="button"
          class="ui-shot__toggle"
          aria-label="Phone view"
          :aria-pressed="view === 'mobile'"
          @click="view = 'mobile'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        </button>
      </div>
    </div>
    <div class="ui-shot__stage">
      <Transition name="ui-shot-fade">
        <div v-if="view === 'desktop'" key="desktop" class="ui-shot__desktop">
          <div class="ui-shot__bar">
            <span class="ui-shot__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span class="ui-shot__url">{{ url }}</span>
          </div>
          <img
            v-for="scheme in SCHEMES"
            :key="scheme"
            :class="`ui-shot__img--${scheme}`"
            :src="imageSrc('desktop', scheme)"
            :alt="alt"
            width="1440"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div v-else key="mobile" class="ui-shot__phone">
          <img
            v-for="scheme in SCHEMES"
            :key="scheme"
            :class="`ui-shot__img--${scheme}`"
            :src="imageSrc('mobile', scheme)"
            :alt="alt"
            width="390"
            height="844"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Transition>
    </div>
  </figure>
</template>

<style scoped>
.ui-shot {
  margin: 20px 0 28px;
}

.ui-shot__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.ui-shot__caption {
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 20px;
}

.ui-shot__switch {
  display: inline-flex;
  flex-shrink: 0;
  gap: 2px;
  margin-inline-start: auto;
  padding: 2px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}

.ui-shot__toggle {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.ui-shot__toggle[aria-pressed='true'] {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
}

.ui-shot__toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

.dark .ui-shot__switch {
  background: #14151B;
}

.dark .ui-shot__toggle {
  border: 1px solid transparent;
}

.dark .ui-shot__toggle[aria-pressed='true'] {
  border-color: rgba(246, 246, 244, 0.12);
  background: #2A2C38;
}

.ui-shot__stage {
  display: grid;
}

.ui-shot__stage > * {
  grid-area: 1 / 1;
}

.ui-shot__desktop {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
}

.ui-shot__bar {
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ui-shot__dots {
  display: flex;
  gap: 6px;
}

.ui-shot__dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

.ui-shot__url {
  overflow: hidden;
  padding: 2px 12px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .ui-shot__url {
  background: #14151B;
}

.ui-shot__desktop img {
  display: block;
  width: 100%;
  height: auto;
}

.dark .ui-shot__img--light,
html:not(.dark) .ui-shot__img--dark {
  display: none;
}

.ui-shot__phone {
  justify-self: center;
  overflow: hidden;
  border: 10px solid color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
  border-radius: 36px;
}

.dark .ui-shot__phone {
  border-color: color-mix(in srgb, var(--vp-c-text-1) 20%, transparent);
}

.ui-shot__phone img {
  display: block;
  width: calc(560px * 390 / 844);
  max-width: 100%;
  height: auto;
  aspect-ratio: 390 / 844;
}

.ui-shot-fade-enter-active,
.ui-shot-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ui-shot-fade-enter-from,
.ui-shot-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ui-shot-fade-enter-active,
  .ui-shot-fade-leave-active {
    transition: none;
  }
}
</style>
