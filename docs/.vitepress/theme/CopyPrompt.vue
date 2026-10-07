<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef } from 'vue'

import { EClaudeIconPath, ECursorIconPath, EOpenAIIconPath } from './agent-icons'
import { ECompanyPrompt, EFamilyPrompt } from './prompts'

type TAudience = 'family' | 'company'

interface IAudienceOption {
  value: TAudience
  label: string
}

interface IAgentLink {
  name: string
  iconPath: string
  href: string
  external: boolean
}

const EAudienceOptions: readonly IAudienceOption[] = [
  { value: 'family', label: 'Family or personal' },
  { value: 'company', label: 'Company or team' },
]

const ECopiedMs = 2000

const audience = ref<TAudience>('family')
const copied = ref(false)
const expanded = ref(false)
const switchGroup = useTemplateRef<HTMLDivElement>('switchGroup')
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const prompt = computed(() => (audience.value === 'family' ? EFamilyPrompt : ECompanyPrompt))
const lineCount = computed(() => prompt.value.split('\n').length)

const agentLinks = computed<IAgentLink[]>(() => {
  const encoded = encodeURIComponent(prompt.value)
  return [
    { name: 'Claude Code', iconPath: EClaudeIconPath, href: `claude://code/new?q=${encoded}`, external: false },
    { name: 'Codex', iconPath: EOpenAIIconPath, href: `codex://new?prompt=${encoded}`, external: false },
    { name: 'Cursor', iconPath: ECursorIconPath, href: `https://cursor.com/link/prompt?text=${encoded}`, external: true },
    { name: 'Claude', iconPath: EClaudeIconPath, href: `https://claude.ai/new?q=${encoded}`, external: true },
    { name: 'ChatGPT', iconPath: EOpenAIIconPath, href: `https://chatgpt.com/?q=${encoded}`, external: true },
  ]
})

function resetCopied() {
  clearTimeout(copiedTimer)
  copied.value = false
}

function select(next: TAudience) {
  audience.value = next
  resetCopied()
}

function onSwitchKeydown(event: KeyboardEvent, index: number) {
  const step =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0
  if (step === 0) return
  event.preventDefault()
  const nextIndex = (index + step + EAudienceOptions.length) % EAudienceOptions.length
  const next = EAudienceOptions[nextIndex]
  if (!next) return
  select(next.value)
  switchGroup.value?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus()
}

async function copy() {
  const text = prompt.value
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  clearTimeout(copiedTimer)
  copied.value = true
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, ECopiedMs)
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <section id="copy-prompt" class="copy-prompt" aria-labelledby="set-it-up-with-a-coding-agent">
    <div class="copy-prompt-container">
      <h2 id="set-it-up-with-a-coding-agent" tabindex="-1">Set it up with a coding agent <a class="header-anchor" href="#set-it-up-with-a-coding-agent" aria-label="Permalink to &quot;Set it up with a coding agent&quot;">&#8203;</a></h2>
      <p class="copy-prompt-lead">
        Choose who the site is for, then send the prompt to an agent that can use your terminal and
        your GitHub account. It asks for names, links and your domain before it changes anything, and
        it only works on your own fork.
      </p>

      <div
        ref="switchGroup"
        class="copy-prompt-switch"
        role="radiogroup"
        aria-label="Who the site is for"
      >
        <button
          v-for="(option, index) in EAudienceOptions"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="audience === option.value"
          :tabindex="audience === option.value ? 0 : -1"
          @click="select(option.value)"
          @keydown="onSwitchKeydown($event, index)"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="copy-prompt-actions">
        <button type="button" class="copy-prompt-primary" @click="copy">
          <svg v-if="copied" viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </svg>
          {{ copied ? 'Copied' : 'Copy prompt' }}
        </button>

        <div class="copy-prompt-open">
          <span class="copy-prompt-open-label">Open in</span>
          <a
            v-for="link in agentLinks"
            :key="link.name"
            class="copy-prompt-agent"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-mark">
              <path :d="link.iconPath" />
            </svg>
            {{ link.name }}
          </a>
        </div>
      </div>

      <p class="copy-prompt-hint">
        Claude Code and Codex open in their desktop apps. In a terminal, copy the prompt and paste it
        into <code>claude</code> or <code>codex</code>.
      </p>
      <p class="copy-prompt-status" role="status">{{ copied ? 'Prompt copied.' : '' }}</p>

      <div class="copy-prompt-panel">
        <div class="copy-prompt-panel-header">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke copy-prompt-doc">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
          </svg>
          <span class="copy-prompt-panel-title">Agent prompt</span>
          <span class="copy-prompt-panel-count">{{ lineCount }} lines</span>
          <div class="copy-prompt-panel-tools">
            <button type="button" class="copy-prompt-icon" aria-label="Copy prompt" @click="copy">
              <svg v-if="copied" viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
              </svg>
            </button>
            <button
              type="button"
              class="copy-prompt-icon"
              :class="{ 'is-expanded': expanded }"
              aria-controls="copy-prompt-body"
              :aria-expanded="expanded"
              :aria-label="expanded ? 'Hide the full prompt' : 'Show the full prompt'"
              @click="expanded = !expanded"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" class="copy-prompt-stroke copy-prompt-chevron">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
        <pre
          id="copy-prompt-body"
          class="copy-prompt-body"
          :class="{ 'is-expanded': expanded }"
          :tabindex="expanded ? 0 : undefined"
        ><code>{{ prompt }}</code></pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.copy-prompt {
  margin-bottom: 36px;
  padding: 0 24px;
}

@media (min-width: 640px) {
  .copy-prompt {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .copy-prompt {
    padding: 0 64px;
  }
}

.copy-prompt-container {
  max-width: 1152px;
  margin: 0 auto;
}

.copy-prompt-container h2 {
  position: relative;
  outline: none;
  margin: 48px 0 16px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
  color: var(--vp-c-text-1);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 32px;
}

/** The section sits outside .vp-doc, so the permalink styles of .vp-doc h2 are mirrored here. */
.copy-prompt .header-anchor {
  position: absolute;
  top: 24px;
  left: 0;
  margin-left: -0.87em;
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: none;
  user-select: none;
  opacity: 0;
  transition:
    color 0.25s,
    opacity 0.25s;
}

.copy-prompt .header-anchor::before {
  content: var(--vp-header-anchor-symbol);
}

.copy-prompt .header-anchor:hover {
  color: var(--vp-c-brand-2);
}

.copy-prompt h2:hover .header-anchor,
.copy-prompt .header-anchor:focus {
  opacity: 1;
}

.copy-prompt-lead {
  max-width: 62ch;
  margin: 0 0 20px;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.55;
}

.copy-prompt button,
.copy-prompt a {
  -webkit-tap-highlight-color: transparent;
}

.copy-prompt button:focus-visible,
.copy-prompt a:focus-visible,
.copy-prompt-body:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.copy-prompt-switch {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 20px;
  border-radius: 999px;
  padding: 4px;
  background: var(--vp-c-bg-soft);
}

.copy-prompt-switch button {
  border: 0;
  border-radius: 999px;
  padding: 7px 16px;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.copy-prompt-switch button:hover {
  color: var(--vp-c-text-1);
}

.copy-prompt-switch button[aria-checked='true'] {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  box-shadow:
    0 1px 2px rgba(20, 21, 27, 0.08),
    0 1px 4px rgba(20, 21, 27, 0.1);
}

/** In dark, --vp-c-bg-soft and --vp-c-bg-elv are the same color, so the switch needs its own values. */
.dark .copy-prompt-switch {
  border: 1px solid rgba(246, 246, 244, 0.08);
  padding: 3px;
  background: #1C1D25;
}

.dark .copy-prompt-switch button {
  border: 1px solid transparent;
  padding: 6px 15px;
}

.dark .copy-prompt-switch button[aria-checked='true'] {
  border-color: rgba(246, 246, 244, 0.12);
  background: #2A2C38;
}

.copy-prompt-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
}

.copy-prompt-stroke {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.copy-prompt-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  padding: 0 16px;
  background: #3A5BFF;
  color: #FFFFFF;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.copy-prompt-primary:hover {
  background: #2F4BE0;
  color: #FFFFFF;
}

.copy-prompt-open {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.copy-prompt-open-label {
  margin-right: 4px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.copy-prompt-agent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 12px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.copy-prompt-agent:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.copy-prompt-mark {
  width: 16px;
  height: 16px;
  flex: none;
  fill: currentColor;
}

.copy-prompt-hint {
  margin: 12px 0 20px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.copy-prompt-hint code {
  border-radius: 4px;
  padding: 1px 5px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.copy-prompt-status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.copy-prompt-panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.copy-prompt-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 6px 8px 6px 14px;
}

.copy-prompt-doc {
  color: var(--vp-c-text-2);
}

.copy-prompt-panel-title {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.copy-prompt-panel-count {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.copy-prompt-panel-tools {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.copy-prompt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.copy-prompt-icon:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.copy-prompt-chevron {
  transition: transform 0.2s ease;
}

.copy-prompt-icon.is-expanded .copy-prompt-chevron {
  transform: rotate(180deg);
}

.copy-prompt-body {
  max-height: calc(9.6em + 32px);
  overflow: hidden;
  margin: 0;
  padding: 16px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  mask-image: linear-gradient(to bottom, #000 45%, transparent);
}

.copy-prompt-body.is-expanded {
  max-height: 480px;
  overflow: auto;
  mask-image: none;
}

@media (max-width: 640px) {
  .copy-prompt-switch {
    display: flex;
  }

  .copy-prompt-switch button {
    flex: 1;
    padding: 7px 10px;
  }

  .dark .copy-prompt-switch button {
    padding: 6px 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .copy-prompt-switch button,
  .copy-prompt-primary,
  .copy-prompt-agent,
  .copy-prompt-icon,
  .copy-prompt-chevron,
  .copy-prompt .header-anchor {
    transition: none;
  }
}
</style>
