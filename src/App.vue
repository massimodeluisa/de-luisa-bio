<script setup lang="ts">
import { onMounted } from 'vue'

import { syncBrowserLocale } from '@/i18n'

onMounted(syncBrowserLocale)
</script>

<template lang="pug">
router-view
</template>
