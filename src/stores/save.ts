import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'
import { useCharacterStore } from './character'
import { usePrestigeStore } from './prestige'
import { useTaskStore } from './tasks'
import type { Character } from '../types/index'

const LS_SAVES_KEY  = 'autodungeon_saves'       // Record<id, Character>
const LS_ACTIVE_KEY = 'autodungeon_active_id'   // string — id of last-played slot
const LS_LEGACY_KEY = 'autodungeon_character'   // old single-save key (migration only)
const AUTOSAVE_INTERVAL_MS = 30_000

export const useSaveStore = defineStore('save', () => {
  const lastSaved = ref<string | null>(null)
  const isSaving = ref(false)

  setInterval(() => saveCharacter(), AUTOSAVE_INTERVAL_MS)

  // ── Internal helpers ─────────────────────────────────────────────────────────

  function _getAllSaves(): Record<string, Character> {
    const raw = localStorage.getItem(LS_SAVES_KEY)
    if (!raw) return {}
    try {
      return JSON.parse(raw) as Record<string, Character>
    } catch {
      return {}
    }
  }

  /** One-time migration from the old single-key format. */
  function _migrate(): void {
    if (localStorage.getItem(LS_SAVES_KEY) !== null) return  // already migrated
    const legacy = localStorage.getItem(LS_LEGACY_KEY)
    if (!legacy) return
    try {
      const char = JSON.parse(legacy) as Character
      const saves: Record<string, Character> = {}
      saves[char.id] = char
      localStorage.setItem(LS_SAVES_KEY, JSON.stringify(saves))
      localStorage.setItem(LS_ACTIVE_KEY, char.id)
      localStorage.removeItem(LS_LEGACY_KEY)
    } catch {
      // Corrupt legacy save — ignore, start fresh
    }
  }

  // ── Public actions ───────────────────────────────────────────────────────────

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
      // Write to the correct slot
      const saves = _getAllSaves()
      saves[char.id] = char
      localStorage.setItem(LS_SAVES_KEY, JSON.stringify(saves))
      localStorage.setItem(LS_ACTIVE_KEY, char.id)

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

  /** Returns all saved characters sorted by lastSaved descending (most recent first). */
  function loadAllSaves(): Character[] {
    _migrate()
    const saves = _getAllSaves()
    return Object.values(saves).sort(
      (a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime(),
    )
  }

  /** Loads a specific character slot by id and runs offline progress calc. */
  async function loadCharacterById(id: string): Promise<boolean> {
    _migrate()
    const saves = _getAllSaves()
    const char = saves[id]
    if (!char) return false

    const characterStore = useCharacterStore()
    const prestigeStore = usePrestigeStore()
    prestigeStore.loadPrestige()
    characterStore.restoreCharacter(char)
    localStorage.setItem(LS_ACTIVE_KEY, id)
    await _applyOfflineProgress(characterStore, prestigeStore)
    return true
  }

  /** Deletes a save slot. Clears in-memory character if it was the active slot. */
  function deleteCharacter(id: string): void {
    const characterStore = useCharacterStore()
    const saves = _getAllSaves()
    delete saves[id]
    localStorage.setItem(LS_SAVES_KEY, JSON.stringify(saves))

    if (localStorage.getItem(LS_ACTIVE_KEY) === id) {
      localStorage.removeItem(LS_ACTIVE_KEY)
    }
    if (characterStore.character?.id === id) {
      characterStore.character = null
    }
  }

  /**
   * Loads the last-active character. Used by GameView on mount.
   * Priority: Supabase (if authenticated) → active-id slot → most-recent slot.
   */
  async function loadCharacter(): Promise<boolean> {
    _migrate()
    const characterStore = useCharacterStore()
    const authStore = useAuthStore()
    const prestigeStore = usePrestigeStore()

    // Always load prestige first — offline calc needs offlineEfficiencyBonus
    prestigeStore.loadPrestige()

    if (supabase && !authStore.isGuest && authStore.session) {
      const { data, error } = await supabase
        .from('characters')
        .select('data')
        .eq('user_id', authStore.session.user.id)
        .single()

      if (!error && data?.data) {
        characterStore.restoreCharacter(data.data)
        await _applyOfflineProgress(characterStore, prestigeStore)
        return true
      }
    }

    const activeId = localStorage.getItem(LS_ACTIVE_KEY)
    if (activeId) {
      const saves = _getAllSaves()
      const char = saves[activeId]
      if (char) {
        characterStore.restoreCharacter(char)
        await _applyOfflineProgress(characterStore, prestigeStore)
        return true
      }
    }

    // Fallback: load the most recent save (handles edge case where active pointer is stale)
    const all = loadAllSaves()
    if (all.length > 0) {
      characterStore.restoreCharacter(all[0])
      localStorage.setItem(LS_ACTIVE_KEY, all[0].id)
      await _applyOfflineProgress(characterStore, prestigeStore)
      return true
    }

    return false
  }

  async function _applyOfflineProgress(
    characterStore: ReturnType<typeof useCharacterStore>,
    prestigeStore: ReturnType<typeof usePrestigeStore>,
  ): Promise<void> {
    const char = characterStore.character
    if (!char) return

    // Load tasks (and run reset checks) whenever a character is restored
    useTaskStore().loadTasks()

    const now = Date.now()
    const lastSavedMs = new Date(char.lastSaved ?? char.createdAt).getTime()
    const elapsedMs = now - lastSavedMs
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

  return { lastSaved, isSaving, saveCharacter, loadCharacter, loadAllSaves, loadCharacterById, deleteCharacter }
})
