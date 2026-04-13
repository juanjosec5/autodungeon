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

// ─── SHADOWREALM ZONE ────────────────────────────────────────────────────────

/** Shadow Wraith — Shadow Imp layout, silvery violet palette */
const SHADOW_WRAITH: Sprite = (() => {
  const B = '#100820', D = '#080410', E = '#dd88ff', H = '#5020a0', W = '#281050'
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

/** Soul Harvester — Lich layout, soul-green palette */
const SOUL_HARVESTER: Sprite = (() => {
  const P = '#0a3010', D = '#051808', E = '#44ff44', C = '#88dd88', R = '#208820', B = '#061406'
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

/** Dark Phantom — Shadow Imp layout, teal-black palette */
const DARK_PHANTOM: Sprite = (() => {
  const B = '#020810', D = '#010408', E = '#22ffaa', H = '#006644', W = '#020c08'
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

/** Cursed Revenant — Skeleton layout, cursed purple palette */
const CURSED_REVENANT: Sprite = (() => {
  const W = '#9080b0', D = '#403060', E = '#302050', R = '#604888'
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

/** Nightmare Stalker — original: crouching shadow hunter, red claws */
const NIGHTMARE_STALKER: Sprite = (() => {
  const B = '#1a0808', D = '#0e0404', C = '#cc3300', S = '#2a1010'
  return [
    [_,_,_,_,B,B,B,B,_,_,_,_],
    [_,_,_,B,B,B,B,B,B,_,_,_],
    [_,_,_,B,D,B,B,D,B,_,_,_],
    [_,_,B,B,B,B,B,B,B,B,_,_],
    [_,C,S,S,S,S,S,S,S,S,C,_],
    [_,C,_,B,B,B,B,B,_,_,C,_],
    [C,_,_,S,S,S,S,S,_,_,_,C],
    [_,_,_,B,B,_,_,B,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
    [_,_,C,_,_,_,_,_,C,_,_,_],
    [_,C,_,_,_,_,_,_,_,C,_,_],
  ]
})()

/** Dread Sovereign (boss) — tall crowned shadow lord, violet scepter */
const DREAD_SOVEREIGN: Sprite = (() => {
  const C = '#100820', A = '#6030a0', R = '#cc88ff', G = '#aa66ff', D = '#08041a'
  return [
    [_,_,_,R,_,R,_,R,_,_,_,_],
    [_,_,R,A,R,A,R,A,R,_,_,_],
    [_,_,_,A,A,A,A,A,_,G,_,_],
    [_,_,C,A,D,A,D,A,C,G,_,_],
    [_,_,C,A,A,A,A,A,C,G,_,_],
    [_,_,C,A,A,D,A,A,C,_,_,_],
    [_,_,A,A,A,A,A,A,A,_,_,_],
    [C,A,A,A,A,A,A,A,A,A,C,_],
    [C,_,_,A,A,A,A,A,_,_,C,_],
    [_,_,_,A,_,_,_,A,_,_,_,_],
    [_,_,_,A,A,_,A,A,_,_,_,_],
  ]
})()

// ─── CELESTIAL ZONE ──────────────────────────────────────────────────────────

/** Celestial Sentinel — Void Knight layout, golden knight palette */
const CELESTIAL_SENTINEL: Sprite = (() => {
  const B = '#282808', D = '#141404', E = '#ffd700', C = '#c8b820', S = '#b0a010', A = '#988808'
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

/** Starshard Construct — Magma Golem layout, crystal-white palette */
const STARSHARD_CONSTRUCT: Sprite = (() => {
  const S = '#2a3050', O = '#aaccff', Y = '#ffffff', L = '#404870'
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

/** Fallen Seraph — original: pale humanoid with tattered downward wings, wound glow */
const FALLEN_SERAPH: Sprite = (() => {
  const F = '#d0c0a0', W = '#8888cc', D = '#4444aa', G = '#ff4400', B = '#a09080', E = '#cc9920'
  return [
    [W,_,_,_,F,F,F,_,_,_,W,_],
    [W,W,_,F,F,F,F,F,_,W,W,_],
    [D,W,_,F,E,F,F,B,_,W,D,_],
    [_,D,W,F,F,F,F,F,W,D,_,_],
    [_,_,W,F,F,G,F,F,W,_,_,_],
    [_,_,W,F,F,F,F,F,W,_,_,_],
    [D,W,_,B,B,B,B,B,_,W,D,_],
    [W,_,_,B,B,B,B,B,_,_,W,_],
    [_,_,_,B,B,B,B,B,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
    [_,_,_,B,B,_,B,B,_,_,_,_],
  ]
})()

/** Astral Warden — Void Knight layout, stellar silver-blue palette */
const ASTRAL_WARDEN: Sprite = (() => {
  const B = '#1a1a30', D = '#0e0e18', E = '#8888ff', C = '#3038a0', S = '#2030a0', A = '#182088'
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

/** Divine Fury — Fire Elemental layout, divine gold palette */
const DIVINE_FURY: Sprite = (() => {
  const R = '#c09000', O = '#ffd700', Y = '#ffffaa', W = '#ffffff', D = '#806000'
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

/** Celestial Archon (boss) — original: majestic wide figure with halo, golden armor */
const CELESTIAL_ARCHON: Sprite = (() => {
  const G = '#ffd700', W = '#ffffff', A = '#c8c000', E = '#004488', B = '#806000', H = '#ffffcc'
  return [
    [_,W,W,W,W,W,W,W,W,W,_,_],
    [_,_,_,_,G,G,G,_,_,_,_,_],
    [_,_,_,G,G,A,G,G,_,_,_,_],
    [_,_,_,A,E,A,E,A,_,_,_,_],
    [_,_,_,A,A,A,A,A,_,_,_,_],
    [_,_,_,A,A,B,A,A,_,_,_,_],
    [_,W,_,G,G,G,G,G,_,W,_,_],
    [W,W,G,G,G,G,G,G,G,W,W,_],
    [H,_,_,G,G,G,G,G,_,_,H,_],
    [_,_,_,A,_,_,_,A,_,_,_,_],
    [_,_,_,A,A,_,A,A,_,_,_,_],
    [_,_,_,B,_,_,_,B,_,_,_,_],
  ]
})()

// ─── VOID ZONE ───────────────────────────────────────────────────────────────

/** Void Specter — Lich layout, void-cyan palette */
const VOID_SPECTER: Sprite = (() => {
  const P = '#082030', D = '#040f18', E = '#00eeff', C = '#80c0cc', R = '#0080a0', B = '#041018'
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

/** Nullborn — original: amorphous void blob, single eye, tentacle fringe */
const NULLBORN: Sprite = (() => {
  const B = '#040414', D = '#020208', E = '#00aaff', F = '#0a0a28', G = '#0055aa'
  return [
    [_,_,_,_,B,B,B,B,_,_,_,_],
    [_,_,_,B,B,B,B,B,B,_,_,_],
    [_,_,B,B,B,B,B,B,B,B,_,_],
    [_,_,B,B,G,E,G,B,B,B,_,_],
    [_,_,B,B,B,B,B,B,B,B,_,_],
    [_,_,B,B,B,D,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,B,B,B,B,_],
    [F,_,F,B,B,B,B,B,F,_,F,_],
    [F,_,_,F,B,B,B,F,_,_,F,_],
    [_,_,_,_,F,F,F,_,_,_,_,_],
  ]
})()

/** Oblivion Shade — Shadow Imp layout, near-black teal palette */
const OBLIVION_SHADE: Sprite = (() => {
  const B = '#030308', D = '#010104', E = '#00ffcc', H = '#003a28', W = '#040c0a'
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

/** Entropy Fiend — Demon Lord layout, void-blue palette */
const ENTROPY_FIEND: Sprite = (() => {
  const R = '#080430', D = '#030218', E = '#0055ff', H = '#1010a0'
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

/** Rift Terror — original: jagged energy diamond, crackling cyan void */
const RIFT_TERROR: Sprite = (() => {
  const O = '#080430', I = '#004488', G = '#00eeff', C = '#0088cc', D = '#002255'
  return [
    [_,_,_,_,_,G,_,_,_,_,_,_],
    [_,_,_,_,G,C,G,_,_,_,_,_],
    [_,_,_,G,C,I,C,G,_,_,_,_],
    [_,_,G,C,I,O,I,C,G,_,_,_],
    [_,G,C,I,O,D,O,I,C,G,_,_],
    [G,C,I,O,D,O,D,O,I,C,G,_],
    [_,G,C,I,O,D,O,I,C,G,_,_],
    [_,_,G,C,I,O,I,C,G,_,_,_],
    [_,_,_,G,C,I,C,G,_,_,_,_],
    [_,_,_,_,G,C,G,_,_,_,_,_],
    [_,_,_,_,_,G,_,_,_,_,_,_],
  ]
})()

/** The Unmaker (boss) — original: colossal void humanoid, blue eyes, spiked crown */
const THE_UNMAKER: Sprite = (() => {
  const B = '#020115', E = '#0044ff', S = '#0088ff', C = '#0022aa', T = '#001166'
  return [
    [_,_,S,_,_,_,_,_,S,_,_,_],
    [_,S,B,S,B,B,B,S,B,S,_,_],
    [S,B,B,B,B,B,B,B,B,B,S,_],
    [B,B,E,B,B,B,B,B,E,B,B,_],
    [B,B,B,B,B,B,B,B,B,B,B,_],
    [B,B,B,B,C,C,C,B,B,B,B,_],
    [B,C,C,C,C,C,C,C,C,C,B,_],
    [T,B,B,C,C,C,C,C,B,B,T,_],
    [T,B,_,C,C,C,C,C,_,B,T,_],
    [T,_,_,B,C,C,C,B,_,_,T,_],
    [_,_,_,T,B,_,B,T,_,_,_,_],
    [_,_,_,_,T,_,T,_,_,_,_,_],
    [_,_,_,T,_,_,_,T,_,_,_,_],
  ]
})()

// ─── NIGHTMARE ZONE ──────────────────────────────────────────────────────────

/** Nightmare Horror — Orc Berserker layout, nightmare-red palette */
const NIGHTMARE_HORROR: Sprite = (() => {
  const G = '#7a1010', D = '#3a0808', L = '#cc2020', E = '#ff4400', T = '#ee8800', X = '#606060'
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

/** Chaos Spawn — original: multi-limbed asymmetric chaos creature */
const CHAOS_SPAWN: Sprite = (() => {
  const B = '#2a0830', D = '#150418', E = '#ff4400', P = '#cc0088', S = '#440a60', F = '#880000'
  return [
    [_,_,E,_,_,_,_,_,_,_,_,_],
    [_,E,B,_,B,B,B,_,_,P,_,_],
    [_,_,S,B,B,B,B,B,_,P,P,_],
    [_,S,S,B,E,B,E,B,S,_,P,_],
    [_,S,B,B,B,B,B,B,B,S,_,_],
    [S,B,B,B,D,B,D,B,B,B,S,_],
    [_,_,B,F,B,B,B,F,B,_,_,_],
    [_,_,F,B,B,B,B,B,F,_,_,_],
    [_,F,_,B,B,B,B,B,_,P,_,_],
    [F,_,_,D,_,_,D,_,_,_,P,_],
    [_,_,_,_,_,_,_,_,_,_,_,_],
  ]
})()

/** Abyssal Nightmare — original: low wide beast, blood-red horns */
const ABYSSAL_NIGHTMARE: Sprite = (() => {
  const B = '#100408', D = '#060202', H = '#880000', E = '#ff0000', S = '#1e0808', F = '#3a0a0a'
  return [
    [_,H,_,_,_,_,_,_,_,H,_,_],
    [_,H,H,_,_,_,_,_,H,H,_,_],
    [_,_,H,B,B,B,B,B,H,_,_,_],
    [_,_,S,B,E,B,E,B,S,_,_,_],
    [_,S,S,B,B,B,B,B,S,S,_,_],
    [S,S,F,F,B,D,B,F,F,S,S,_],
    [S,F,F,F,F,F,F,F,F,F,S,_],
    [_,F,F,F,F,F,F,F,F,F,_,_],
    [_,_,F,F,_,_,_,F,F,_,_,_],
    [_,_,B,_,_,_,_,_,B,_,_,_],
  ]
})()

/** Dread Walker — Skeleton layout, nightmare bone palette */
const DREAD_WALKER: Sprite = (() => {
  const W = '#b04030', D = '#503020', E = '#201010', R = '#704028'
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

/** Soul Eater — Lich layout, blood-red palette */
const SOUL_EATER: Sprite = (() => {
  const P = '#5a1010', D = '#200808', E = '#ff2200', C = '#dd9988', R = '#aa4040', B = '#380808'
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

/** Eternal Nightmare (boss) — original: colossal nightmare mass, multi-face, crimson tendrils */
const ETERNAL_NIGHTMARE: Sprite = (() => {
  const B = '#1a0202', D = '#0a0101', E = '#ff0000', T = '#880000', S = '#440000', F = '#cc0000'
  return [
    [_,T,_,T,_,_,T,_,T,_,_,_],
    [T,B,T,B,B,B,B,B,T,B,T,_],
    [B,B,B,B,B,B,B,B,B,B,B,_],
    [B,E,B,B,D,B,D,B,B,E,B,_],
    [B,B,B,B,B,B,B,B,B,B,B,_],
    [B,B,F,B,E,B,E,B,F,B,B,_],
    [S,B,B,B,B,B,B,B,B,B,S,_],
    [S,T,B,T,B,B,B,T,B,T,S,_],
    [S,_,T,B,B,B,B,B,T,_,S,_],
    [_,_,_,T,B,B,B,T,_,_,_,_],
    [_,_,T,_,T,_,T,_,T,_,_,_],
    [_,T,_,_,_,_,_,_,_,T,_,_],
    [T,_,_,_,_,_,_,_,_,_,T,_],
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

  // Shadowrealm
  'Shadow Wraith':     SHADOW_WRAITH,
  'Soul Harvester':    SOUL_HARVESTER,
  'Dark Phantom':      DARK_PHANTOM,
  'Cursed Revenant':   CURSED_REVENANT,
  'Nightmare Stalker': NIGHTMARE_STALKER,
  'Dread Sovereign':   DREAD_SOVEREIGN,

  // Celestial
  'Celestial Sentinel':  CELESTIAL_SENTINEL,
  'Starshard Construct': STARSHARD_CONSTRUCT,
  'Fallen Seraph':       FALLEN_SERAPH,
  'Astral Warden':       ASTRAL_WARDEN,
  'Divine Fury':         DIVINE_FURY,
  'Celestial Archon':    CELESTIAL_ARCHON,

  // Void
  'Void Specter':   VOID_SPECTER,
  'Nullborn':       NULLBORN,
  'Oblivion Shade': OBLIVION_SHADE,
  'Entropy Fiend':  ENTROPY_FIEND,
  'Rift Terror':    RIFT_TERROR,
  'The Unmaker':    THE_UNMAKER,

  // Nightmare
  'Nightmare Horror':  NIGHTMARE_HORROR,
  'Chaos Spawn':       CHAOS_SPAWN,
  'Abyssal Nightmare': ABYSSAL_NIGHTMARE,
  'Dread Walker':      DREAD_WALKER,
  'Soul Eater':        SOUL_EATER,
  'Eternal Nightmare': ETERNAL_NIGHTMARE,
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
