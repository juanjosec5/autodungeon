import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'
import { useCharacterStore } from './character'

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
    } finally {
      isSaving.value = false
    }
  }

  async function loadCharacter(): Promise<boolean> {
    const characterStore = useCharacterStore()
    const authStore = useAuthStore()

    if (supabase && !authStore.isGuest && authStore.session) {
      const { data, error } = await supabase
        .from('characters')
        .select('data')
        .eq('user_id', authStore.session.user.id)
        .single()

      if (!error && data?.data) {
        characterStore.restoreCharacter(data.data)
        return true
      }
    }

    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        characterStore.restoreCharacter(parsed)
        return true
      } catch {
        // Corrupt data — ignore
      }
    }

    return false
  }

  return { lastSaved, isSaving, saveCharacter, loadCharacter }
})
