<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { EExamples } from '../examples'

gsap.registerPlugin(ScrollTrigger)

const EWideQuery = '(min-width: 960px)'
const EWideFrameWidth = 1280
const ENarrowFrameWidth = 390
const ENavHeightFallback = 64
const EAdvanceMs = 7000

interface IMorphFrom {
  x: number
  toX: number
  scale: number
  clip: number
}

const root = ref<HTMLElement | null>(null)
const slot = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const reduced = ref(false)
const motion = ref(false)
const activeIndex = ref(0)
const primed = ref<boolean[]>(EExamples.map((_, index) => index < 2))
const keyboardFocus = ref(false)
const inView = ref(false)
const pageHidden = ref(false)
const frameScale = ref(1)

const active = computed(() => EExamples[activeIndex.value])
const running = computed(
  () => motion.value && inView.value && !pageHidden.value && !keyboardFocus.value,
)

let ctx: gsap.Context | undefined
let viewObserver: IntersectionObserver | undefined
let sizeObserver: ResizeObserver | undefined
let progressFrame = 0
let elapsed = 0
let lastTime: number | undefined

function fillAt(index: number) {
  return stage.value?.querySelectorAll<HTMLElement>('.home-live__fill')[index]
}

function show(index: number) {
  const count = EExamples.length
  const next = (index + count) % count
  fillAt(activeIndex.value)?.style.removeProperty('transform')
  activeIndex.value = next
  primed.value[next] = true
  primed.value[(next + 1) % count] = true
  elapsed = 0
}

function tick(now: number) {
  if (lastTime !== undefined) {
    elapsed += now - lastTime
  }
  lastTime = now
  const progress = Math.min(1, elapsed / EAdvanceMs)
  fillAt(activeIndex.value)?.style.setProperty('transform', `scaleX(${progress})`)
  if (progress >= 1) {
    show(activeIndex.value + 1)
  }
  progressFrame = requestAnimationFrame(tick)
}

function stopProgress() {
  cancelAnimationFrame(progressFrame)
  progressFrame = 0
  lastTime = undefined
}

watch(running, (value) => {
  if (value) {
    stopProgress()
    progressFrame = requestAnimationFrame(tick)
  } else {
    stopProgress()
  }
})

function onControlsFocusIn(event: FocusEvent) {
  keyboardFocus.value = event.target instanceof Element && event.target.matches(':focus-visible')
}

function onControlsFocusOut() {
  keyboardFocus.value = false
}

function onVisibilityChange() {
  pageHidden.value = document.hidden
}

function gsapNumber(el: HTMLElement, prop: string, fallback: number) {
  const value = gsap.getProperty(el, prop)
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : fallback
}

/** VitePress only fixes the nav from 960px; below that it scrolls away with the page. */
function navHeight() {
  if (!window.matchMedia(EWideQuery).matches) {
    return 0
  }
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height'),
  )
  return Number.isFinite(value) ? value : ENavHeightFallback
}

/** Never taller than the scaled stage, so the clip cannot leave an empty band in the slot. */
function fitSlot(slotEl: HTMLElement, stageHeight: number) {
  const width = slotEl.getBoundingClientRect().width
  const aspect = window.matchMedia(EWideQuery).matches ? 16 / 9 : 3 / 4
  const height = Math.min(width / aspect, (width * stageHeight) / window.innerWidth)
  slotEl.style.height = `${height}px`
}

function measureFrom(): IMorphFrom | null {
  const slotEl = slot.value
  const stageEl = stage.value
  const stageHeight = window.innerHeight - navHeight()
  if (!slotEl || !stageEl || window.innerWidth === 0 || stageHeight <= 0) {
    return null
  }

  fitSlot(slotEl, stageHeight)
  // Read the slot before touching the stage, so a 100vw box cannot inflate the card.
  const slotRect = slotEl.getBoundingClientRect()

  stageEl.style.width = `${window.innerWidth}px`
  stageEl.style.height = `${stageHeight}px`
  /**
   * Park on the viewport left using the snapped slot, not 50vw. GSAP x is then
   * the remaining delta, so the two offsets cannot stack.
   */
  stageEl.style.marginLeft = `${-slotRect.left}px`

  const currentX = gsapNumber(stageEl, 'x', 0)
  const currentScale = gsapNumber(stageEl, 'scaleX', 1)
  const stageRect = stageEl.getBoundingClientRect()
  const unscaledWidth = stageRect.width / currentScale
  const unscaledHeight = stageRect.height / currentScale
  // Origin is top left, so scale does not move the left edge.
  const layoutLeft = stageRect.left - currentX
  const scale = unscaledWidth === 0 ? 1 : slotRect.width / unscaledWidth

  return {
    x: slotRect.left - layoutLeft,
    toX: -layoutLeft,
    scale,
    clip: Math.max(0, unscaledHeight - slotRect.height / scale),
  }
}

function setupMorph() {
  const stageEl = stage.value
  const slotEl = slot.value
  const trackEl = track.value
  if (!stageEl || !slotEl || !trackEl || !root.value) {
    return
  }

  ctx?.revert()
  ctx = gsap.context(() => {
    gsap.set(stageEl, { transformOrigin: 'top left' })
    let from = measureFrom()
    if (!from) {
      return
    }

    gsap.set(stageEl, {
      x: from.x,
      y: 0,
      scale: from.scale,
      '--home-live-clip': from.clip,
      '--home-live-radius': 8,
      autoAlpha: 1,
    })

    gsap.fromTo(
      stageEl,
      {
        x: () => from?.x ?? 0,
        y: 0,
        scale: () => from?.scale ?? 1,
        '--home-live-clip': () => from?.clip ?? 0,
        '--home-live-radius': 8,
      },
      {
        x: () => from?.toX ?? 0,
        y: 0,
        scale: 1,
        '--home-live-clip': 0,
        '--home-live-radius': 0,
        ease: 'power3.inOut',
        immediateRender: true,
        scrollTrigger: {
          trigger: slotEl,
          endTrigger: trackEl,
          start: 'top 70%',
          end: () => `top ${navHeight()}px`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onRefresh: () => {
            const next = measureFrom()
            if (next) {
              from = next
            }
          },
        },
      },
    )
  }, root.value)
}

function onResize() {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  pageHidden.value = document.hidden
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onResize, { passive: true })

  if (root.value) {
    viewObserver = new IntersectionObserver(([entry]) => {
      inView.value = entry?.isIntersecting ?? false
    })
    viewObserver.observe(root.value)
  }

  if (reduced.value) {
    const stageEl = stage.value
    if (stageEl) {
      sizeObserver = new ResizeObserver(() => {
        const frameWidth = window.matchMedia(EWideQuery).matches
          ? EWideFrameWidth
          : ENarrowFrameWidth
        if (stageEl.clientWidth > 0) {
          frameScale.value = stageEl.clientWidth / frameWidth
        }
      })
      sizeObserver.observe(stageEl)
    }
    return
  }

  motion.value = true
  requestAnimationFrame(() => {
    setupMorph()
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  })
})

onUnmounted(() => {
  stopProgress()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onResize)
  viewObserver?.disconnect()
  viewObserver = undefined
  sizeObserver?.disconnect()
  sizeObserver = undefined
  ctx?.revert()
  ctx = undefined
})
</script>

<template>
  <div
    ref="root"
    class="home-live"
    :class="{ 'is-reduced': reduced }"
    :style="reduced ? { '--home-live-frame-scale': frameScale } : undefined"
  >
    <div class="home-live__intro">
      <div ref="slot" class="home-live__slot"></div>
      <p class="home-live__caption" aria-live="polite">
        <template v-if="active">{{ active.title }}: {{ active.caption }}</template>
      </p>
    </div>
    <div ref="track" class="home-live__track">
      <div class="home-live__sticky">
        <div ref="stage" class="home-live__stage">
          <div
            v-for="(example, index) in EExamples"
            :key="example.id"
            class="home-live__slide"
            :class="{ 'is-active': index === activeIndex }"
          >
            <iframe
              class="home-live__frame"
              :src="primed[index] ? example.path : undefined"
              :title="`${example.title} example site`"
              tabindex="-1"
              aria-hidden="true"
            />
            <a
              class="home-live__open"
              :href="example.path"
              target="_self"
              tabindex="-1"
              aria-hidden="true"
            ></a>
          </div>
          <div
            class="home-live__controls"
            @focusin="onControlsFocusIn"
            @focusout="onControlsFocusOut"
          >
            <div v-if="active" class="home-live__head">
              <div class="home-live__info">
                <p class="home-live__title">{{ active.title }}</p>
                <p class="home-live__text">{{ active.caption }}</p>
              </div>
              <a class="home-live__link" :href="active.path" target="_self">Open example</a>
            </div>
            <div class="home-live__segments">
              <button
                v-for="(example, index) in EExamples"
                :key="example.id"
                type="button"
                class="home-live__segment"
                :class="{
                  'is-done': !reduced && index < activeIndex,
                  'is-active': index === activeIndex,
                }"
                :aria-label="`Show ${example.title}`"
                :aria-current="index === activeIndex ? 'true' : undefined"
                @click="show(index)"
              >
                <span class="home-live__bar">
                  <span class="home-live__fill"></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
