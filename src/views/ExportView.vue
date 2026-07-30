<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

import { useHead, useSeoMeta } from '@unhead/vue'

import { useCurrentBio } from '@/composables/use-current-bio'
import { track } from '@/composables/use-analytics'
import { DEFAULT_FAVICON } from '@/lib/letter-glyph'
import { FONT_STACK, loadFont } from '@/lib/load-font'
import { useI18n } from '@/i18n'

type TBackground = 'primary' | 'secondary' | 'transparent'
type TBorder = 'none' | 'theme' | 'primary' | 'secondary'
type TFormat = 'webp' | 'png' | 'jpg'

const HAS_EXT = /\.(webp|png|jpe?g|avif)$/i
const SIZE_OPTIONS = [256, 512, 1024, 2048] as const
const FORMAT_OPTIONS: { value: TFormat; label: string }[] = [
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
]

const { t } = useI18n()
const { slug, bio, notFound } = useCurrentBio()

const background = ref<TBackground>('primary')
const cornerRadius = ref(100)
const border = ref<TBorder>('none')
const size = ref<number>(1024)
const format = ref<TFormat>('png')

// JPG has no alpha channel, so it can't be paired with a transparent background.
watch(format, (value) => {
  if (value === 'jpg' && background.value === 'transparent') {
    background.value = 'primary'
  }
})
watch(background, (value) => {
  if (value === 'transparent' && format.value === 'jpg') {
    format.value = 'png'
  }
})

function optionClass(active: boolean): string {
  return active
    ? 'border-transparent bg-site-heading text-site-background'
    : 'border-site-border bg-site-surface/70 text-site-heading hover:border-site-secondary'
}

const themeStyle = computed(() => {
  const theme = bio.value?.theme
  if (!theme) {
    return {}
  }
  return {
    '--site-primary': theme.primary,
    '--site-secondary': theme.secondary,
    '--bio-card-radius': `${theme.cardRadius}px`,
    '--bio-avatar-radius': `${theme.avatarRadius}px`,
    '--bio-avatar-border': `${theme.avatarBorderWidth}px solid ${theme.avatarBorderColor}`,
    fontFamily: FONT_STACK[theme.font],
  } as Record<string, string>
})

const seoTitle = computed(() => (bio.value ? `${bio.value.name} — Export` : 'Export'))

useSeoMeta({
  title: () => seoTitle.value,
  robots: 'noindex, nofollow',
})

useHead({
  link: [
    { rel: 'icon', href: () => (bio.value ? `/favicons/${bio.value.slug}.svg` : DEFAULT_FAVICON) },
  ],
})

watchEffect(() => {
  if (bio.value) {
    void loadFont(bio.value.theme.font)
  }
})

const srcFull = computed(() => {
  const avatar = bio.value?.avatar
  if (!avatar) {
    return null
  }
  return HAS_EXT.test(avatar) ? avatar : `${avatar}-original.webp`
})

const photoImg = ref<HTMLImageElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)

const maxNative = computed(() => {
  const img = photoImg.value
  return img ? Math.min(img.naturalWidth, img.naturalHeight) : null
})
const anySizeDisabled = computed(() => {
  const max = maxNative.value
  return max !== null && SIZE_OPTIONS.some((opt) => opt > max)
})

// Clamp the selected export size down when the loaded photo can't fill it without upscaling.
watch(maxNative, (max) => {
  if (max === null || size.value <= max) {
    return
  }
  const allowed = SIZE_OPTIONS.filter((opt) => opt <= max)
  size.value = allowed[allowed.length - 1] ?? SIZE_OPTIONS[0]
})

function renderTo(canvas: HTMLCanvasElement, px: number): void {
  canvas.width = px
  canvas.height = px
  const b = bio.value
  const ctx = canvas.getContext('2d')
  if (!b || !ctx) {
    return
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  const theme = b.theme
  const REF = 240
  const scale = px / REF
  const radius = (cornerRadius.value / 100) * (px / 2)

  ctx.clearRect(0, 0, px, px)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, px, px, radius)
  ctx.clip()

  const bg = background.value
  if (bg !== 'transparent') {
    ctx.fillStyle = theme[bg]
    ctx.fillRect(0, 0, px, px)
  }

  if (photoImg.value) {
    ctx.drawImage(photoImg.value, 0, 0, px, px)
  } else {
    ctx.fillStyle = theme.glyphColor ?? theme.primary
    ctx.fillRect(0, 0, px, px)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 ${Math.round(px * 0.58)}px Geist, ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(b.name[0]?.toUpperCase() ?? '?', px / 2, px / 2)
  }

  ctx.restore()

  const borderValue = border.value
  if (borderValue !== 'none') {
    const w = Math.max(1, theme.avatarBorderWidth * scale)
    const color = borderValue === 'theme' ? theme.avatarBorderColor : theme[borderValue]
    ctx.beginPath()
    ctx.roundRect(w / 2, w / 2, px - w, px - w, Math.max(0, radius - w / 2))
    ctx.lineWidth = w
    ctx.strokeStyle = color
    ctx.stroke()
  }
}

onMounted(() => {
  watchEffect(() => {
    const src = srcFull.value
    photoImg.value = null
    if (!src) {
      return
    }
    const img = new Image()
    img.src = src
    img
      .decode()
      .then(() => {
        photoImg.value = img
      })
      .catch(() => {
        /* keep the glyph fallback */
      })
  })

  watchEffect(() => {
    const canvas = previewCanvas.value
    if (canvas) {
      renderTo(canvas, 512)
    }
  })
})

function mimeFor(f: TFormat): string {
  switch (f) {
    case 'webp':
      return 'image/webp'
    case 'jpg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
  }
}

const filename = computed(() => {
  const b = bio.value
  if (!b) {
    return ''
  }
  const borderSuffix = border.value === 'none' ? '' : `-${border.value}-border`
  return `${b.slug}-avatar-${size.value}px-${background.value}-r${cornerRadius.value}${borderSuffix}.${format.value}`
})

function makeBlob(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!bio.value) {
      resolve(null)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = size.value
    canvas.height = size.value
    renderTo(canvas, size.value)
    const mime = mimeFor(format.value)
    const quality = format.value === 'png' ? undefined : 0.95
    canvas.toBlob((blob) => resolve(blob), mime, quality)
  })
}

function trackPayload() {
  return {
    bio: slug.value,
    format: format.value,
    size: size.value,
    background: background.value,
    cornerRadius: cornerRadius.value,
    border: border.value,
  }
}

async function onDownload() {
  const blob = await makeBlob()
  if (!blob) {
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.value
  a.click()
  URL.revokeObjectURL(url)
  track('export_download', trackPayload())
}

const canShare = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.canShare === 'function',
)

async function onShare() {
  const blob = await makeBlob()
  if (!blob || !bio.value) {
    return
  }
  const file = new File([blob], filename.value, { type: mimeFor(format.value) })
  if (!navigator.canShare({ files: [file] })) {
    return
  }
  try {
    await navigator.share({ files: [file], title: bio.value.name })
    track('export_share', trackPayload())
  } catch {
    /* dismissed */
  }
}
</script>

<template lang="pug">
main.export-page.relative.flex.min-h-dvh.flex-col.items-center.gap-8.overflow-x-clip.bg-site-background.text-site-text.px-4.py-10(
  v-if="bio"
  :style="themeStyle"
)
  header.flex.w-full.max-w-md.flex-col.items-center.gap-2.text-center
    a.self-start.font-mono.text-xs.uppercase.tracking-widest.text-site-secondary.no-underline.transition-colors(
      :href="`/${slug}`"
      :aria-label="t('export.back', 'Back')"
      class="hover:text-site-heading"
    ) ← {{ bio.name }}
    h1.text-2xl.font-semibold.text-site-heading {{ t('export.title', 'Export avatar') }}

  .preview-frame.relative.mx-auto.flex.items-center.justify-center(
    class="size-64 max-w-[20rem]"
    :class="{ checkerboard: background === 'transparent' }"
  )
    canvas.size-full(ref="previewCanvas")

  .flex.w-full.max-w-md.flex-col.gap-6
    section
      h2.mb-2.font-mono.text-site-muted(class="text-[11px] uppercase tracking-[0.18em]") {{ t('export.background', 'Background') }}
      .flex.flex-wrap.gap-2
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="background === 'primary'"
          :class="optionClass(background === 'primary')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="background = 'primary'"
        )
          span.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10" :style="{ backgroundColor: bio.theme.primary }")
          span {{ t('export.bgPrimary', 'Primary') }}
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="background === 'secondary'"
          :class="optionClass(background === 'secondary')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="background = 'secondary'"
        )
          span.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10" :style="{ backgroundColor: bio.theme.secondary }")
          span {{ t('export.bgSecondary', 'Secondary') }}
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :disabled="format === 'jpg'"
          :aria-pressed="background === 'transparent'"
          :class="optionClass(background === 'transparent')"
          class="transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="background = 'transparent'"
        )
          span.swatch-transparent.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10")
          span {{ t('export.bgTransparent', 'Transparent') }}
      p.mt-2.text-xs.text-site-muted(v-if="format === 'jpg'") {{ t('export.jpgNoTransparency', 'JPG does not support transparency') }}

    section
      h2.mb-2.font-mono.text-site-muted(class="text-[11px] uppercase tracking-[0.18em]") {{ t('export.cornerRadius', 'Corner radius') }}
      .flex.items-center.gap-3
        input.w-full(
          type="range"
          min="0"
          max="100"
          step="1"
          v-model.number="cornerRadius"
          style="accent-color: var(--site-secondary)"
        )
        span.w-12.shrink-0.text-right.text-sm.text-site-muted {{ cornerRadius }}%

    section
      h2.mb-2.font-mono.text-site-muted(class="text-[11px] uppercase tracking-[0.18em]") {{ t('export.border', 'Border') }}
      .flex.flex-wrap.gap-2
        button.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="border === 'none'"
          :class="optionClass(border === 'none')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="border = 'none'"
        ) {{ t('export.borderNone', 'None') }}
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="border === 'theme'"
          :class="optionClass(border === 'theme')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="border = 'theme'"
        )
          span.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10" :style="{ backgroundColor: bio.theme.avatarBorderColor }")
          span {{ t('export.borderTheme', 'Theme') }}
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="border === 'primary'"
          :class="optionClass(border === 'primary')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="border = 'primary'"
        )
          span.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10" :style="{ backgroundColor: bio.theme.primary }")
          span {{ t('export.bgPrimary', 'Primary') }}
        button.flex.items-center.gap-2.rounded-full.border.px-4.py-2.text-sm.font-medium(
          type="button"
          :aria-pressed="border === 'secondary'"
          :class="optionClass(border === 'secondary')"
          class="transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="border = 'secondary'"
        )
          span.inline-block.size-3.shrink-0.rounded-full(class="border border-black/10" :style="{ backgroundColor: bio.theme.secondary }")
          span {{ t('export.bgSecondary', 'Secondary') }}

    section
      h2.mb-2.font-mono.text-site-muted(class="text-[11px] uppercase tracking-[0.18em]") {{ t('export.size', 'Size') }}
      .flex.flex-wrap.gap-2
        button.rounded-full.border.px-4.py-2.text-sm.font-medium(
          v-for="opt in SIZE_OPTIONS"
          :key="opt"
          type="button"
          :disabled="maxNative !== null && opt > maxNative"
          :aria-pressed="size === opt"
          :class="optionClass(size === opt)"
          class="transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="size = opt"
        ) {{ opt }}px
      p.mt-2.text-xs.text-site-muted(v-if="anySizeDisabled") {{ t('export.upscaleHint', 'Sizes above the photo resolution are disabled to avoid blurry upscaling.') }}

    section
      h2.mb-2.font-mono.text-site-muted(class="text-[11px] uppercase tracking-[0.18em]") {{ t('export.format', 'Format') }}
      .flex.flex-wrap.gap-2
        button.rounded-full.border.px-4.py-2.text-sm.font-medium(
          v-for="opt in FORMAT_OPTIONS"
          :key="opt.value"
          type="button"
          :disabled="opt.value === 'jpg' && background === 'transparent'"
          :aria-pressed="format === opt.value"
          :class="optionClass(format === opt.value)"
          class="transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="format = opt.value"
        ) {{ opt.label }}
      p.mt-2.text-xs.text-site-muted(v-if="background === 'transparent'") {{ t('export.jpgNoTransparency', 'JPG does not support transparency') }}

  .flex.w-full.max-w-md.gap-3
    button.flex-1.rounded-full.bg-site-heading.py-3.text-sm.font-semibold.text-site-background(
      type="button"
      class="transition active:scale-[0.99] hover:bg-site-secondary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
      @click="onDownload"
    ) {{ t('export.download', 'Download') }}
    button.flex-1.rounded-full.border.border-site-border.text-site-heading(
      v-if="canShare"
      type="button"
      class="bg-site-surface/70 py-3 text-sm font-semibold transition active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
      @click="onShare"
    ) {{ t('export.share', 'Share') }}

main.flex.min-h-dvh.flex-col.items-center.justify-center.gap-3.bg-site-background.text-site-text.px-6.text-center(
  v-else-if="notFound"
)
  h1.text-2xl.font-semibold.text-site-heading 404
  p.text-sm.text-site-muted No bio found for “{{ slug }}”.
  a.text-sm.text-site-secondary.no-underline(href="/") ← deluisa.bio
</template>

<style scoped lang="scss">
.checkerboard {
  background-image: repeating-conic-gradient(
    color-mix(in oklab, var(--site-heading) 8%, transparent) 0% 25%,
    transparent 0% 50%
  );
  background-size: 20px 20px;
}

.swatch-transparent {
  background-image: repeating-conic-gradient(
    color-mix(in oklab, var(--site-heading) 16%, transparent) 0% 25%,
    transparent 0% 50%
  );
  background-size: 6px 6px;
}
</style>
