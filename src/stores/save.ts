import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'
import { useCharacterStore } from './character'
import { usePrestigeStore } from './prestige'

const LS_KEY = 'autodungeon_character'
const AUTOSAVE_INTERVAL_MS = 30_000

export const useSaveStore = defineStore('save', () => {
  const lastSaved = ref<string | null>(null)
  const isSaving = ref(false)

  setInterval(() => saveCharacter(), AUTOSAVE_INTERVAL_MS)

  async function saveCharacter(): Promise<void> {
    const characterStore = useCharacterStore()
    const authStore = useAuthStore()
    const char = characterStore.character
    if (!char) return

    isSaving.value = true

    // Accumulate time played since last save
    if (char.lifetime) {
      const elapsed = Date.now() - new Date(char.lastSaved).getTime()
      char.lifetime.timePlayed += Math.max(0, elapsed)
    }

    char.lastSaved = new Date().toISOString()

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(char))

      if (supabase && !authStore.isGuest && authStore.session) {
        const { error } = await supabase.from('characters').upsert(
          {
            user_id: authStore.session.user.id,
            data: char,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        if (error) console.error('[save] Supabase upsert failed:', error.message)
      }

      lastSaved.value = char.lastSaved

      // Belt-and-suspenders: keep prestige in sync even if the store's own
      // per-action saves were somehow missed (e.g. tab crash).
      usePrestigeStore().savePrestige()
    } finally {
      isSaving.value = false
    }
  }

  async function loadCharacter(): Promise<boolean> {
    const characterStore = useCharacterStore()
    const authStore = useAuthStore()
    const prestigeStore = usePrestigeStore()

    // Always load prestige first — offline calc needs offlineEfficiencyBonus
    prestigeStore.loadPrestige()

    let restored = false

    if (supabase && !authStore.isGuest && authStore.session) {
      const { data, error } = await supabase
        .from('characters')
        .select('data')
        .eq('user_id', authStore.session.user.id)
        .single()

      if (!error && data?.data) {
        characterStore.restoreCharacter(data.data)
        restored = true
      }
    }

    if (!restored) {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          characterStore.restoreCharacter(parsed)
          restored = true
        } catch {
          // Corrupt data — ignore
        }
      }
    }

    if (restored) {
      await _applyOfflineProgress(characterStore, prestigeStore)
    }

    return restored
  }

  async function _applyOfflineProgress(
    characterStore: ReturnType<typeof useCharacterStore>,
    prestigeStore: ReturnType<typeof usePrestigeStore>,
  ): Promise<void> {
    const char = characterStore.character
    if (!char) return

    const now = Date.now()
    const lastSaved = new Date(char.lastSaved ?? char.createdAt).getTime()
    const elapsedMs = now - lastSaved
    if (elapsedMs <= 60_000) return

    const { calcOfflineProgress } = await import('../game/offline')
    const result = calcOfflineProgress(
      char,
      char.currentZone,
      elapsedMs,
      prestigeStore.offlineEfficiencyBonus,
    )
    characterStore.applyOfflineRewards(result)
    characterStore.pendingOfflineResult = result
  }

  return { lastSaved, isSaving, saveCharacter, loadCharacter }
})
