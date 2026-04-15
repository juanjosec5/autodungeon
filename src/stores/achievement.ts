import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ZoneId, Item } from '../types/index'
import { ZONE_CHALLENGE_SETS, blankZoneProgress } from '../game/achievements'
import { useCharacterStore } from './character'

export interface RewardNotification {
  zone: ZoneId
  zoneName: string
  weaponName: string
  armorName: string
}

export const useAchievementStore = defineStore('achievement', () => {
  const characterStore = useCharacterStore()
  const rewardNotifications = ref<RewardNotification[]>([])

  // Persists the selected zone tab across panel switches
  const selectedChallengeZone = ref<ZoneId>('forest')

  // ── Progress access ───────────────────────────────────────────────────────

  function getProgress(zone: ZoneId) {
    return characterStore.character?.zoneAchievements?.[zone] ?? blankZoneProgress()
  }

  function _ensureProgress(zone: ZoneId): void {
    const char = characterStore.character
    if (!char) return
    if (!char.zoneAchievements) char.zoneAchievements = {}
    if (!char.zoneAchievements[zone]) char.zoneAchievements[zone] = blankZoneProgress()
  }

  // ── Tracking ──────────────────────────────────────────────────────────────

  function trackKill(zone: ZoneId, enemyId: string, isBoss: boolean): void {
    const char = characterStore.character
    if (!char) return
    _ensureProgress(zone)
    const p = char.zoneAchievements![zone]!
    if (isBoss) {
      p.bossKills++
    } else {
      p.kills++
      if (!p.enemyTypesSeen.includes(enemyId)) p.enemyTypesSeen.push(enemyId)
    }
    _checkCompletion(zone)
  }

  function trackCrit(zone: ZoneId): void {
    const char = characterStore.character
    if (!char) return
    _ensureProgress(zone)
    char.zoneAchievements![zone]!.crits++
    _checkCompletion(zone)
  }

  function trackDamage(zone: ZoneId, amount: number): void {
    const char = characterStore.character
    if (!char) return
    _ensureProgress(zone)
    char.zoneAchievements![zone]!.damageDealt += amount
    _checkCompletion(zone)
  }

  // ── Completion ────────────────────────────────────────────────────────────

  function _checkCompletion(zone: ZoneId): void {
    const char = characterStore.character
    if (!char?.zoneAchievements) return
    const p = char.zoneAchievements[zone]
    if (!p || p.setRewarded || p.rewardReady) return

    const set = ZONE_CHALLENGE_SETS.find((s) => s.zone === zone)
    if (!set) return
    if (!set.challenges.every((c) => c.isDone(p))) return

    // Flag for manual claiming instead of auto-granting
    p.rewardReady = true
  }

  function claimReward(zone: ZoneId): 'claimed' | 'inventory_full' | 'not_ready' {
    const char = characterStore.character
    if (!char?.zoneAchievements?.[zone]) return 'not_ready'
    const p = char.zoneAchievements[zone]!
    if (!p.rewardReady || p.setRewarded) return 'not_ready'

    const slotsAvailable = 50 - char.inventory.length
    if (slotsAvailable < 2) return 'inventory_full'

    const set = ZONE_CHALLENGE_SETS.find((s) => s.zone === zone)
    if (!set) return 'not_ready'

    const weaponInstance: Item = {
      id: crypto.randomUUID(),
      defId: set.reward.weapon.defId,
      name: set.reward.weapon.name,
      type: set.reward.weapon.type,
      category: set.reward.weapon.category,
      rarity: set.reward.weapon.rarity,
      allowedClasses: 'any',
      stats: structuredClone(set.reward.weapon.stats),
    }
    const armorInstance: Item = {
      id: crypto.randomUUID(),
      defId: set.reward.armor.defId,
      name: set.reward.armor.name,
      type: set.reward.armor.type,
      category: set.reward.armor.category,
      rarity: set.reward.armor.rarity,
      allowedClasses: 'any',
      stats: structuredClone(set.reward.armor.stats),
    }

    characterStore.addToInventory(weaponInstance)
    characterStore.addToInventory(armorInstance)

    p.rewardReady = false
    p.setRewarded = true

    rewardNotifications.value.push({
      zone,
      zoneName: set.zoneName,
      weaponName: weaponInstance.name,
      armorName: armorInstance.name,
    })

    return 'claimed'
  }

  function clearNotification(zone: ZoneId): void {
    rewardNotifications.value = rewardNotifications.value.filter((n) => n.zone !== zone)
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const completedZones = computed<ZoneId[]>(() => {
    const za = characterStore.character?.zoneAchievements
    if (!za) return []
    return (Object.entries(za) as [ZoneId, ReturnType<typeof blankZoneProgress>][])
      .filter(([, p]) => p.setRewarded)
      .map(([zone]) => zone)
  })

  const hasClaimableReward = computed<boolean>(() => {
    const za = characterStore.character?.zoneAchievements
    if (!za) return false
    return Object.values(za).some((p) => p?.rewardReady && !p.setRewarded)
  })

  return {
    getProgress,
    trackKill,
    trackCrit,
    trackDamage,
    completedZones,
    hasClaimableReward,
    claimReward,
    rewardNotifications,
    clearNotification,
    selectedChallengeZone,
  }
})
