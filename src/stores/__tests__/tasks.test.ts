import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../tasks'
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

const LS_KEY = 'autodungeon_tasks'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

/** Simulates a fresh page load: new pinia, new store instances */
function reload(): ReturnType<typeof useTaskStore> {
  setActivePinia(createPinia())
  const store = useTaskStore()
  store.loadTasks()
  return store
}

describe('task persistence (account-wide, shared across characters)', () => {
  it('generates tasks on first load and persists them', () => {
    const store = useTaskStore()
    store.loadTasks()
    expect(store.dailyTasks.length).toBe(3)
    expect(store.weeklyTasks.length).toBe(3)
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!)
    expect(saved.dailyTasks.length).toBe(3)
    expect(saved.weeklyTasks.length).toBe(3)
  })

  it('keeps the same tasks across a mid-day reload (no regeneration)', () => {
    const first = useTaskStore()
    first.loadTasks()
    const dailyIds = first.dailyTasks.map((t) => t.id)
    const dailyTargets = first.dailyTasks.map((t) => t.target)

    const second = reload()
    expect(second.dailyTasks.map((t) => t.id)).toEqual(dailyIds)
    expect(second.dailyTasks.map((t) => t.target)).toEqual(dailyTargets)
  })

  it('shares tracker progress and claims across character switches', () => {
    const characterStore = useCharacterStore()
    characterStore.createCharacter('Main', 'warrior')
    const store = useTaskStore()
    store.loadTasks()
    store.updateTracker({ kills: 25, goldEarned: 500 })

    // Switching characters re-runs loadTasks (save store does this on restore)
    const afterSwitch = reload()
    useCharacterStore().createCharacter('Alt', 'mage')
    afterSwitch.loadTasks()
    expect(afterSwitch.dailyTracker.kills).toBe(25)
    expect(afterSwitch.weeklyTracker.goldEarned).toBe(500)
  })

  it('regenerates lists for legacy saves that lack them, without resetting progress', () => {
    // Legacy payload: current seeds + progress, but no task lists persisted
    const store = useTaskStore()
    store.loadTasks()
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!)
    delete saved.dailyTasks
    delete saved.weeklyTasks
    saved.dailyTracker.kills = 12
    localStorage.setItem(LS_KEY, JSON.stringify(saved))

    const migrated = reload()
    expect(migrated.dailyTasks.length).toBe(3)
    expect(migrated.weeklyTasks.length).toBe(3)
    expect(migrated.dailyTracker.kills).toBe(12)
  })

  it('resets tasks, tracker, and claims when the day rolls over', () => {
    const store = useTaskStore()
    store.loadTasks()
    store.updateTracker({ kills: 10 })

    // Force yesterday's seed and re-check
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!)
    saved.dailySeed -= 1
    localStorage.setItem(LS_KEY, JSON.stringify(saved))

    const next = reload()
    expect(next.dailyTracker.kills).toBe(0)
    expect(next.claimedDaily).toEqual([])
    expect(next.dailyTasks.length).toBe(3)
  })
})
