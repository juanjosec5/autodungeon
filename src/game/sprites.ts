type Row = (string | null)[]
export type Sprite = Row[]

const _ = null

// ─── FOREST ZONE ─────────────────────────────────────────────────────────────

const WOLF: Sprite = (() => {
  const F = '#7a6040', L = '#b09070', D = '#201008', C = '#f0e8c0'
  return [
    [_,_,F,_,_,_,_,_,F,_,_,_],
    [_,F,F,F,_,_,_,F,F,F,_,_],
    [_,F,F,F,F,F,F,F,F,F,_,_],
    [_,F,D,F,F,F,F,F,D,F,_,_],
    [_,F,F,C,C,C,C,C,F,F,_,_],
    [_,_,F,C,D,C,C,C,F,_,_,_],
    [_,F,F,F,F,F,F,F,F,F,_,_],
    [_,L,L,F,F,F,F,F,L,L,_,_],
    [_,_,L,L,L,L,L,L,L,_,_,_],
    [_,F,_,L,_,_,_,L,_,F,_,_],
    [_,F,_,F,_,_,_,F,_,F,_,_],
  ]
})()

const GIANT_SPIDER: Sprite = (() => {
  const B = '#2a1200', E = '#cc2200', A = '#4a2200', L = '#180800'
  return [
    [L,_,L,_,_,_,_,_,L,_,L,_],
    [_,L,_,A,A,A,A,A,_,L,_,_],
    [_,L,_,A,E,A,E,A,_,L,_,_],
    [L,_,_,A,A,B,A,A,_,_,L,_],
    [_,_,_,A,A,A,A,A,_,_,_,_],
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [_,L,_,B,B,B,B,B,_,L,_,_],
    [_,_,L,_,B,B,B,_,L,_,_,_],
    [_,L,_,_,_,_,_,_,_,L,_,_],
  ]
})()

const GOBLIN: Sprite = (() => {
  const G = '#3a7a20', E = '#ddaa00', T = '#88ff44', B = '#5a3810'
  return [
    [_,_,_,_,G,G,G,_,_,_,_,_],
    [_,_,G,_,G,G,G,_,G,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,_,G,E,G,G,G,E,G,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,_,_,G,T,G,T,G,_,_,_,_],
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [_,G,_,B,B,B,B,B,_,G,_,_],
    [_,G,_,B,B,B,B,B,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
  ]
})()

const GOBLIN_SHAMAN: Sprite = (() => {
  const G = '#3a7a20', E = '#aa5500', P = '#cc44ff', V = '#5a2a7a'
  return [
    [_,_,_,_,_,_,_,_,_,_,P,_],
    [_,_,_,P,G,G,G,_,_,_,P,_],
    [_,_,G,_,G,G,G,G,_,_,P,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,_,G,P,G,G,G,E,G,_,_,_],
    [_,_,_,G,P,G,G,G,_,_,_,_],
    [_,_,_,V,V,V,V,V,_,_,_,_],
    [_,G,_,V,V,V,V,V,_,P,_,_],
    [_,G,_,V,V,V,V,_,P,_,_,_],
    [_,_,_,V,V,V,V,_,_,_,_,_],
    [_,_,_,V,_,_,V,_,_,_,_,_],
  ]
})()

const BANDIT: Sprite = (() => {
  const C = '#383838', D = '#181818', S = '#c0c0b0', B = '#2a2010', A = '#707068'
  return [
    [_,_,_,C,C,C,C,C,_,_,_,_],
    [_,_,C,C,C,C,C,C,C,_,_,_],
    [_,_,C,D,D,D,D,D,C,_,_,_],
    [_,_,C,D,A,D,A,D,C,_,_,_],
    [_,_,C,D,D,D,D,D,C,_,_,_],
    [_,_,C,C,C,C,C,C,C,_,_,_],
    [_,C,C,B,B,B,B,B,C,S,_,_],
    [_,_,C,B,B,B,B,B,C,S,_,_],
    [_,_,_,C,B,B,B,C,_,S,_,_],
    [_,_,_,C,_,B,_,C,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
  ]
})()

const FOREST_TROLL: Sprite = (() => {
  const G = '#4a6030', D = '#2a3a18', L = '#6a8040', E = '#dd4400'
  return [
    [_,_,_,G,G,G,G,G,_,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,G,G,G,E,G,G,E,G,G,_,_],
    [_,G,G,G,G,G,G,G,G,G,_,_],
    [_,G,G,G,G,D,G,G,G,G,_,_],
    [_,G,G,L,G,G,G,L,G,G,_,_],
    [G,G,G,G,G,G,G,G,G,G,G,_],
    [G,G,G,G,G,G,G,G,G,G,G,_],
    [G,G,G,L,G,G,G,L,G,G,_,_],
    [_,G,G,_,G,G,G,_,G,G,_,_],
    [_,G,G,_,_,_,_,_,G,G,_,_],
    [_,G,_,_,_,_,_,_,_,G,_,_],
  ]
})()

// ─── DUNGEON ZONE ────────────────────────────────────────────────────────────

const ZOMBIE: Sprite = (() => {
  const Z = '#5a7a40', D = '#2a4020', E = '#dd8800', R = '#883300', G = '#404830'
  return [
    [_,_,_,Z,Z,Z,Z,_,_,_,_,_],
    [_,_,Z,Z,Z,Z,Z,Z,_,_,_,_],
    [_,_,Z,E,Z,Z,Z,E,Z,_,_,_],
    [_,_,Z,Z,R,Z,Z,Z,Z,_,_,_],
    [_,_,Z,Z,Z,D,Z,Z,Z,_,_,_],
    [_,_,_,G,G,G,G,G,_,_,_,_],
    [Z,Z,G,G,G,G,G,G,G,_,_,_],
    [Z,_,_,G,G,G,G,G,_,_,_,_],
    [_,_,_,G,G,G,G,G,_,_,_,_],
    [_,_,_,G,_,_,G,_,_,_,_,_],
    [_,_,_,G,_,_,G,_,_,_,_,_],
  ]
})()

const SKELETON: Sprite = (() => {
  const W = '#d0c8a0', D = '#303020', E = '#202010', R = '#504838'
  return [
    [_,_,_,W,W,W,W,_,_,_,_,_],
    [_,_,W,W,W,W,W,W,_,_,_,_],
    [_,_,W,E,W,W,E,W,W,_,_,_],
    [_,_,W,E,W,W,E,W,W,_,_,_],
    [_,_,_,W,W,W,W,W,_,_,_,_],
    [_,_,_,W,D,D,W,W,_,_,_,_],
    [_,_,_,R,W,W,W,R,_,_,_,_],
    [_,W,_,R,W,W,W,R,_,W,_,_],
    [_,W,_,R,R,R,R,R,_,_,_,_],
    [_,_,_,W,_,_,W,_,_,_,_,_],
    [_,_,_,W,_,_,W,_,_,_,_,_],
    [_,_,_,W,W,_,W,W,_,_,_,_],
  ]
})()

const ORC: Sprite = (() => {
  const G = '#4a7a20', D = '#283a10', E = '#dd4400', T = '#eecc66'
  return [
    [_,_,_,G,G,G,G,G,_,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,_,G,E,G,G,G,E,G,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,G,G,G,T,G,T,G,G,G,_,_],
    [_,_,G,D,G,G,G,D,G,_,_,_],
    [_,_,D,D,D,D,D,D,D,_,_,_],
    [_,G,D,D,D,D,D,D,D,G,_,_],
    [_,G,_,D,D,D,D,D,_,G,_,_],
    [_,_,_,D,_,_,_,D,_,_,_,_],
    [_,_,_,D,D,_,D,D,_,_,_,_],
  ]
})()

const ORC_BERSERKER: Sprite = (() => {
  const G = '#5a9a20', D = '#2a4010', L = '#88cc40', E = '#ff4400', T = '#eecc66', X = '#909090'
  return [
    [X,_,_,G,G,G,G,G,_,_,X,_],
    [X,_,G,G,G,G,G,G,G,_,X,_],
    [_,_,G,E,G,G,G,E,G,_,_,_],
    [_,_,G,G,G,G,G,G,G,_,_,_],
    [_,G,G,T,G,G,T,G,G,G,_,_],
    [_,_,G,G,D,G,G,G,G,_,_,_],
    [_,_,D,L,D,D,D,L,D,_,_,_],
    [G,_,D,D,D,D,D,D,D,_,G,_],
    [G,_,_,D,D,D,D,D,_,_,G,_],
    [_,_,_,D,_,_,_,D,_,_,_,_],
    [_,_,_,D,D,_,D,D,_,_,_,_],
  ]
})()

const LICH: Sprite = (() => {
  const P = '#6030a8', D = '#301860', E = '#00ccff', C = '#eeeecc', R = '#aa88ff', B = '#4a2888'
  return [
    [_,_,_,C,P,C,P,C,_,_,_,_],
    [_,_,_,D,D,D,D,D,_,_,_,_],
    [_,_,D,D,E,D,E,D,D,_,_,_],
    [_,_,D,D,D,D,D,D,D,_,_,_],
    [_,_,D,D,D,D,D,D,D,_,_,_],
    [_,_,D,D,P,P,P,D,D,_,_,_],
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [R,_,B,B,E,B,B,B,B,_,R,_],
    [R,_,_,B,B,B,B,B,_,_,_,_],
    [_,_,_,P,B,B,B,P,_,_,_,_],
    [_,_,_,_,P,B,P,_,_,_,_,_],
  ]
})()

const DARK_KNIGHT: Sprite = (() => {
  const A = '#303040', D = '#181820', L = '#5060a0', E = '#cc3300', S = '#9090a0'
  return [
    [_,_,_,A,A,A,A,A,_,_,_,_],
    [_,_,A,A,A,A,A,A,A,_,_,_],
    [_,_,A,E,A,A,A,E,A,_,_,_],
    [_,_,A,A,A,A,A,A,A,_,_,_],
    [_,_,A,A,D,D,D,A,A,_,_,_],
    [_,_,L,A,A,A,A,A,L,_,_,_],
    [_,A,A,A,A,A,A,A,A,A,_,_],
    [S,A,_,A,A,A,A,A,_,A,S,_],
    [S,_,_,A,A,A,A,A,_,_,S,_],
    [_,_,_,A,_,_,_,A,_,_,_,_],
    [_,_,_,A,A,_,A,A,_,_,_,_],
  ]
})()

// ─── VOLCANO ZONE ────────────────────────────────────────────────────────────

const FIRE_ELEMENTAL: Sprite = (() => {
  const R = '#cc2200', O = '#ff6600', Y = '#ffcc00', W = '#ffee88', D = '#881100'
  return [
    [_,_,_,_,_,W,_,_,_,_,_,_],
    [_,_,_,_,Y,Y,Y,_,_,_,_,_],
    [_,_,_,Y,Y,O,Y,Y,_,_,_,_],
    [_,_,_,O,O,O,O,O,_,_,_,_],
    [_,_,O,O,R,O,O,O,O,_,_,_],
    [_,_,O,R,R,R,O,R,O,_,_,_],
    [_,O,R,R,R,R,R,R,R,O,_,_],
    [_,D,R,R,D,R,R,D,R,D,_,_],
    [_,_,D,D,R,R,D,D,_,_,_,_],
    [_,_,_,D,D,D,D,_,_,_,_,_],
  ]
})()

const MAGMA_GOLEM: Sprite = (() => {
  const S = '#3a3030', O = '#ff6600', Y = '#ffaa00', L = '#5a4040'
  return [
    [_,_,S,S,S,S,S,S,S,_,_,_],
    [_,S,S,O,S,S,S,O,S,S,_,_],
    [_,S,S,S,S,S,S,S,S,S,_,_],
    [_,S,S,O,O,S,O,O,S,S,_,_],
    [S,S,S,S,S,S,S,S,S,S,S,_],
    [S,S,L,S,O,S,O,S,L,S,_,_],
    [S,S,S,S,S,S,S,S,S,S,_,_],
    [S,Y,S,S,S,S,S,S,Y,S,_,_],
    [_,S,S,S,S,S,S,S,S,_,_,_],
    [_,_,S,S,_,_,_,S,S,_,_,_],
    [_,_,S,_,_,_,_,_,S,_,_,_],
  ]
})()

const WYVERN: Sprite = (() => {
  const R = '#8a2010', D = '#5a1008', O = '#cc4420', E = '#ffaa00'
  return [
    [R,_,_,_,_,_,_,_,_,_,R,_],
    [R,R,_,_,_,_,_,_,_,R,R,_],
    [D,R,R,_,R,R,R,_,R,R,D,_],
    [_,D,R,_,O,O,O,_,R,D,_,_],
    [_,_,R,O,O,E,O,O,R,_,_,_],
    [_,_,R,O,O,O,O,O,R,_,_,_],
    [_,D,R,R,O,O,O,R,R,D,_,_],
    [D,_,_,R,R,O,R,R,_,_,D,_],
    [_,_,_,_,R,D,R,_,_,_,_,_],
    [_,_,_,R,_,_,_,R,_,_,_,_],
    [_,_,_,R,_,_,_,R,_,_,_,_],
  ]
})()

const INFERNO_DRAKE: Sprite = (() => {
  const R = '#aa2800', D = '#6a1500', O = '#ff6600', E = '#ffdd00'
  return [
    [_,_,_,_,D,_,_,_,_,_,_,_],
    [_,_,_,D,R,D,_,R,_,_,_,_],
    [_,_,D,R,E,R,R,R,R,_,_,_],
    [_,_,R,R,R,O,R,R,R,_,_,_],
    [_,D,R,R,R,R,R,R,R,D,_,_],
    [D,_,_,R,R,R,R,R,_,_,D,_],
    [_,_,_,R,R,R,R,R,_,_,_,_],
    [_,_,_,D,R,_,R,D,_,_,_,_],
    [_,_,_,D,_,_,_,D,_,_,_,_],
    [_,_,D,D,_,_,D,D,_,_,_,_],
  ]
})()

const LAVA_WITCH: Sprite = (() => {
  const P = '#5a1a2a', D = '#2a0a10', O = '#ff6600', E = '#ffaa00', R = '#8a2020'
  return [
    [_,_,_,P,P,P,P,P,_,_,_,_],
    [_,_,_,_,P,P,P,_,_,_,_,_],
    [_,_,_,_,_,P,_,_,_,_,_,_],
    [_,_,R,R,R,R,R,R,_,_,_,_],
    [_,_,R,O,R,R,R,E,R,_,_,_],
    [_,_,R,R,R,D,R,R,R,_,_,_],
    [_,_,P,P,P,P,P,P,_,_,_,_],
    [_,R,P,O,P,P,P,P,_,_,R,_],
    [_,_,P,O,P,P,P,_,R,_,_,_],
    [_,_,_,P,P,P,P,_,_,_,_,_],
    [_,_,_,P,_,_,P,_,_,_,_,_],
  ]
})()

const DRAGON: Sprite = (() => {
  const R = '#882010', D = '#4a1008', E = '#ffcc00', G = '#cc8800', S = '#cc2200'
  return [
    [D,_,_,_,_,_,_,_,_,_,D,_],
    [D,D,_,_,_,_,_,_,_,D,D,_],
    [D,R,D,_,D,R,R,D,_,D,R,_],
    [_,D,R,D,R,R,R,R,D,R,D,_],
    [_,_,R,R,G,E,E,G,R,R,_,_],
    [_,_,R,R,R,R,R,R,R,_,_,_],
    [_,D,R,D,R,R,R,D,R,D,_,_],
    [D,_,_,S,R,R,R,S,_,_,D,_],
    [_,_,_,R,R,R,R,R,_,_,_,_],
    [_,_,D,R,_,R,_,R,D,_,_,_],
    [_,_,D,D,_,_,_,D,D,_,_,_],
  ]
})()

// ─── ABYSS ZONE ──────────────────────────────────────────────────────────────

const SHADOW_IMP: Sprite = (() => {
  const B = '#1a0a2a', D = '#0a0514', E = '#aa22ff', H = '#6010a0', W = '#3a1558'
  return [
    [_,_,_,B,_,_,_,B,_,_,_,_],
    [_,_,B,B,B,_,B,B,B,_,_,_],
    [_,_,H,H,H,H,H,H,H,_,_,_],
    [_,_,H,E,H,H,H,E,H,_,_,_],
    [_,_,H,H,H,D,H,H,H,_,_,_],
    [_,W,W,W,W,W,W,W,W,W,_,_],
    [W,_,_,H,H,H,H,H,_,_,W,_],
    [_,_,_,B,H,H,H,B,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
  ]
})()

const VOID_HOUND: Sprite = (() => {
  const B = '#0a0515', D = '#15082a', E = '#00eeff', P = '#4a1a6a'
  return [
    [_,_,B,_,_,_,_,_,B,_,_,_],
    [_,B,B,B,_,_,_,B,B,B,_,_],
    [_,B,B,B,B,B,B,B,B,B,_,_],
    [_,B,E,B,B,B,B,B,E,B,_,_],
    [_,B,B,B,B,B,B,B,B,B,_,_],
    [_,_,B,D,D,D,D,D,B,_,_,_],
    [_,P,P,B,B,B,B,B,P,P,_,_],
    [_,_,P,P,P,P,P,P,P,_,_,_],
    [_,B,_,P,_,_,_,P,_,B,_,_],
    [_,B,_,B,_,_,_,B,_,B,_,_],
  ]
})()

const VOID_KNIGHT: Sprite = (() => {
  const B = '#0a0820', D = '#050410', E = '#00ffcc', C = '#1a1540', S = '#002255', A = '#001a44'
  return [
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [_,_,B,B,B,B,B,B,B,_,_,_],
    [_,_,B,E,B,B,B,E,B,_,_,_],
    [_,_,B,B,B,B,B,B,B,_,_,_],
    [_,_,B,B,D,D,D,B,B,_,_,_],
    [_,_,S,C,C,C,C,C,S,_,_,_],
    [_,C,C,C,C,C,C,C,C,C,_,_],
    [A,C,_,C,C,C,C,C,_,C,A,_],
    [A,_,_,C,C,C,C,C,_,_,A,_],
    [_,_,_,C,_,_,_,C,_,_,_,_],
    [_,_,_,C,C,_,C,C,_,_,_,_],
  ]
})()

const DEMON_LORD: Sprite = (() => {
  const R = '#5a0808', D = '#200202', E = '#ff2200', H = '#880808'
  return [
    [_,_,D,_,_,_,_,_,D,_,_,_],
    [_,D,D,D,_,_,_,D,D,D,_,_],
    [_,_,H,H,H,H,H,H,H,_,_,_],
    [_,H,E,H,H,H,H,H,E,H,_,_],
    [_,_,H,H,H,H,H,H,H,_,_,_],
    [_,_,H,H,D,D,D,H,H,_,_,_],
    [_,_,R,R,R,R,R,R,R,_,_,_],
    [R,R,R,R,R,R,R,R,R,R,_,_],
    [R,_,_,R,H,H,H,R,_,_,R,_],
    [_,_,_,R,R,R,R,R,_,_,_,_],
    [_,_,_,R,_,_,_,R,_,_,_,_],
    [_,_,D,R,_,_,D,R,_,_,_,_],
  ]
})()

const ABYSSAL_TITAN: Sprite = (() => {
  const D = '#0a0530', E = '#8800ff', C = '#3a0a5a', T = '#6a0aaa', O = '#aa44ff'
  return [
    [_,_,D,_,D,_,D,_,D,_,_,_],
    [_,D,D,D,D,D,D,D,D,D,_,_],
    [D,D,D,D,D,D,D,D,D,D,D,_],
    [D,C,E,C,D,D,D,C,E,C,D,_],
    [D,D,D,D,D,D,D,D,D,D,D,_],
    [D,D,O,D,D,D,D,D,O,D,D,_],
    [T,T,T,T,T,T,T,T,T,T,T,_],
    [T,T,T,C,C,C,C,C,T,T,T,_],
    [T,T,_,C,T,T,T,C,_,T,T,_],
    [T,_,_,_,T,T,T,_,_,_,T,_],
    [_,_,_,_,T,T,T,_,_,_,_,_],
    [_,_,_,T,_,_,_,T,_,_,_,_],
    [_,_,T,_,_,_,_,_,T,_,_,_],
  ]
})()

// ─── Registry ─────────────────────────────────────────────────────────────────

export const SPRITES: Record<string, Sprite> = {
  'Wolf':           WOLF,
  'Giant Spider':   GIANT_SPIDER,
  'Goblin':         GOBLIN,
  'Goblin Shaman':  GOBLIN_SHAMAN,
  'Bandit':         BANDIT,
  'Forest Troll':   FOREST_TROLL,
  'Zombie':         ZOMBIE,
  'Skeleton':       SKELETON,
  'Orc':            ORC,
  'Orc Berserker':  ORC_BERSERKER,
  'Lich':           LICH,
  'Dark Knight':    DARK_KNIGHT,
  'Fire Elemental': FIRE_ELEMENTAL,
  'Magma Golem':    MAGMA_GOLEM,
  'Wyvern':         WYVERN,
  'Inferno Drake':  INFERNO_DRAKE,
  'Lava Witch':     LAVA_WITCH,
  'Dragon':         DRAGON,
  'Shadow Imp':     SHADOW_IMP,
  'Void Hound':     VOID_HOUND,
  'Void Knight':    VOID_KNIGHT,
  'Demon Lord':     DEMON_LORD,
  'Abyssal Titan':  ABYSSAL_TITAN,
}

export const FALLBACK_SPRITE: Sprite = (() => {
  const B = '#6030b8', S = '#3d1a78', D = '#150a30', E = '#ee66ff'
  return [
    [_,_,_,_,B,B,B,B,_,_,_,_],
    [_,_,_,B,B,B,B,B,B,_,_,_],
    [_,_,B,B,B,B,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,B,B,B,B,_],
    [B,B,B,B,B,B,B,B,B,B,B,B],
    [B,B,S,S,B,B,B,B,S,S,B,B],
    [B,B,D,D,B,B,B,B,D,D,B,B],
    [B,B,E,E,B,B,B,B,E,E,B,B],
    [B,B,D,D,B,B,B,B,D,D,B,B],
    [B,B,B,B,B,B,B,B,B,B,B,B],
    [B,B,B,B,B,B,B,B,B,B,B,B],
    [B,B,B,B,B,B,B,B,B,B,B,B],
    [_,B,_,B,_,B,_,B,_,B,_,_],
  ]
})()

export function getSpriteForEnemy(name: string): Sprite {
  return SPRITES[name] ?? FALLBACK_SPRITE
}

export function buildSpriteStyle(sprite: Sprite, px = 5): string {
  const shadows: string[] = []
  for (let r = 0; r < sprite.length; r++) {
    for (let c = 0; c < sprite[r].length; c++) {
      const color = sprite[r][c]
      if (color) shadows.push(`${c * px}px ${r * px}px 0 0 ${color}`)
    }
  }
  return shadows.join(',')
}
