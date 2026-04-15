import type { TaskInstance, TaskType, ZoneId } from '../types/index'

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Scaling helpers ───────────────────────────────────────────────────────────

function scaleTarget(base: number, level: number): number {
  // Gentle scaling: every 10 levels adds ~30% more
  return Math.round(base * (1 + Math.floor(level / 10) * 0.3))
}

function scaleReward(baseGold: number, baseXp: number, baseTokens: number, level: number) {
  const mult = 1 + Math.floor(level / 10) * 0.5
  return {
    gold: Math.round(baseGold * mult),
    xp: Math.round(baseXp * mult),
    tokens: baseTokens,
  }
}

// ── Task pool ─────────────────────────────────────────────────────────────────

interface TaskTemplate {
  type: TaskType
  zone?: ZoneId
  baseTarget: number
  baseGold: number
  baseXp: number
  baseTokens: number
  descFn: (target: number, zone?: ZoneId) => string
}

const DAILY_POOL: TaskTemplate[] = [
  {
    type: 'kill_enemies',
    baseTarget: 30,
    baseGold: 50,
    baseXp: 200,
    baseTokens: 0,
    descFn: (t) => `Slay ${t} enemies`,
  },
  {
    type: 'kill_bosses',
    baseTarget: 3,
    baseGold: 80,
    baseXp: 300,
    baseTokens: 0,
    descFn: (t) => `Defeat ${t} bosses`,
  },
  {
    type: 'deal_damage',
    baseTarget: 5000,
    baseGold: 60,
    baseXp: 250,
    baseTokens: 0,
    descFn: (t) => `Deal ${t.toLocaleString()} damage`,
  },
  {
    type: 'earn_gold',
    baseTarget: 200,
    baseGold: 0,
    baseXp: 150,
    baseTokens: 0,
    descFn: (t) => `Earn ${t.toLocaleString()} gold`,
  },
  {
    type: 'land_crits',
    baseTarget: 20,
    baseGold: 70,
    baseXp: 280,
    baseTokens: 0,
    descFn: (t) => `Land ${t} critical hits`,
  },
  {
    type: 'kill_enemies',
    zone: 'forest',
    baseTarget: 25,
    baseGold: 40,
    baseXp: 160,
    baseTokens: 0,
    descFn: (t) => `Slay ${t} enemies in the Forest`,
  },
  {
    type: 'kill_enemies',
    zone: 'dungeon',
    baseTarget: 20,
    baseGold: 55,
    baseXp: 220,
    baseTokens: 0,
    descFn: (t) => `Slay ${t} enemies in the Dungeon`,
  },
  {
    type: 'kill_enemies',
    zone: 'volcano',
    baseTarget: 15,
    baseGold: 65,
    baseXp: 260,
    baseTokens: 0,
    descFn: (t) => `Slay ${t} enemies in the Volcano`,
  },
  {
    type: 'deal_damage',
    baseTarget: 3000,
    baseGold: 45,
    baseXp: 180,
    baseTokens: 0,
    descFn: (t) => `Deal ${t.toLocaleString()} damage in one session`,
  },
  {
    type: 'earn_gold',
    baseTarget: 150,
    baseGold: 0,
    baseXp: 120,
    baseTokens: 0,
    descFn: (t) => `Collect ${t.toLocaleString()} gold from drops`,
  },
]

const WEEKLY_POOL: TaskTemplate[] = [
  {
    type: 'kill_enemies',
    baseTarget: 300,
    baseGold: 500,
    baseXp: 2000,
    baseTokens: 1,
    descFn: (t) => `Slay ${t} enemies this week`,
  },
  {
    type: 'kill_bosses',
    baseTarget: 20,
    baseGold: 600,
    baseXp: 2500,
    baseTokens: 1,
    descFn: (t) => `Defeat ${t} bosses this week`,
  },
  {
    type: 'deal_damage',
    baseTarget: 50000,
    baseGold: 550,
    baseXp: 2200,
    baseTokens: 1,
    descFn: (t) => `Deal ${t.toLocaleString()} total damage`,
  },
  {
    type: 'earn_gold',
    baseTarget: 2000,
    baseGold: 0,
    baseXp: 1800,
    baseTokens: 1,
    descFn: (t) => `Earn ${t.toLocaleString()} gold this week`,
  },
  {
    type: 'land_crits',
    baseTarget: 150,
    baseGold: 700,
    baseXp: 2800,
    baseTokens: 1,
    descFn: (t) => `Land ${t} critical hits this week`,
  },
  {
    type: 'kill_bosses',
    baseTarget: 10,
    baseGold: 400,
    baseXp: 1600,
    baseTokens: 2,
    descFn: (t) => `Conquer ${t} dungeon bosses`,
  },
  {
    type: 'kill_enemies',
    zone: 'abyss',
    baseTarget: 100,
    baseGold: 800,
    baseXp: 3200,
    baseTokens: 1,
    descFn: (t) => `Venture into the Abyss and slay ${t} foes`,
  },
  {
    type: 'prestige_run',
    baseTarget: 1,
    baseGold: 0,
    baseXp: 0,
    baseTokens: 3,
    descFn: () => `Complete a Prestige run this week`,
  },
]

// ── Public generators ─────────────────────────────────────────────────────────

function daySeed(): number {
  return Math.floor(Date.now() / 86_400_000)
}

function weekSeed(): number {
  // Week number from epoch (weeks start on Monday)
  return Math.floor(Date.now() / (86_400_000 * 7))
}

export function generateDailyTasks(characterLevel: number): TaskInstance[] {
  const rng = seededRandom(daySeed())
  const shuffled = seededShuffle(DAILY_POOL, rng)
  return shuffled.slice(0, 3).map((tpl, i) => {
    const target = scaleTarget(tpl.baseTarget, characterLevel)
    const reward = scaleReward(tpl.baseGold, tpl.baseXp, tpl.baseTokens, characterLevel)
    return {
      id: `daily-${daySeed()}-${i}`,
      type: tpl.type,
      zone: tpl.zone,
      target,
      description: tpl.descFn(target, tpl.zone),
      reward,
      period: 'daily',
    } satisfies TaskInstance
  })
}

export function generateWeeklyTasks(characterLevel: number): TaskInstance[] {
  const rng = seededRandom(weekSeed() + 10000)
  const shuffled = seededShuffle(WEEKLY_POOL, rng)
  return shuffled.slice(0, 3).map((tpl, i) => {
    const target = scaleTarget(tpl.baseTarget, characterLevel)
    const reward = scaleReward(tpl.baseGold, tpl.baseXp, tpl.baseTokens, characterLevel)
    return {
      id: `weekly-${weekSeed()}-${i}`,
      type: tpl.type,
      zone: tpl.zone,
      target,
      description: tpl.descFn(target, tpl.zone),
      reward,
      period: 'weekly',
    } satisfies TaskInstance
  })
}

/** ms remaining until next daily reset (midnight UTC) */
export function msUntilDailyReset(): number {
  const now = Date.now()
  const nextDay = (daySeed() + 1) * 86_400_000
  return nextDay - now
}

/** ms remaining until next weekly reset (next Monday 00:00 UTC) */
export function msUntilWeeklyReset(): number {
  const now = Date.now()
  const nextWeek = (weekSeed() + 1) * 86_400_000 * 7
  return nextWeek - now
}
