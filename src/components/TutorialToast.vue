<script setup lang="ts">
import type { PanelId } from '../types/index'

defineProps<{
  panelId: PanelId
  title: string
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()
</script>

<template>
  <div class="tutorial-toast">
    <div class="toast-header">
      <span class="toast-title">{{ title }}</span>
      <button class="toast-dismiss" @click="emit('dismiss')">Got it</button>
    </div>
    <div class="toast-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tutorial-toast {
  background: rgba(14, 12, 28, 0.95);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  padding: 8px 10px;
  margin-bottom: 10px;
}

.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.toast-title {
  font-size: 8px;
  color: var(--gold);
  letter-spacing: 0.5px;
}

.toast-dismiss {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 6px;
  padding: 2px 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.toast-dismiss:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.toast-body {
  font-size: 7px;
  color: var(--text-dim);
  line-height: 1.7;
}
</style>
