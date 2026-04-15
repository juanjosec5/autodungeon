import { ref } from 'vue'

// Singleton ref shared across all consumers so both the modal and the
// controls popover reflect and update the same value.
const alwaysAuto = ref(localStorage.getItem('levelUpAlwaysAuto') === 'true')

function toggleAlwaysAuto(): void {
  alwaysAuto.value = !alwaysAuto.value
  localStorage.setItem('levelUpAlwaysAuto', String(alwaysAuto.value))
}

export function useAutoPickSetting() {
  return { alwaysAuto, toggleAlwaysAuto }
}
