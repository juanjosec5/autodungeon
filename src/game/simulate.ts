import type { Character, Enemy, Item, ZoneId, ClassId, RarityId, UpgradeId, AscensionBonusId, SpecialEffect } from '../types/index'
import { rollDamage } from './formulas'
import { getStatsAtLevel, getXPToNextLevel } from './classes'
import { applyStatUpgrades, getEligibleUpgrades, rollUpgradeChoices, autoPickUpgrade } from './upgrades'
import { spawnEnemy, getBossForZone, getEnemiesForZone, TIER_REWARD_GROWTH } from './enemies'
import { weaponDamage, armorStats } from './item-curves'
import { applyEnchant, calcEnchantCost } from './items'
import { playerAttackIntervalMs, resolvePlayerAttack, resolveEnemyAttack, resolveKillRegen, NO_BUFFS, NG_TIER_PLAYER_POWER, type CombatBuffs } from './combat-core'

/**
 * Headless, virtual-clock game simulator. Shares the exact combat math with
 * the live engine via combat-core.ts — only the timer loop is re-implemented
 * (numbers instead of setTimeout), so simulated outcomes match real play.
 *
 * Three levels of fidelity:
 *   simulateZoneSession — a character farming one zone for N virtual minutes
 *   maxSustainableTier  — highest NG+ tier a build survives in a zone
 *   simulateFullRun     — an entire prestige run: leveling, zone unlocks,
 *                         at-tier gear, auto-picked upgrades, deaths, walls
 */

// Mirrors ZONE_UNLOCK_LEVELS in stores/character.ts and the zone tier mapping
// used by item curves / balance tests.
export const ZONE_PROGRESSION: { zone: ZoneId; tier: number; unlockLevel: number }[] = [
  { zone: 'forest',      tier: 0, unlockLevel: 1 },
  { zone: 'dungeon',     tier: 1, unlockLevel: 8 },
  { zone: 'volcano',     tier: 2, unlockLevel: 20 },
  { zone: 'abyss',       tier: 3, unlockLevel: 35 },
  { zone: 'shadowrealm', tier: 4, unlockLevel: 50 },
  { zone: 'celestial',   tier: 5, unlockLevel: 65 },
  { zone: 'void',        tier: 6, unlockLevel: 80 },
  { zone: 'nightmare',   tier: 7, unlockLevel: 95 },
]

// ── Deterministic RNG ─────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Runs `fn` with Math.random swapped for a seeded mulberry32 PRNG, restoring
 * the original afterwards. Keeps simulations reproducible without threading an
 * rng parameter through the shared combat code.
 */
export function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random
  Math.random = mulberry32(seed)
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

// ── Build construction ────────────────────────────────────────────────────────

export interface SimBuild {
  classId: ClassId
  level: number
  upgrades: Partial<Record<UpgradeId, number>>
  /** Prestige Vitality stacks (0–12, +10% max HP each) */
  vitalityStacks: number
  /** Ascension mastery stacks by bonus id */
  ascension: Partial<Record<AscensionBonusId, number>>
  weapon: Item | null
  armor: Item | null
}

/** Curve-generated weapon, mirroring real drops of that zone tier and rarity */
export function makeSimWeapon(zoneTier: number, rarity: RarityId, special: SpecialEffect[] = [], dmgMod = 1): Item {
  const { minDmg, maxDmg } = weaponDamage(zoneTier, rarity, dmgMod)
  return {
    id: `sim-weapon-${zoneTier}-${rarity}`,
    name: `Sim Weapon T${zoneTier} ${rarity}`,
    type: 'weapon',
    category: 'sim',
    rarity,
    allowedClasses: 'any',
    zoneTier,
    stats: { minDmg, maxDmg, special: structuredClone(special) },
  }
}

/** Curve-generated armor, mirroring real drops of that zone tier and rarity */
export function makeSimArmor(zoneTier: number, rarity: RarityId, special: SpecialEffect[] = [], defMod = 1, hpMod = 1): Item {
  const { defBonus, hpBonus } = armorStats(zoneTier, rarity, defMod, hpMod)
  return {
    id: `sim-armor-${zoneTier}-${rarity}`,
    name: `Sim Armor T${zoneTier} ${rarity}`,
    type: 'armor',
    category: 'sim',
    rarity,
    allowedClasses: 'any',
    zoneTier,
    stats: { defBonus, hpBonus, special: structuredClone(special) },
  }
}

/**
 * Applies up to `levels` enchant levels through the real enchant engine,
 * stopping early once the item is maxed. Returns an enchanted clone.
 */
export function applyEnchantLevels(item: Item, levels: number, rng: () => number = Math.random): Item {
  const result = structuredClone(item)
  for (let i = 0; i < levels; i++) {
    if (applyEnchant(result, rng).kind === 'maxed') break
  }
  return result
}

/** Expected gold per normal kill in a zone at an NG+ tier (engine: xpReward × 0.35) */
export function zoneGoldPerKill(zone: ZoneId, tier: number): number {
  const normals = getEnemiesForZone(zone)
  const meanXp = normals.reduce((a, e) => a + e.xpReward, 0) / normals.length
  return Math.max(1, meanXp * Math.pow(TIER_REWARD_GROWTH, tier) * 0.35)
}

/** Every eligible upgrade at max picks — a fully invested level-100+ character */
export function maxedUpgrades(classId: ClassId): Partial<Record<UpgradeId, number>> {
  const result: Partial<Record<UpgradeId, number>> = {}
  for (const def of getEligibleUpgrades(classId, {})) {
    result[def.id] = def.maxPicks
  }
  return result
}

/**
 * Builds a Character snapshot using the same derivation as
 * characterStore.recalcStats(): base stats at level → percent upgrades →
 * prestige HP multiplier → armor HP bonus.
 */
export function buildCharacter(build: SimBuild): Character {
  const base = getStatsAtLevel(build.classId, build.level)
  const upgraded = applyStatUpgrades(
    { str: base.str, dex: base.dex, int: base.int, maxHP: base.maxHP },
    build.upgrades,
  )
  const hpMultiplier = 1 + build.vitalityStacks * 0.1
  const baseHP = hpMultiplier > 1 ? Math.floor(upgraded.maxHP * hpMultiplier) : upgraded.maxHP
  const maxHP = baseHP + (build.armor?.stats.hpBonus ?? 0)

  return {
    id: 'sim',
    name: 'sim',
    class: build.classId,
    level: build.level,
    xp: 0,
    xpToNext: getXPToNextLevel(build.level),
    currentHP: maxHP,
    maxHP,
    stats: { str: upgraded.str, dex: upgraded.dex, int: upgraded.int },
    gear: { weapon: build.weapon, armor: build.armor },
    inventory: [],
    gold: 0,
    currentZone: 'forest',
    upgrades: build.upgrades,
    pendingLevelUps: 0,
    skillPoints: 0,
    createdAt: '',
    lastSaved: '',
    lifetime: {
      kills: 0, bossKills: 0, deaths: 0, damageDealt: 0, damageReceived: 0,
      goldEarned: 0, itemsLooted: 0, itemsScrapped: 0, highestHit: 0, timePlayed: 0,
    },
  }
}

/** Ascension-derived combat buffs (no shop consumables in simulations) */
export function buildBuffs(build: SimBuild): CombatBuffs {
  return {
    ...NO_BUFFS,
    hitChanceBonus: (build.ascension['ghost-strike'] ?? 0) * 0.03,
    damageReduction: (build.ascension['dragon-scales'] ?? 0) * 0.02,
  }
}

// ── Zone session simulation ───────────────────────────────────────────────────

export interface ZoneSessionOptions {
  zone: ZoneId
  /** NG+ difficulty tier (= prestige count) */
  tier: number
  durationMs: number
}

export interface ZoneSessionResult {
  zone: ZoneId
  tier: number
  durationMs: number
  kills: number
  bossKills: number
  deaths: number
  xpGained: number
  killsPerMinute: number
  /** Average normal-enemy fight length in ms (NaN if no kills) */
  avgKillMs: number
}

/**
 * Simulates continuous farming in a zone: normal spawns, boss cadence every
 * 10–15 kills, on-kill regen, blessed-regen ticks, death pact, and death →
 * full-HP respawn (matching applyDeathPenalty). XP death penalty is not
 * modeled (≤10% of one level's progress per death — callers track deaths).
 */
export function simulateZoneSession(build: SimBuild, opts: ZoneSessionOptions): ZoneSessionResult {
  const char = buildCharacter(build)
  // NG+ Attunement HP — mirrors characterStore.recalcStats()
  char.maxHP = Math.floor(char.maxHP * (1 + opts.tier * NG_TIER_PLAYER_POWER))
  char.currentHP = char.maxHP
  const buffs: CombatBuffs = { ...buildBuffs(build), ngTier: opts.tier }
  const passiveRegenPct = (build.ascension['blessed-regen'] ?? 0) * 0.005
  let deathPactSaves = build.ascension['death-pact'] ?? 0

  const attackInterval = playerAttackIntervalMs(char, 0)

  let t = 0
  let kills = 0
  let bossKills = 0
  let deaths = 0
  let xpGained = 0
  let killCount = 0
  let killsToNextBoss = rollDamage(10, 15)
  let normalFightMsTotal = 0

  let enemy: Enemy = spawnEnemy(opts.zone, opts.tier)
  let fightStart = 0
  let tPlayer = attackInterval
  let tEnemy = enemy.attackSpeed
  let tRegen = 1000

  const spawnNext = (): void => {
    if (killCount >= killsToNextBoss) {
      enemy = getBossForZone(opts.zone, opts.tier)
      killCount = 0
      killsToNextBoss = rollDamage(10, 15)
    } else {
      enemy = spawnEnemy(opts.zone, opts.tier)
    }
    fightStart = t
    // Engine reschedules both timers after every spawn
    tPlayer = t + attackInterval
    tEnemy = t + enemy.attackSpeed
  }

  while (t < opts.durationMs) {
    const tNextRegen = passiveRegenPct > 0 ? tRegen : Infinity
    t = Math.min(tPlayer, tEnemy, tNextRegen)
    if (t >= opts.durationMs) break

    if (t === tNextRegen) {
      const amt = Math.max(1, Math.floor(passiveRegenPct * char.maxHP))
      char.currentHP = Math.min(char.maxHP, char.currentHP + amt)
      tRegen += 1000
      continue
    }

    if (t === tPlayer) {
      const outcome = resolvePlayerAttack(char, enemy, buffs)
      if (outcome.hit) {
        enemy.hp -= outcome.poisonDamage + outcome.damage + outcome.doublecastDamage
        if (outcome.lifestealHeal > 0) {
          char.currentHP = Math.min(char.maxHP, char.currentHP + outcome.lifestealHeal)
        }
      }
      if (enemy.hp <= 0) {
        kills++
        xpGained += enemy.xpReward
        if (enemy.isBoss) {
          bossKills++
        } else {
          killCount++
          normalFightMsTotal += t - fightStart
        }
        const heal = resolveKillRegen(char)
        if (heal > 0) char.currentHP = Math.min(char.maxHP, char.currentHP + heal)
        spawnNext()
      } else {
        tPlayer += attackInterval
      }
      continue
    }

    // Enemy attack
    const outcome = resolveEnemyAttack(char, enemy, buffs)
    if (outcome.damage > 0) {
      char.currentHP -= outcome.damage
      if (char.currentHP <= 0) {
        if (deathPactSaves > 0) {
          deathPactSaves--
          char.currentHP = 1
        } else {
          deaths++
          char.currentHP = char.maxHP // applyDeathPenalty respawns at full HP
          spawnNext()
          continue
        }
      }
    }
    tEnemy += enemy.attackSpeed
  }

  return {
    zone: opts.zone,
    tier: opts.tier,
    durationMs: opts.durationMs,
    kills,
    bossKills,
    deaths,
    xpGained,
    killsPerMinute: kills / (opts.durationMs / 60_000),
    avgKillMs: normalFightMsTotal / Math.max(1, kills - bossKills),
  }
}

/**
 * Highest NG+ tier (scanning 0..maxTier) at which the build farms the zone
 * with zero deaths for `durationMs`. Returns -1 if it dies even at tier 0.
 */
export function maxSustainableTier(
  build: SimBuild,
  zone: ZoneId,
  { maxTier = 30, durationMs = 15 * 60_000, seed = 1 }: { maxTier?: number; durationMs?: number; seed?: number } = {},
): number {
  for (let tier = 0; tier <= maxTier; tier++) {
    const result = withSeededRandom(seed + tier, () =>
      simulateZoneSession(build, { zone, tier, durationMs }),
    )
    if (result.deaths > 0 || result.kills === 0) return tier - 1
  }
  return maxTier
}

// ── Full prestige run simulation ──────────────────────────────────────────────

export interface RunConfig {
  classId: ClassId
  /** NG+ difficulty tier for the whole run (= prestige count) */
  tier: number
  /** Prestige bonus stacks */
  vitalityStacks?: number      // 0–12
  startingLevelStacks?: number // 0–5 (start at stacks × 5)
  xpBoostStacks?: number       // 0–8 (+20% each)
  transcendStacks?: number     // 0–5 (+5 max level each)
  ascension?: Partial<Record<AscensionBonusId, number>>
  /** Gear quality the player maintains at each zone tier (default 'epic') */
  gearRarity?: RarityId
  /** Model fully-enchanted gear (3 enchant specials per piece) */
  enchanted?: boolean
  /** Abort the run after this much virtual time (default 14 days) */
  maxVirtualHours?: number
  seed?: number
}

export interface RunZoneLog {
  zone: ZoneId
  enteredAtLevel: number
  virtualHours: number
  kills: number
  deaths: number
}

export interface RunResult {
  /** True if the run reached the level cap */
  completed: boolean
  finalLevel: number
  levelCap: number
  /** Zone where progress stalled (dying faster than killing, or no kills) */
  wallZone: ZoneId | null
  totalDeaths: number
  virtualHours: number
  zoneLog: RunZoneLog[]
}

const RUN_CHUNK_MS = 10 * 60_000
/** Enchant levels an "enchanted" full-run player maintains per gear piece */
const RUN_ENCHANT_LEVELS = 6

function bestZoneFor(level: number): { zone: ZoneId; tier: number } {
  let best = ZONE_PROGRESSION[0]
  for (const z of ZONE_PROGRESSION) {
    if (level >= z.unlockLevel) best = z
  }
  return best
}

/**
 * Plays out an entire prestige run in virtual time: starts at the head-start
 * level, farms the highest unlocked zone, levels up from (tier-scaled) XP,
 * auto-allocates skill points with the same priorities as idle play, and
 * re-gears to at-tier items on each zone change.
 *
 * A run "walls" when a 10-minute chunk produces no kills, or at least 5
 * deaths with fewer kills than deaths — i.e. the player can no longer farm.
 */
export function simulateFullRun(config: RunConfig): RunResult {
  const {
    classId,
    tier,
    vitalityStacks = 0,
    startingLevelStacks = 0,
    xpBoostStacks = 0,
    transcendStacks = 0,
    ascension = {},
    gearRarity = 'epic',
    enchanted = false,
    maxVirtualHours = 14 * 24,
    seed = 1,
  } = config

  return withSeededRandom(seed, () => {
    const levelCap = 100 + transcendStacks * 5
    const xpMult = (1 + xpBoostStacks * 0.2) * (1 + (ascension['arcane-surge'] ?? 0) * 0.05)

    let level = startingLevelStacks > 0 ? startingLevelStacks * 5 : 1
    let xpInLevel = 0
    let totalMs = 0
    let totalDeaths = 0
    const upgrades: Partial<Record<UpgradeId, number>> = {}

    const allocatePoint = (): void => {
      const choices = rollUpgradeChoices(classId, upgrades)
      if (choices.length === 0) return
      const pick = autoPickUpgrade(classId, choices)
      upgrades[pick.id] = (upgrades[pick.id] ?? 0) + 1
    }
    for (let i = 1; i < level; i++) allocatePoint() // head-start skill points

    const zoneLog: RunZoneLog[] = []
    let wallZone: ZoneId | null = null
    const maxMs = maxVirtualHours * 3_600_000

    while (level < levelCap && totalMs < maxMs && !wallZone) {
      const { zone, tier: zoneTier } = bestZoneFor(level)
      let log = zoneLog[zoneLog.length - 1]
      if (!log || log.zone !== zone) {
        log = { zone, enteredAtLevel: level, virtualHours: 0, kills: 0, deaths: 0 }
        zoneLog.push(log)
      }

      const build: SimBuild = {
        classId,
        level,
        upgrades: { ...upgrades },
        vitalityStacks,
        ascension,
        weapon: enchanted
          ? applyEnchantLevels(makeSimWeapon(zoneTier, gearRarity), RUN_ENCHANT_LEVELS)
          : makeSimWeapon(zoneTier, gearRarity),
        armor: enchanted
          ? applyEnchantLevels(makeSimArmor(zoneTier, gearRarity), RUN_ENCHANT_LEVELS)
          : makeSimArmor(zoneTier, gearRarity),
      }

      const chunk = simulateZoneSession(build, { zone, tier, durationMs: RUN_CHUNK_MS })
      totalMs += RUN_CHUNK_MS
      totalDeaths += chunk.deaths
      log.virtualHours += RUN_CHUNK_MS / 3_600_000
      log.kills += chunk.kills
      log.deaths += chunk.deaths

      if (chunk.kills === 0 || (chunk.deaths >= 5 && chunk.kills < chunk.deaths)) {
        wallZone = zone
        break
      }

      xpInLevel += chunk.xpGained * xpMult
      while (level < levelCap && xpInLevel >= getXPToNextLevel(level)) {
        xpInLevel -= getXPToNextLevel(level)
        level++
        allocatePoint()
      }
    }

    return {
      completed: level >= levelCap,
      finalLevel: level,
      levelCap,
      wallZone,
      totalDeaths,
      virtualHours: totalMs / 3_600_000,
      zoneLog,
    }
  })
}

/** Convenience: a fully invested lvl-100 character in max-enchanted legendary at-zone gear */
export function maxedBuild(classId: ClassId, zoneTier: number, vitalityStacks = 12): SimBuild {
  return {
    classId,
    level: 100,
    upgrades: maxedUpgrades(classId),
    vitalityStacks,
    ascension: {
      'overkill': 5, 'ghost-strike': 5, 'arcane-surge': 5,
      'blessed-regen': 5, 'death-pact': 5, 'dragon-scales': 5,
    },
    weapon: applyEnchantLevels(makeSimWeapon(zoneTier, 'legendary'), 30, mulberry32(101)),
    armor: applyEnchantLevels(makeSimArmor(zoneTier, 'legendary'), 30, mulberry32(102)),
  }
}

// ── Enchant ROI measurement ───────────────────────────────────────────────────

export interface EnchantROIRow {
  /** Enchant levels applied to BOTH weapon and armor */
  level: number
  /** Gold paid for this level (weapon + armor enchant costs) */
  cost: number
  cumulativeCost: number
  killsPerMinute: number
  /** Kill-rate gain vs level 0, in percent */
  kpmDeltaPct: number
  /** Kills needed to earn back this level's cost at this zone's gold rate */
  paybackKills: number
  /** Minutes of farming at this level's own kill rate to pay it back */
  paybackMinutes: number
}

/**
 * Measures what each enchant level is worth: farms the zone with weapon+armor
 * enchanted to 0..levels and reports kill-rate gains and gold payback. Gear is
 * enchanted incrementally with a seeded rng so level n is a strict superset of
 * level n−1.
 */
export function measureEnchantROI(
  build: SimBuild,
  zone: ZoneId,
  opts: { tier: number; levels: number; durationMs?: number; seed?: number },
): EnchantROIRow[] {
  const { tier, levels, durationMs = 10 * 60_000, seed = 1 } = opts
  const goldPerKill = zoneGoldPerKill(zone, tier)
  const enchantRng = mulberry32(seed)

  const weapon = structuredClone(build.weapon)
  const armor = structuredClone(build.armor)
  const rows: EnchantROIRow[] = []
  let baseKpm = 0
  let cumulativeCost = 0

  for (let level = 0; level <= levels; level++) {
    let cost = 0
    if (level > 0) {
      for (const item of [weapon, armor]) {
        if (!item) continue
        const price = calcEnchantCost(item)
        // applyEnchant is free ('maxed') once nothing can improve
        if (applyEnchant(item, enchantRng).kind !== 'maxed') cost += price
      }
      cumulativeCost += cost
    }

    const session = withSeededRandom(seed + level, () =>
      simulateZoneSession(
        { ...build, weapon: structuredClone(weapon), armor: structuredClone(armor) },
        { zone, tier, durationMs },
      ),
    )
    if (level === 0) baseKpm = session.killsPerMinute

    rows.push({
      level,
      cost,
      cumulativeCost,
      killsPerMinute: session.killsPerMinute,
      kpmDeltaPct: baseKpm > 0 ? ((session.killsPerMinute - baseKpm) / baseKpm) * 100 : 0,
      paybackKills: Math.ceil(cost / goldPerKill),
      paybackMinutes: session.killsPerMinute > 0 ? cost / goldPerKill / session.killsPerMinute : Infinity,
    })
  }
  return rows
}
