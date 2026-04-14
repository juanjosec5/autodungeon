import type { Character, ClassId, UpgradeId } from '../types/index'

export interface UpgradeDef {
  id: UpgradeId
  name: string
  description: string
  maxPicks: number
  allowedClasses: ClassId[] | 'any'
}

export interface UpgradeBonuses {
  flatDef: number
  critThresholdReduction: number
  blockBonus: number
  dodgeBonus: number
  spellAmpBonus: number
  critDamageBonus: number
  lifestealBonus: number
  defIgnoreBonus: number
  regenOnKillBonus: number
  attackSpeedReduction: number  // ms to subtract from attack interval
}

export const UPGRADE_DEFINITIONS: UpgradeDef[] = [
  // ── Stat upgrades ────────────────────────────────────────────────────────
  { id: 'str-up',    name: 'Raw Strength',   description: '+2 STR',             maxPicks: 20, allowedClasses: 'any' },
  { id: 'dex-up',    name: 'Nimble Fingers', description: '+2 DEX',             maxPicks: 20, allowedClasses: 'any' },
  { id: 'int-up',    name: 'Arcane Focus',   description: '+2 INT',             maxPicks: 20, allowedClasses: 'any' },
  { id: 'hp-up',     name: 'Fortitude',      description: '+15 max HP',         maxPicks: 20, allowedClasses: 'any' },
  { id: 'flat-def',  name: 'Iron Skin',      description: '+3 effective DEF',   maxPicks: 10, allowedClasses: 'any' },
  { id: 'atk-speed', name: 'Swift Strikes',  description: '−80ms attack speed', maxPicks: 5,  allowedClasses: 'any' },
  // ── Special upgrades ─────────────────────────────────────────────────────
  { id: 'crit-chance', name: 'Killing Blow',  description: 'Crit threshold −1 (easier crits)',   maxPicks: 6, allowedClasses: 'any' },
  { id: 'crit-damage', name: 'Lucky Strike',  description: '+10% crit damage multiplier',         maxPicks: 8, allowedClasses: 'any' },
  { id: 'dodge',       name: 'Shadow Step',   description: '+4% chance to dodge attacks',         maxPicks: 8, allowedClasses: 'any' },
  { id: 'block',       name: 'Shield Wall',   description: '+5% chance to block attacks',         maxPicks: 8, allowedClasses: 'any' },
  { id: 'lifesteal',   name: 'Blood Drinker', description: '+4% lifesteal on hit',                maxPicks: 6, allowedClasses: 'any' },
  { id: 'spell-amp',   name: 'Spell Surge',   description: '+8% spell amplification',             maxPicks: 6, allowedClasses: ['mage', 'priest'] },
  { id: 'def-ignore',  name: 'Armor Pierce',  description: '+5% enemy DEF ignored',               maxPicks: 5, allowedClasses: ['warrior', 'rogue', 'undead', 'dragonkin'] },
  { id: 'regen-kill',  name: 'Predator',      description: '+5% HP regen chance on kill',         maxPicks: 5, allowedClasses: 'any' },
]

// Auto-select priority per class — earlier = preferred
const AUTO_PRIORITY: Record<ClassId, UpgradeId[]> = {
  warrior:   ['str-up',    'flat-def',   'hp-up',     'def-ignore', 'crit-damage', 'block',       'atk-speed', 'crit-chance', 'lifesteal', 'dex-up',    'regen-kill', 'dodge', 'int-up', 'spell-amp'],
  rogue:     ['dex-up',    'crit-chance','crit-damage','def-ignore', 'atk-speed',  'lifesteal',   'str-up',    'dodge',       'hp-up',     'flat-def',  'regen-kill', 'block', 'int-up', 'spell-amp'],
  mage:      ['int-up',    'spell-amp',  'crit-damage','crit-chance','atk-speed',  'hp-up',        'dex-up',   'regen-kill',  'flat-def',  'dodge',     'str-up',     'block', 'lifesteal', 'def-ignore'],
  priest:    ['int-up',    'spell-amp',  'hp-up',      'regen-kill', 'crit-damage','flat-def',    'dex-up',   'block',       'crit-chance','dodge',    'str-up',     'lifesteal', 'atk-speed', 'def-ignore'],
  undead:    ['str-up',    'lifesteal',  'crit-chance','crit-damage','def-ignore', 'hp-up',        'flat-def', 'atk-speed',   'dex-up',    'dodge',     'regen-kill', 'block', 'int-up', 'spell-amp'],
  dragonkin: ['str-up',    'crit-damage','flat-def',   'def-ignore', 'crit-chance','hp-up',        'atk-speed','lifesteal',   'dex-up',    'regen-kill','block',      'dodge', 'int-up', 'spell-amp'],
}

export function getEligibleUpgrades(
  classId: ClassId,
  current: Partial<Record<UpgradeId, number>>,
): UpgradeDef[] {
  return UPGRADE_DEFINITIONS.filter((u) => {
    const allowed = u.allowedClasses === 'any' || u.allowedClasses.includes(classId)
    const picks = current[u.id] ?? 0
    return allowed && picks < u.maxPicks
  })
}

export function rollUpgradeChoices(
  classId: ClassId,
  current: Partial<Record<UpgradeId, number>>,
): UpgradeDef[] {
  const eligible = getEligibleUpgrades(classId, current)
  if (eligible.length <= 3) return eligible

  // Fisher-Yates shuffle and take first 3
  const pool = [...eligible]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3)
}

export function autoPickUpgrade(classId: ClassId, choices: UpgradeDef[]): UpgradeDef {
  const priority = AUTO_PRIORITY[classId]
  for (const id of priority) {
    const match = choices.find((c) => c.id === id)
    if (match) return match
  }
  return choices[0]
}

/** Mutates character in place — apply once per pick. */
export function applyUpgrade(char: Character, upgradeId: UpgradeId): void {
  if (!char.upgrades) char.upgrades = {}
  char.upgrades[upgradeId] = (char.upgrades[upgradeId] ?? 0) + 1

  // Direct stat mutations for base-stat upgrades (engine already reads these)
  switch (upgradeId) {
    case 'str-up': char.stats.str += 2; break
    case 'dex-up': char.stats.dex += 2; break
    case 'int-up': char.stats.int += 2; break
    case 'hp-up':
      char.maxHP += 15
      char.currentHP = Math.min(char.maxHP, char.currentHP + 15)
      break
    // All others are engine-only bonuses — the upgrades record is the source of truth
  }
}

export function getUpgradeBonuses(upgrades: Partial<Record<UpgradeId, number>>): UpgradeBonuses {
  return {
    flatDef:               (upgrades['flat-def']    ?? 0) * 3,
    critThresholdReduction:(upgrades['crit-chance'] ?? 0),
    blockBonus:            (upgrades['block']        ?? 0) * 0.05,
    dodgeBonus:            (upgrades['dodge']        ?? 0) * 0.04,
    spellAmpBonus:         (upgrades['spell-amp']   ?? 0) * 0.08,
    critDamageBonus:       (upgrades['crit-damage'] ?? 0) * 0.10,
    lifestealBonus:        (upgrades['lifesteal']   ?? 0) * 0.04,
    defIgnoreBonus:        (upgrades['def-ignore']  ?? 0) * 0.05,
    regenOnKillBonus:      (upgrades['regen-kill']  ?? 0) * 0.05,
    attackSpeedReduction:  (upgrades['atk-speed']   ?? 0) * 80,
  }
}
