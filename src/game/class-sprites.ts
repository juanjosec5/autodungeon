import type { ClassId } from '../types/index'
import { type Sprite, buildSpriteStyle } from './sprites'

const _ = null

// ─── WARRIOR ──────────────────────────────────────────────────────────────────
// Broad-shouldered armored knight. Steel helmet, orange eye-glow, pauldrons.

const WARRIOR_SPRITE: Sprite = (() => {
  const H = '#808898', L = '#c0c8d8', A = '#404858'
  const S = '#c07848', O = '#e88040', G = '#606878'
  return [
    [_,_,_,H,H,H,H,H,H,_,_,_],
    [_,_,H,H,H,H,H,H,H,H,_,_],
    [_,_,H,L,L,L,L,L,H,H,_,_],
    [_,_,H,A,S,S,S,A,H,_,_,_],
    [_,_,H,A,O,A,O,A,H,_,_,_],
    [_,_,H,A,A,A,A,A,H,_,_,_],
    [_,_,A,G,G,G,G,G,A,_,_,_],
    [A,A,G,O,G,G,G,O,G,A,_,_],
    [A,A,G,G,G,G,G,G,G,A,_,_],
    [_,A,A,G,G,G,G,G,A,A,_,_],
    [_,A,_,A,G,G,G,A,_,A,_,_],
    [_,A,_,A,A,_,_,A,A,_,_,_],
    [_,A,_,A,_,_,_,_,A,_,_,_],
  ]
})()

// ─── ROGUE ────────────────────────────────────────────────────────────────────
// Lean hooded assassin. Deep purple hood, violet eye glint, daggers at belt.

const ROGUE_SPRITE: Sprite = (() => {
  const D = '#2a1a40', B = '#5a3878', S = '#c08060'
  const V = '#a060d8', K = '#c0a040'
  return [
    [_,_,_,_,D,D,D,_,_,_,_,_],
    [_,_,_,D,D,D,D,D,_,_,_,_],
    [_,_,D,D,D,D,D,D,D,_,_,_],
    [_,_,D,D,S,S,S,D,D,_,_,_],
    [_,_,D,S,V,S,V,S,D,_,_,_],
    [_,_,D,D,S,S,S,D,D,_,_,_],
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [K,_,B,B,B,B,B,B,B,_,K,_],
    [K,_,B,V,B,B,B,V,B,_,K,_],
    [_,_,B,B,B,B,B,B,B,_,_,_],
    [_,_,B,B,_,_,_,B,B,_,_,_],
    [_,_,B,_,_,_,_,_,B,_,_,_],
    [_,_,B,_,_,_,_,_,B,_,_,_],
  ]
})()

// ─── MAGE ─────────────────────────────────────────────────────────────────────
// Robed arcane caster. Tall pointed hat, blue robes, staff left side, glowing eyes.

const MAGE_SPRITE: Sprite = (() => {
  const T = '#081840', M = '#102060', S = '#c0a060'
  const G = '#4090e0', R = '#2040a0', P = '#909090'
  return [
    [_,_,_,_,_,T,_,_,_,_,_,_],
    [_,_,_,_,T,T,T,_,_,_,_,_],
    [_,_,_,T,T,T,T,T,_,_,_,_],
    [_,_,_,M,M,M,M,M,M,_,_,_],
    [_,_,_,M,S,S,S,M,_,_,_,_],
    [_,_,_,M,G,M,G,M,_,_,_,_],
    [_,_,_,M,S,S,S,M,_,_,_,_],
    [P,_,_,R,R,R,R,R,_,_,_,_],
    [P,_,R,R,G,R,R,R,R,_,_,_],
    [P,_,R,R,R,R,R,R,R,_,_,_],
    [P,_,R,R,R,R,R,R,R,_,_,_],
    [_,_,R,R,_,_,_,R,R,_,_,_],
    [_,_,R,_,_,_,_,_,R,_,_,_],
  ]
})()

// ─── PRIEST ───────────────────────────────────────────────────────────────────
// Holy caster in white/gold robes. Halo ring, cross symbol on chest, staff left side.

const PRIEST_SPRITE: Sprite = (() => {
  const W = '#f0e8d0', G = '#e0c060', Y = '#fff0a0'
  const S = '#d09060', R = '#d8c8a0', P = '#909090'
  return [
    [_,_,_,Y,Y,Y,Y,Y,_,_,_,_],
    [_,_,Y,G,G,G,G,G,Y,_,_,_],
    [_,_,_,W,W,W,W,W,_,_,_,_],
    [_,_,_,W,S,S,S,W,_,_,_,_],
    [_,_,_,W,S,G,S,W,_,_,_,_],
    [_,_,_,W,S,S,S,W,_,_,_,_],
    [_,_,_,R,R,R,R,R,_,_,_,_],
    [P,_,R,R,G,R,R,R,R,_,_,_],
    [P,_,R,W,G,W,G,W,R,_,_,_],
    [P,_,R,R,R,R,R,R,R,_,_,_],
    [P,_,R,R,R,R,R,R,R,_,_,_],
    [_,_,R,R,_,_,_,R,R,_,_,_],
    [_,_,W,_,_,_,_,_,W,_,_,_],
  ]
})()

// ─── UNDEAD ───────────────────────────────────────────────────────────────────
// Vampiric berserker. Visible skull, necrotic eye glow, tattered dark wrappings.

const UNDEAD_SPRITE: Sprite = (() => {
  const B = '#c8c0a0', D = '#888070', N = '#60c040'
  const V = '#181808', T = '#505040'
  return [
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [_,_,B,B,B,B,B,B,B,_,_,_],
    [_,_,B,D,B,B,B,D,B,_,_,_],
    [_,_,B,V,V,B,V,V,B,_,_,_],
    [_,_,B,N,V,B,V,N,B,_,_,_],
    [_,_,B,D,D,D,D,D,B,_,_,_],
    [_,_,_,B,V,V,V,B,_,_,_,_],
    [_,_,T,T,T,T,T,T,T,_,_,_],
    [_,T,T,N,T,T,T,N,T,T,_,_],
    [_,T,T,T,T,T,T,T,T,_,_,_],
    [_,_,T,T,D,D,D,T,T,_,_,_],
    [_,_,D,_,D,_,_,D,_,D,_,_],
    [_,_,D,_,_,_,_,_,_,D,_,_],
  ]
})()

// ─── DRAGONKIN ────────────────────────────────────────────────────────────────
// Armored brute. Curved horns, scaled hide, stocky wide body, ember eyes.

const DRAGONKIN_SPRITE: Sprite = (() => {
  const R = '#c06030', D = '#803020', E = '#e06030'
  const H = '#402010', L = '#d08050', Y = '#ff8040'
  return [
    [_,H,_,_,_,_,_,_,_,H,_,_],
    [_,H,_,R,R,R,R,R,_,H,_,_],
    [_,_,R,R,R,R,R,R,R,_,_,_],
    [_,_,R,L,R,R,R,L,R,_,_,_],
    [_,_,R,Y,D,R,D,Y,R,_,_,_],
    [_,_,R,R,R,R,R,R,R,_,_,_],
    [_,R,D,D,D,D,D,D,D,R,_,_],
    [R,R,D,E,D,D,D,E,D,R,R,_],
    [R,R,D,D,D,D,D,D,D,R,R,_],
    [_,R,R,D,D,D,D,D,R,R,_,_],
    [_,R,_,R,D,D,D,R,_,R,_,_],
    [_,R,_,R,R,_,_,R,R,_,_,_],
    [_,R,_,R,_,_,_,_,R,_,_,_],
  ]
})()

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CLASS_SPRITES: Record<ClassId, Sprite> = {
  warrior:   WARRIOR_SPRITE,
  rogue:     ROGUE_SPRITE,
  mage:      MAGE_SPRITE,
  priest:    PRIEST_SPRITE,
  undead:    UNDEAD_SPRITE,
  dragonkin: DRAGONKIN_SPRITE,
}

export function buildClassSpriteStyle(classId: ClassId, px = 4): string {
  return buildSpriteStyle(CLASS_SPRITES[classId], px)
}
