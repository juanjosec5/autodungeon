import { describe, it } from 'vitest'
import type { ClassId } from '../../types/index'
import {
  ZONE_PROGRESSION,
  maxedBuild,
  maxSustainableTier,
  simulateZoneSession,
  simulateFullRun,
  withSeededRandom,
} from '../simulate'

/**
 * Balance report — not a regression suite. Prints the NG+ sustainability
 * matrix and full-run timelines so scaling changes can be eyeballed.
 *
 * Run with:  npm run sim:report
 */

const CLASSES: ClassId[] = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin']

describe.runIf(import.meta.env.VITE_SIM_REPORT)('simulation report', () => {
  it('NG+ sustainability matrix — max tier a maxed lvl-100 build survives per zone', () => {
    const rows: Record<string, Record<string, number>> = {}
    for (const classId of CLASSES) {
      rows[classId] = {}
      for (const { zone, tier } of ZONE_PROGRESSION) {
        rows[classId][zone] = maxSustainableTier(maxedBuild(classId, tier), zone)
      }
    }
    console.table(rows)
  })

  it('bug repro — prestige-18 maxed mage in shadowrealm, 15 virtual minutes', () => {
    const build = maxedBuild('mage', 4)
    for (const tier of [0, 5, 10, 12, 14, 16, 18]) {
      const r = withSeededRandom(42, () =>
        simulateZoneSession(build, { zone: 'shadowrealm', tier, durationMs: 15 * 60_000 }),
      )
      console.log(
        `tier ${String(tier).padStart(2)}: kills=${String(r.kills).padStart(4)} ` +
        `deaths=${String(r.deaths).padStart(3)} kills/min=${r.killsPerMinute.toFixed(1).padStart(6)} ` +
        `avgKill=${(r.avgKillMs / 1000).toFixed(1)}s`,
      )
    }
  })

  it('full prestige runs — mage at increasing NG+ tiers', () => {
    for (const tier of [0, 5, 10, 14, 18]) {
      const r = simulateFullRun({
        classId: 'mage',
        tier,
        vitalityStacks: 12,
        startingLevelStacks: 5,
        xpBoostStacks: 8,
        ascension: { 'arcane-surge': 5, 'blessed-regen': 5, 'death-pact': 5, 'dragon-scales': 5 },
        gearRarity: 'legendary',
        enchanted: true,
      })
      const wall = r.wallZone ? ` WALLED at ${r.wallZone}` : ''
      console.log(
        `tier ${String(tier).padStart(2)}: level ${r.finalLevel}/${r.levelCap} ` +
        `in ${r.virtualHours.toFixed(1)}h, deaths=${r.totalDeaths}${wall}`,
      )
      for (const z of r.zoneLog) {
        console.log(
          `    ${z.zone.padEnd(12)} entered L${String(z.enteredAtLevel).padStart(3)} ` +
          `${z.virtualHours.toFixed(1).padStart(5)}h kills=${z.kills} deaths=${z.deaths}`,
        )
      }
    }
  }, 120_000)
})
