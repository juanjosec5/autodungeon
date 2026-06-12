import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSaveStore } from '../save'
import { useCharacterStore } from '../character'

// ── localStorage mock (node env has no DOM) ───────────────────────────────────

const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k] },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.useRealTimers()
})

describe('applyBackgroundProgress (tab visibility catch-up)', () => {
  it('does nothing without a character', async () => {
    const saveStore = useSaveStore()
    expect(await saveStore.applyBackgroundProgress(Date.now() - 120_000)).toBe(false)
  })

  it('skips short absences (≤ 60s)', async () => {
    const characterStore = useCharacterStore()
    characterStore.createCharacter('Test', 'mage')
    const saveStore = useSaveStore()
    expect(await saveStore.applyBackgroundProgress(Date.now() - 30_000)).toBe(false)
    expect(characterStore.pendingOfflineResult).toBeNull()
  })

  it('grants offline rewards for the hidden window and queues the modal', async () => {
    const characterStore = useCharacterStore()
    characterStore.createCharacter('Test', 'mage')
    const xpBefore = characterStore.character!.xp
    const goldBefore = characterStore.character!.gold

    const saveStore = useSaveStore()
    const tenMinutesAgo = Date.now() - 10 * 60_000
    expect(await saveStore.applyBackgroundProgress(tenMinutesAgo)).toBe(true)

    const result = characterStore.pendingOfflineResult
    expect(result).not.toBeNull()
    expect(result!.kills).toBeGreaterThan(0)
    expect(result!.durationMs).toBeGreaterThanOrEqual(10 * 60_000 - 1000)
    // Rewards actually applied to the character (xp may convert into levels)
    const char = characterStore.character!
    expect(char.gold).toBeGreaterThan(goldBefore)
    expect(char.level > 1 || char.xp > xpBefore).toBe(true)
  })
})
