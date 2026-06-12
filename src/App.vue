<script setup lang="ts">
import { useSettingsStore } from './stores/settings'

// Apply persisted display settings (UI scale) before anything renders
useSettingsStore().load()
</script>

<template>
  <RouterView />
</template>
