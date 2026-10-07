<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import { pbkdf2, randomSaltHex } from '../../../../server/core/crypto'

interface IAdminUser {
  user: string
  slug: string
  salt: string
  passHash: string
}

type TField = 'user' | 'slug' | 'password'

const ESlugPattern = /^[a-z0-9-]+$/

const username = ref('')
const slug = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const hashing = ref(false)
const entries = ref<IAdminUser[]>([])
const latest = ref<IAdminUser | null>(null)
const status = ref('')
const submitButton = useTemplateRef<HTMLButtonElement>('submitButton')
const form = useTemplateRef<HTMLFormElement>('form')
const list = useTemplateRef<HTMLUListElement>('list')

const errors = computed<Partial<Record<TField, string>>>(() => {
  if (!submitted.value) return {}
  const found: Partial<Record<TField, string>> = {}
  if (username.value.trim() === '') found.user = 'Enter a username.'
  if (slug.value === '') found.slug = 'Enter the profile slug.'
  else if (!ESlugPattern.test(slug.value)) found.slug = 'Use only lowercase letters, numbers and hyphens.'
  if (password.value === '') found.password = 'Enter a password.'
  return found
})

const latestJson = computed(() => (latest.value ? JSON.stringify(latest.value) : ''))

/** Clearing first makes screen readers announce a message even when it repeats. */
async function announce(message: string) {
  status.value = ''
  await nextTick()
  status.value = message
}

async function copyText(text: string) {
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
  await announce('Copied')
}

async function generate() {
  if (hashing.value) return
  submitted.value = true
  const invalid = (['user', 'slug', 'password'] as const).find((field) => errors.value[field])
  if (invalid) {
    form.value?.querySelector<HTMLInputElement>(`#admin-hasher-${invalid}`)?.focus()
    return
  }

  const user = username.value
  const entrySlug = slug.value
  hashing.value = true
  try {
    const salt = randomSaltHex()
    const entry: IAdminUser = { user, slug: entrySlug, salt, passHash: await pbkdf2(password.value, salt) }
    submitted.value = false
    password.value = ''
    const index = entries.value.findIndex((existing) => existing.user === user)
    if (index === -1) {
      entries.value.push(entry)
      await announce(`Added the entry for ${user}`)
    } else {
      entries.value.splice(index, 1, entry)
      await announce(`Replaced the entry for ${user}`)
    }
    latest.value = entry
  } catch {
    await announce('Hashing failed in this browser. Run the terminal command below instead.')
  } finally {
    submitted.value = false
    password.value = ''
    hashing.value = false
  }

  await nextTick()
  if (!document.activeElement || document.activeElement === document.body) submitButton.value?.focus()
}

async function remove(index: number) {
  const [removed] = entries.value.splice(index, 1)
  if (!removed) return
  await announce(`Removed ${removed.user}`)
  await nextTick()
  const buttons = list.value?.querySelectorAll<HTMLButtonElement>('button')
  const next = buttons?.[Math.min(index, buttons.length - 1)]
  if (next) next.focus()
  else submitButton.value?.focus()
}
</script>

<template>
  <div class="admin-hasher">
    <form ref="form" class="admin-hasher-form" novalidate @submit.prevent="generate">
      <div class="admin-hasher-fields">
        <div class="admin-hasher-field">
          <label for="admin-hasher-user">Username</label>
          <input
            id="admin-hasher-user"
            v-model="username"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            :aria-invalid="errors.user ? 'true' : undefined"
            :aria-describedby="errors.user ? 'admin-hasher-user-error' : undefined"
          />
          <p v-if="errors.user" id="admin-hasher-user-error" class="admin-hasher-error">
            {{ errors.user }}
          </p>
        </div>

        <div class="admin-hasher-field">
          <label for="admin-hasher-slug">Profile slug</label>
          <input
            id="admin-hasher-slug"
            v-model="slug"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            :aria-invalid="errors.slug ? 'true' : undefined"
            :aria-describedby="
              errors.slug ? 'admin-hasher-slug-hint admin-hasher-slug-error' : 'admin-hasher-slug-hint'
            "
          />
          <p id="admin-hasher-slug-hint" class="admin-hasher-hint">
            Lowercase letters, numbers and hyphens, the file name in content/bios/
          </p>
          <p v-if="errors.slug" id="admin-hasher-slug-error" class="admin-hasher-error">
            {{ errors.slug }}
          </p>
        </div>

        <div class="admin-hasher-field admin-hasher-field-wide">
          <label for="admin-hasher-password">Password</label>
          <div class="admin-hasher-secret">
            <input
              id="admin-hasher-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              autocapitalize="off"
              spellcheck="false"
              required
              :aria-invalid="errors.password ? 'true' : undefined"
              :aria-describedby="errors.password ? 'admin-hasher-password-error' : undefined"
            />
            <button
              type="button"
              class="admin-hasher-button"
              aria-controls="admin-hasher-password"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              Show password
            </button>
          </div>
          <p v-if="errors.password" id="admin-hasher-password-error" class="admin-hasher-error">
            {{ errors.password }}
          </p>
        </div>
      </div>

      <button ref="submitButton" type="submit" class="admin-hasher-primary" :disabled="hashing">
        {{ hashing ? 'Hashing…' : 'Generate entry' }}
      </button>
      <p class="admin-hasher-note">
        Runs in your browser with Web Crypto: PBKDF2, SHA-256, 100,000 iterations, the same function
        the admin API uses to check passwords. Nothing is sent or stored.
      </p>
    </form>

    <div v-if="latest" class="admin-hasher-section">
      <div class="admin-hasher-section-header">
        <span class="admin-hasher-section-title">Entry</span>
        <button type="button" class="admin-hasher-button" @click="copyText(latestJson)">
          Copy entry
        </button>
      </div>
      <pre class="admin-hasher-output"><code>{{ latestJson }}</code></pre>
    </div>

    <div v-if="entries.length > 0" class="admin-hasher-section">
      <div class="admin-hasher-section-header">
        <span class="admin-hasher-section-title">ADMIN_USERS</span>
        <button
          type="button"
          class="admin-hasher-button"
          @click="copyText(JSON.stringify(entries))"
        >
          Copy ADMIN_USERS
        </button>
      </div>
      <ul ref="list" class="admin-hasher-list">
        <li v-for="(entry, index) in entries" :key="entry.user">
          <span class="admin-hasher-row">{{ entry.user }} → {{ entry.slug }}</span>
          <button
            type="button"
            class="admin-hasher-button"
            :aria-label="`Remove ${entry.user}`"
            @click="remove(index)"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>

    <p class="admin-hasher-status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<style scoped>
.admin-hasher {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.admin-hasher-form {
  padding: 20px;
}

.admin-hasher-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (min-width: 640px) {
  .admin-hasher-fields {
    grid-template-columns: 1fr 1fr;
  }

  .admin-hasher-field-wide {
    grid-column: 1 / -1;
  }
}

.admin-hasher-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.admin-hasher-field label {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.admin-hasher-field input {
  width: 100%;
  min-width: 0;
  height: 36px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 14px;
}

.admin-hasher-field input:focus {
  border-color: var(--vp-c-brand-1);
}

.admin-hasher-field input[aria-invalid='true'] {
  border-color: var(--vp-c-danger-1);
}

.admin-hasher-secret {
  display: flex;
  gap: 8px;
}

.admin-hasher-secret input {
  flex: 1;
}

@media (max-width: 399.98px) {
  .admin-hasher-secret {
    flex-wrap: wrap;
  }

  .admin-hasher-secret button {
    width: 100%;
  }
}

.admin-hasher-hint,
.admin-hasher-error {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.admin-hasher-hint {
  color: var(--vp-c-text-2);
}

.admin-hasher-error {
  color: var(--vp-c-danger-1);
}

.admin-hasher button {
  -webkit-tap-highlight-color: transparent;
}

.admin-hasher button:focus-visible,
.admin-hasher input:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.admin-hasher-primary {
  display: inline-flex;
  align-items: center;
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

.admin-hasher-primary:hover {
  background: #2F4BE0;
  color: #FFFFFF;
}

.admin-hasher-primary:disabled {
  cursor: progress;
  opacity: 0.7;
}

.admin-hasher-button {
  flex: none;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 12px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.admin-hasher-button:hover {
  border-color: var(--vp-c-brand-1);
}

.admin-hasher-button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-1);
}

.admin-hasher-note {
  max-width: 62ch;
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.admin-hasher-section {
  border-top: 1px solid var(--vp-c-divider);
  padding: 16px 20px;
}

.admin-hasher-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.admin-hasher-section-title {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.admin-hasher-output {
  margin: 0;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.admin-hasher-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-hasher-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 8px 0;
}

.admin-hasher-list li:first-child {
  border-top: 0;
  padding-top: 0;
}

.admin-hasher-row {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.admin-hasher-status {
  margin: 0;
  padding: 0 20px 16px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.admin-hasher-status:empty {
  padding: 0;
}

@media (prefers-reduced-motion: reduce) {
  .admin-hasher-primary,
  .admin-hasher-button {
    transition: none;
  }
}
</style>
