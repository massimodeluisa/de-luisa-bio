<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  EHeroAccents,
  EHeroAvatarRadii,
  EHeroCardRadii,
  EHeroExample,
  EHeroPool,
  type IHeroBio,
} from '../examples'

interface IHeroState {
  width: number
  height: number
  logicalWidth: number
  device: string
}

interface IHeroGeometry {
  width: number
  height: number
  logicalWidth: number
}

interface IHeroFrame {
  key: number
  bio: IHeroBio | null
  loaded: boolean
  background: string
}

interface IHeroTheme {
  accent: string
  cardRadius: number
  avatarRadius: string
}

const EPortrait: IHeroState = { width: 312, height: 416, logicalWidth: 390, device: 'Phone' }
const EStates: readonly IHeroState[] = [
  EPortrait,
  { width: 380, height: 380, logicalWidth: 820, device: 'Tablet' },
  { width: 448, height: 280, logicalWidth: 1280, device: 'Desktop' },
]
const ENarrowQuery = '(max-width: 959px)'
const ENarrowFactor = 0.7
const EHoldMs = 3200
const EMorphMs = 700
const EFadeMs = 400
const ELoadTimeoutMs = 4000

const card = ref<HTMLAnchorElement | null>(null)
const frames = ref<IHeroFrame[]>([
  { key: 0, bio: EHeroExample, loaded: false, background: '' },
  { key: 1, bio: null, loaded: false, background: '' },
])
const front = ref(0)
const stateIndex = ref(0)
const cycling = ref(false)
const measured = ref(false)
const scenes = ref(0)
const inView = ref(false)
const pageHidden = ref(false)

const current = computed(() => frames.value[front.value]?.bio ?? EHeroExample)
const paused = computed(() => !inView.value || pageHidden.value)

const frameEls: (HTMLIFrameElement | undefined)[] = []
let geometry: IHeroGeometry = {
  width: EPortrait.width,
  height: EPortrait.height,
  logicalWidth: EPortrait.logicalWidth,
}
let borderX = 0
let borderY = 0
let narrow = false
let tweening = false
let tweenLogical: { width: number; height: number } | undefined
let tweenFrame = 0
let fadeTimer: ReturnType<typeof setTimeout> | undefined
let nextKey = 2
let started = false
let awaiting: number | undefined
let waitingForLoad = false
let pendingTheme: IHeroTheme | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let task: (() => void) | undefined
let remaining = 0
let startedAt = 0
let narrowQuery: MediaQueryList | undefined
let sizeObserver: ResizeObserver | undefined
let viewObserver: IntersectionObserver | undefined

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function boxFor(index: number): IHeroGeometry {
  const state = EStates[index] ?? EPortrait
  const factor = narrow ? ENarrowFactor : 1
  return {
    width: state.width * factor,
    height: state.height * factor,
    logicalWidth: state.logicalWidth,
  }
}

function logicalHeight(box: IHeroGeometry) {
  return box.logicalWidth * ((box.height - borderY) / (box.width - borderX))
}

function layoutFrame(el: HTMLIFrameElement) {
  const size = tweenLogical ?? {
    width: geometry.logicalWidth,
    height: logicalHeight(geometry),
  }
  el.style.width = `${size.width}px`
  el.style.height = `${size.height}px`
  el.style.transform = `scale(${(geometry.width - borderX) / size.width})`
}

/** Card box and iframe geometry are written in the same pass, so the scaled page fills the card. */
function applyGeometry(next: IHeroGeometry, sizeCard: boolean) {
  geometry = next
  const cardEl = card.value
  if (!cardEl) {
    return
  }
  if (sizeCard) {
    cardEl.style.width = `${next.width}px`
    cardEl.style.height = `${next.height}px`
  }
  for (const el of frameEls) {
    if (el) {
      layoutFrame(el)
    }
  }
}

function setFrameEl(index: number, el: unknown) {
  frameEls[index] = el instanceof HTMLIFrameElement ? el : undefined
  if (el instanceof HTMLIFrameElement && measured.value) {
    layoutFrame(el)
  }
}

function setCardBackground(color: string) {
  if (card.value) {
    card.value.style.backgroundColor = color
  }
}

/**
 * The server-rendered iframe can finish loading before hydration attaches the
 * load listener, so check the same-origin document once on mount.
 */
function hasLoaded(el: HTMLIFrameElement) {
  try {
    const doc = el.contentDocument
    return doc !== null && doc.readyState === 'complete' && doc.URL !== 'about:blank'
  } catch {
    return false
  }
}

function readBackground(el: HTMLIFrameElement) {
  const doc = el.contentDocument
  const view = doc?.defaultView
  if (!doc || !view) {
    return ''
  }
  for (const node of [doc.querySelector('main'), doc.body]) {
    const color = node ? view.getComputedStyle(node).backgroundColor : ''
    if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
      return color
    }
  }
  return ''
}

function measure() {
  const cardEl = card.value
  if (!cardEl || tweening) {
    return
  }
  const rect = cardEl.getBoundingClientRect()
  if (rect.width === 0) {
    return
  }
  if (
    measured.value &&
    Math.abs(rect.width - geometry.width) < 0.5 &&
    Math.abs(rect.height - geometry.height) < 0.5
  ) {
    return
  }
  const style = getComputedStyle(cardEl)
  borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)
  borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
  applyGeometry({ ...geometry, width: rect.width, height: rect.height }, false)
  measured.value = true
  maybeStart()
}

function runTask() {
  if (!task || timer !== undefined) {
    return
  }
  startedAt = performance.now()
  timer = setTimeout(() => {
    const next = task
    task = undefined
    timer = undefined
    next?.()
  }, remaining)
}

function holdTask() {
  if (timer === undefined) {
    return
  }
  clearTimeout(timer)
  timer = undefined
  remaining = Math.max(0, remaining - (performance.now() - startedAt))
}

function schedule(ms: number, next: () => void) {
  clearTimeout(timer)
  timer = undefined
  task = next
  remaining = ms
  if (!paused.value) {
    runTask()
  }
}

/**
 * The iframe page is laid out once, at the target's exact geometry, so each frame only
 * rescales it. Where the card is taller than the scaled page, the card background
 * (already the page's own colour) fills the strip, and nothing moves when the tween ends.
 */
function tweenTo(index: number, done: () => void) {
  cancelAnimationFrame(tweenFrame)
  const from = geometry
  const to = boxFor(index)
  tweenLogical = { width: to.logicalWidth, height: logicalHeight(to) }
  tweening = true
  for (const el of frameEls) {
    if (el) {
      layoutFrame(el)
    }
  }
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min(1, Math.max(0, (now - start) / EMorphMs))
    const eased = 1 - (1 - progress) ** 3
    const width = lerp(from.width, to.width, eased)
    const height = lerp(from.height, to.height, eased)
    geometry = { width, height, logicalWidth: to.logicalWidth }
    const cardEl = card.value
    if (cardEl) {
      cardEl.style.width = `${width}px`
      cardEl.style.height = `${height}px`
    }
    const scale = (width - borderX) / to.logicalWidth
    for (const el of frameEls) {
      if (el) {
        el.style.transform = `scale(${scale})`
      }
    }
    if (progress < 1) {
      tweenFrame = requestAnimationFrame(step)
      return
    }
    tweening = false
    tweenLogical = undefined
    const settled = boxFor(index)
    if (settled.width !== to.width || settled.height !== to.height) {
      applyGeometry(settled, true)
    }
    done()
  }
  tweenFrame = requestAnimationFrame(step)
}

function goTo(index: number) {
  stateIndex.value = index
  const last = index === EStates.length - 1
  tweenTo(index, () => {
    if (last) {
      prepareScene()
    }
    schedule(EHoldMs, last ? endScene : () => goTo(index + 1))
  })
}

function maybeStart() {
  if (!cycling.value || started || !frames.value[0]?.loaded || !measured.value) {
    return
  }
  started = true
  schedule(EHoldMs, () => goTo(1))
}

/** Loads the next bio behind the visible one while the landscape state holds. */
function prepareScene(exclude?: string) {
  const back = front.value === 0 ? 1 : 0
  const bio = pick(
    EHeroPool.filter((item) => item.path !== current.value.path && item.path !== exclude),
  )
  pendingTheme = {
    accent: pick(EHeroAccents),
    cardRadius: pick(EHeroCardRadii),
    avatarRadius: pick(EHeroAvatarRadii),
  }
  awaiting = back
  frames.value[back] = { key: nextKey++, bio, loaded: false, background: '' }
}

function endScene() {
  stateIndex.value = 0
  tweenTo(0, finishScene)
}

function finishScene() {
  const frame = awaiting === undefined ? undefined : frames.value[awaiting]
  if (frame?.loaded) {
    crossfade()
    return
  }
  waitingForLoad = true
  schedule(ELoadTimeoutMs, () => {
    prepareScene(frame?.bio?.path)
    finishScene()
  })
}

function applyTheme(el: HTMLIFrameElement, theme: IHeroTheme) {
  const nodes = el.contentDocument?.querySelectorAll<HTMLElement>('.bio-theme') ?? []
  for (const node of nodes) {
    node.style.setProperty('--site-secondary', theme.accent)
    node.style.setProperty('--bio-card-radius', `${theme.cardRadius}px`)
    node.style.setProperty('--bio-avatar-radius', theme.avatarRadius)
  }
}

/** The hero is a preview, so the bio's own share button adds nothing there. */
function hideShareButton(el: HTMLIFrameElement) {
  const doc = el.contentDocument
  if (!doc) {
    return
  }
  const style = doc.createElement('style')
  style.textContent = '.share-btn{display:none!important}'
  doc.head.append(style)
}

function crossfade() {
  if (awaiting === undefined) {
    return
  }
  const incoming = awaiting
  front.value = incoming
  awaiting = undefined
  waitingForLoad = false
  scenes.value += 1
  clearTimeout(fadeTimer)
  fadeTimer = setTimeout(() => {
    setCardBackground(frames.value[incoming]?.background ?? '')
  }, EFadeMs / 2)
  schedule(EFadeMs + EHoldMs, () => goTo(1))
}

function markLoaded(index: number) {
  const frame = frames.value[index]
  const el = frameEls[index]
  if (!frame?.bio || !el || !hasLoaded(el)) {
    return
  }
  frame.loaded = true
  hideShareButton(el)
  if (index === awaiting && pendingTheme) {
    applyTheme(el, pendingTheme)
  }
  frame.background = readBackground(el)
  el.style.backgroundColor = frame.background
  if (index === awaiting) {
    if (waitingForLoad) {
      schedule(0, crossfade)
    }
    return
  }
  if (index === front.value) {
    setCardBackground(frame.background)
  }
  maybeStart()
}

function onNarrowChange(event: MediaQueryListEvent) {
  narrow = event.matches
  if (cycling.value && !tweening) {
    applyGeometry(boxFor(stateIndex.value), true)
  }
}

function onVisibilityChange() {
  pageHidden.value = document.hidden
}

watch(paused, (value) => {
  if (value) {
    holdTask()
  } else {
    runTask()
  }
})

onMounted(() => {
  const cardEl = card.value
  if (!cardEl) {
    return
  }
  cycling.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  narrowQuery = window.matchMedia(ENarrowQuery)
  narrow = narrowQuery.matches
  narrowQuery.addEventListener('change', onNarrowChange)
  pageHidden.value = document.hidden
  document.addEventListener('visibilitychange', onVisibilityChange)

  measure()
  markLoaded(0)
  sizeObserver = new ResizeObserver(measure)
  sizeObserver.observe(cardEl)
  viewObserver = new IntersectionObserver(([entry]) => {
    inView.value = entry?.isIntersecting ?? false
  })
  viewObserver.observe(cardEl)
})

onUnmounted(() => {
  clearTimeout(timer)
  timer = undefined
  task = undefined
  clearTimeout(fadeTimer)
  cancelAnimationFrame(tweenFrame)
  narrowQuery?.removeEventListener('change', onNarrowChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  sizeObserver?.disconnect()
  sizeObserver = undefined
  viewObserver?.disconnect()
  viewObserver = undefined
})
</script>

<template>
  <a
    ref="card"
    class="hero-preview"
    :class="{ 'has-cycled': scenes > 0 }"
    :href="current.path"
    target="_self"
    :aria-label="`Open the example page for ${current.name}`"
  >
    <div class="hero-preview__viewport">
      <template v-for="(frame, index) in frames" :key="frame.key">
        <iframe
          v-if="frame.bio"
          :ref="(el) => setFrameEl(index, el)"
          class="hero-preview__frame"
          :class="{ 'is-ready': index === front && frame.loaded && measured }"
          :src="frame.bio.path"
          :title="`Example bio page: ${frame.bio.name}`"
          tabindex="-1"
          aria-hidden="true"
          loading="eager"
          @load="markLoaded(index)"
        />
      </template>
    </div>
    <span
      v-for="(state, index) in EStates"
      :key="state.device"
      class="hero-preview__chip"
      :class="{ 'is-active': index === stateIndex }"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <template v-if="index === 0">
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <path d="M11 18h2" />
        </template>
        <template v-else-if="index === 1">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M11 18h2" />
        </template>
        <template v-else>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </template>
      </svg>
      {{ state.device }}
    </span>
  </a>
</template>
