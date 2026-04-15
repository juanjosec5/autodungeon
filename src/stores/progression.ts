import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PanelId } from '../types/index'
import { useCharacterStore } from './character'

export interface PanelUnlock {
  panelId: PanelId
  requiredLevel: number
  title: string
  description: string
}

export const PANEL_UNLOCKS: PanelUnlock[] = [
  {
    panelId: 'skills',
    requiredLevel: 3,
    title: 'Skills Unlocked',
    description: "Earn Skill Points on every level-up. Spend them at your own pace from the Skills tab to strengthen your character.",
  },
  {
    panelId: 'zone',
    requiredLevel: 3,
    title: 'Zone Map Unlocked',
    description: "You've grown strong enough to venture beyond the forest. Open the Zone map to travel to new hunting grounds with tougher enemies and better loot.",
  },
  {
    panelId: 'shop',
    requiredLevel: 5,
    title: 'Shop Unlocked',
    description: "Merchants have set up camp nearby. Visit the Shop to spend your gold on weapons and armor — useful when drops aren't cooperating.",
  },
  {
    panelId: 'log',
    requiredLevel: 5,
    title: 'Combat Log Unlocked',
    description: "Your battles are now being recorded. The Log shows a full history of hits, crits, loot drops, and level-ups.",
  },
  {
    panelId: 'tasks',
    requiredLevel: 8,
    title: 'Tasks Unlocked',
    description: "Daily and weekly contracts are now available. Complete them for bonus gold, XP, and Ascension Tokens.",
  },
  {
    panelId: 'enchant',
    requiredLevel: 10,
    title: 'Enchanting Unlocked',
    description: "You can now enchant your gear. Spend gold to add or reroll a special effect on any item you own — lifesteal, dodge, spell amp, and more.",
  },
  {
    panelId: 'challenges',
    requiredLevel: 15,
    title: 'Challenges Unlocked',
    description: "Zone masters have posted trials for adventurers. Complete challenges in each zone to earn exclusive gear sets that can't drop from enemies.",
  },
  {
    panelId: 'prestige',
    requiredLevel: 50,
    title: 'Ascension Unlocked',
    description: "You've reached level 50. The path to Ascension lies open — prestige to start over stronger, keeping your bonuses and unlocking permanent upgrades.",
  },
]

const ALWAYS_ON: PanelId[] = ['items', 'codex']

const LS_PROGRESSION = 'autodungeon_progression'
const LS_TUTORIALS   = 'autodungeon_tutorials'

export const useProgressionStore = defineStore('progression', () => {
  const characterStore = useCharacterStore()

  const seenUnlocks = ref<PanelId[]>(
    JSON.parse(localStorage.getItem(LS_PROGRESSION) ?? '[]'),
  )

  const seenTutorials = ref<PanelId[]>(
    JSON.parse(localStorage.getItem(LS_TUTORIALS) ?? '[]'),
  )

  // Panels accessible at current level
  const unlockedPanels = computed<PanelId[]>(() => {
    const level = characterStore.character?.level ?? 1
    const fromUnlocks = PANEL_UNLOCKS
      .filter((u) => level >= u.requiredLevel)
      .map((u) => u.panelId)
    // Keep prestige tab accessible permanently once the player has reached it —
    // after a prestige the character resets to level 1 but the tab must remain
    // visible so the player can access it without grinding back to level 50.
    const alwaysOn: PanelId[] = seenUnlocks.value.includes('prestige')
      ? [...ALWAYS_ON, 'prestige']
      : ALWAYS_ON
    return [...new Set([...alwaysOn, ...fromUnlocks])]
  })

  // First unlock that is newly available but the player hasn't seen the modal for yet
  const pendingUnlockModal = computed<PanelUnlock | null>(() => {
    return (
      PANEL_UNLOCKS.find(
        (u) =>
          unlockedPanels.value.includes(u.panelId) &&
          !seenUnlocks.value.includes(u.panelId),
      ) ?? null
    )
  })

  function markUnlockSeen(panelId: PanelId): void {
    if (!seenUnlocks.value.includes(panelId)) {
      seenUnlocks.value.push(panelId)
      localStorage.setItem(LS_PROGRESSION, JSON.stringify(seenUnlocks.value))
    }
  }

  // Silently mark all currently-unlocked panels as seen — called once on game
  // load so existing characters don't see a cascade of unlock modals.
  function bulkMarkCurrentUnlocksSeen(): void {
    const level = characterStore.character?.level ?? 1
    let changed = false
    for (const u of PANEL_UNLOCKS) {
      if (level >= u.requiredLevel && !seenUnlocks.value.includes(u.panelId)) {
        seenUnlocks.value.push(u.panelId)
        changed = true
      }
    }
    if (changed) {
      localStorage.setItem(LS_PROGRESSION, JSON.stringify(seenUnlocks.value))
    }
  }

  function markTutorialSeen(panelId: PanelId): void {
    if (!seenTutorials.value.includes(panelId)) {
      seenTutorials.value.push(panelId)
      localStorage.setItem(LS_TUTORIALS, JSON.stringify(seenTutorials.value))
    }
  }

  function hasSeen(panelId: PanelId): boolean {
    return seenTutorials.value.includes(panelId)
  }

  return {
    unlockedPanels,
    pendingUnlockModal,
    markUnlockSeen,
    bulkMarkCurrentUnlocksSeen,
    markTutorialSeen,
    hasSeen,
  }
})
