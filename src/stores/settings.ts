import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LS_KEYS } from '../utils/storage'

/** Available UI scale factors — applied as CSS zoom on the document root */
export const UI_SCALES = [1, 1.25, 1.5] as const
export type UiScale = (typeof UI_SCALES)[number]

/**
 * Display/preference settings that aren't part of any save slot.
 * The pixel UI uses hardcoded px sizing (Press Start 2P at 7–9px), which
 * reads tiny on large or high-DPI desktop screens — uiScale zooms the whole
 * document instead of restyling every component.
 */
export const useSettingsStore = defineStore('settings', () => {
  const uiScale = ref<UiScale>(1)

  function _apply(): void {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('zoom', String(uiScale.value))
  }

  function setUiScale(scale: UiScale): void {
    uiScale.value = scale
    localStorage.setItem(LS_KEYS.uiScale, String(scale))
    _apply()
  }

  function load(): void {
    const saved = Number(localStorage.getItem(LS_KEYS.uiScale))
    if ((UI_SCALES as readonly number[]).includes(saved)) {
      uiScale.value = saved as UiScale
    }
    _apply()
  }

  return { uiScale, setUiScale, load }
})
