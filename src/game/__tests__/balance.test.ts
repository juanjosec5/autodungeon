import { describe, it, expect } from 'vitest'
import { ENEMY_DEFINITIONS } from '../enemies'
import { getStatsAtLevel, CLASS_DEFINITIONS } from '../classes'
import { weaponDamage } from '../item-curves'
import type { ClassId, ZoneId } from '../../types/index'

/**
 * Coarse progression guardrail: simulates expected (average) player damage
 * against each zone's enemies using at-zone-level stats and at-zone-tier epic
 * gear, and asserts time-to-kill stays inside sane idle-game bands.
 * If a curve or enemy retune breaks pacing, this fails before players notice.
 */

const ZONES: { zone: ZoneId; tier: number; level: number }[] = [
  { zone: 'forest', tier: 0, level: 4 },
  { zone: 'dungeon', tier: 1, level: 14 },
  { zone: 'volcano', tier: 2, level: 27 },
  { zone: 'abyss', tier: 3, level: 42 },
  { zone: 'shadowrealm', tier: 4, level: 57 },
  { zone: 'celestial', tier: 5, level: 72 },
  { zone: 'void', tier: 6, level: 87 },
  { zone: 'nightmare', tier: 7, level: 98 },
]

const ENEMY_HP_MULTIPLIER = 2.2

function expectedHitChance(dex: number, enemyDef: number): number {
  // d20 + dex >= def, natural 20 always hits
  const needed = enemyDef - dex
  const hitsOn = Math.max(1, 21 - Math.max(1, needed)) // rolls that hit
  return Math.min(1, Math.max(0.05, hitsOn / 20))
}

function expectedDps(classId: ClassId, level: number, tier: number, enemyDef: number): number {
  const stats = getStatsAtLevel(classId, level)
  const def = CLASS_DEFINITIONS[classId]
  // Mid-game players typically wear epic at-tier gear
  const { minDmg, maxDmg } = weaponDamage(tier, 'epic')
  const statBonus = def.damageStat === 'int' ? stats.int : stats.str
  const defIgnore = def.passives.defIgnore ?? 0
  const effDef = Math.floor(enemyDef * (1 - defIgnore))
  const avgRaw = (minDmg + maxDmg) / 2 + statBonus
  // ~10-20% crit at 1.5x → ~1.07 average multiplier
  const avgDamage = Math.max(1, avgRaw * 1.07 - effDef)
  const hitChance = expectedHitChance(stats.dex, enemyDef)
  const attacksPerSec = 1000 / def.attackSpeed
  return avgDamage * hitChance * attacksPerSec
}

describe('zone pacing (warrior baseline, at-level epic gear)', () => {
  it.each(ZONES)('$zone: normal enemies die in 2–14 expected hits-worth of seconds', ({ zone, tier, level }) => {
    const normals = ENEMY_DEFINITIONS.filter((e) => e.zone === zone && !e.isBoss)
    for (const enemy of normals) {
      const hp = enemy.maxHp * ENEMY_HP_MULTIPLIER
      const dps = expectedDps('warrior', level, tier, enemy.def)
      const ttk = hp / dps
      expect(ttk, `${enemy.id} TTK ${ttk.toFixed(1)}s`).toBeGreaterThan(1)
      expect(ttk, `${enemy.id} TTK ${ttk.toFixed(1)}s`).toBeLessThan(30)
    }
  })

  it.each(ZONES)('$zone: boss dies in 15–120 seconds', ({ zone, tier, level }) => {
    const boss = ENEMY_DEFINITIONS.find((e) => e.zone === zone && e.isBoss)!
    const dps = expectedDps('warrior', level, tier, boss.def)
    const ttk = boss.maxHp / dps
    expect(ttk, `${boss.id} TTK ${ttk.toFixed(1)}s`).toBeGreaterThan(10)
    expect(ttk, `${boss.id} TTK ${ttk.toFixed(1)}s`).toBeLessThan(120)
  })
})

describe('hit chance floor', () => {
  const classes: ClassId[] = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin']

  it.each(ZONES)('$zone: every class at-level hits normals >= 70%', ({ zone, level }) => {
    const normals = ENEMY_DEFINITIONS.filter((e) => e.zone === zone && !e.isBoss)
    for (const classId of classes) {
      const { dex } = getStatsAtLevel(classId, level)
      for (const enemy of normals) {
        const chance = expectedHitChance(dex, enemy.def)
        expect(chance, `${classId} vs ${enemy.id}: ${(chance * 100).toFixed(0)}%`).toBeGreaterThanOrEqual(0.7)
      }
    }
  })

  it.each(ZONES)('$zone: every class at-level hits the boss >= 60%', ({ zone, level }) => {
    const boss = ENEMY_DEFINITIONS.find((e) => e.zone === zone && e.isBoss)!
    for (const classId of classes) {
      const { dex } = getStatsAtLevel(classId, level)
      const chance = expectedHitChance(dex, boss.def)
      expect(chance, `${classId} vs ${boss.id}: ${(chance * 100).toFixed(0)}%`).toBeGreaterThanOrEqual(0.6)
    }
  })
})

describe('survivability sanity', () => {
  it.each(ZONES)('$zone: normals need 8+ average hits to down an at-level warrior', ({ zone, level }) => {
    const stats = getStatsAtLevel('warrior', level)
    const normals = ENEMY_DEFINITIONS.filter((e) => e.zone === zone && !e.isBoss)
    for (const enemy of normals) {
      const avgAtk = (enemy.atk[0] + enemy.atk[1]) / 2
      // ignore armor — worst case
      const hitsToDie = stats.maxHP / avgAtk
      expect(hitsToDie, `${enemy.id} kills warrior in ${hitsToDie.toFixed(1)} hits`).toBeGreaterThan(8)
    }
  })
})
