import type { SkillId } from '../types/index'

export interface SkillDef {
  id: SkillId
  name: string
  description: string
  maxLevel: number
}

export interface SkillBonuses {
  flatDef: number              // iron-skin: +3 DEF per level
  critThresholdReduction: number // killing-blow: -1 per level (crits easier)
  blockBonus: number           // veterans-guard: +0.04 per level
  dodgeBonus: number           // survivors-will: +0.03 per level
  spellAmpBonus: number        // battle-focus: +0.06 per level
  critDamageBonus: number      // lucky-strike: +0.10 per level (added on top of base 1.5x)
}

export const SKILL_DEFINITIONS: SkillDef[] = [
  { id: 'iron-skin',      name: 'Iron Skin',        description: '+3 DEF per level',             maxLevel: 5 },
  { id: 'killing-blow',   name: 'Killing Blow',     description: '-1 crit threshold per level',  maxLevel: 3 },
  { id: 'veterans-guard', name: "Veteran's Guard",  description: '+4% block chance per level',   maxLevel: 5 },
  { id: 'lucky-strike',   name: 'Lucky Strike',     description: '+10% crit damage per level',   maxLevel: 5 },
  { id: 'survivors-will', name: "Survivor's Will",  description: '+3% dodge chance per level',   maxLevel: 5 },
  { id: 'battle-focus',   name: 'Battle Focus',     description: '+6% spell amp per level',      maxLevel: 5 },
]

export function getSkillBonuses(skills: Partial<Record<SkillId, number>>): SkillBonuses {
  return {
    flatDef:                (skills['iron-skin']       ?? 0) * 3,
    critThresholdReduction: (skills['killing-blow']    ?? 0),
    blockBonus:             (skills['veterans-guard']  ?? 0) * 0.04,
    dodgeBonus:             (skills['survivors-will']  ?? 0) * 0.03,
    spellAmpBonus:          (skills['battle-focus']    ?? 0) * 0.06,
    critDamageBonus:        (skills['lucky-strike']    ?? 0) * 0.10,
  }
}
