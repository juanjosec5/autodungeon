import { buildSpriteStyle } from './sprites'
import type { Sprite } from './sprites'

const _ = null

// ─── Base shape helpers ───────────────────────────────────────────────────────

/** Diagonal sword: tip at top-right, blade → guard → hilt */
function sword(B: string, H: string, G: string, P: string): Sprite {
  return [
    [_,_,_,_,_,_,_,B],
    [_,_,_,_,_,_,B,H],
    [_,_,_,_,_,B,H,_],
    [_,_,_,_,B,H,_,_],
    [_,_,_,B,H,_,_,_],
    [_,_,G,G,_,_,_,_],
    [_,_,H,_,_,_,_,_],
    [_,H,_,_,_,_,_,_],
    [H,_,_,_,_,_,_,_],
    [P,_,_,_,_,_,_,_],
  ]
}

/** Two-wide sword blade */
function wideSword(B: string, H: string, G: string, P: string): Sprite {
  return [
    [_,_,_,_,_,_,B,B],
    [_,_,_,_,_,B,B,H],
    [_,_,_,_,B,B,H,_],
    [_,_,_,B,B,H,_,_],
    [_,_,B,B,H,_,_,_],
    [_,G,G,G,_,_,_,_],
    [_,_,H,H,_,_,_,_],
    [_,_,H,_,_,_,_,_],
    [_,H,_,_,_,_,_,_],
    [P,_,_,_,_,_,_,_],
  ]
}

/** Short dagger */
function dagger(B: string, G: string, H: string): Sprite {
  return [
    [_,_,_,_,_,_,B,_],
    [_,_,_,_,_,B,H,_],
    [_,_,_,_,B,H,_,_],
    [_,_,_,B,H,_,_,_],
    [_,_,G,G,_,_,_,_],
    [_,_,H,_,_,_,_,_],
    [_,H,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Two parallel daggers */
function twinDaggers(B: string, G: string, H: string): Sprite {
  return [
    [_,_,_,B,_,_,B,_],
    [_,_,B,H,_,B,H,_],
    [_,B,H,_,B,H,_,_],
    [_,G,_,_,G,_,_,_],
    [H,_,_,H,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Curved scythe blade */
function scythe(B: string, H: string, G: string): Sprite {
  return [
    [_,_,_,_,B,B,B,_],
    [_,_,_,B,B,_,B,B],
    [_,_,_,B,B,_,_,_],
    [_,_,_,B,B,_,_,_],
    [_,_,_,G,_,_,_,_],
    [_,_,H,_,_,_,_,_],
    [_,H,_,_,_,_,_,_],
    [H,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Dual crescents (phantom blades) */
function phantomBlades(B: string, D: string): Sprite {
  return [
    [_,_,B,_,_,B,_,_],
    [_,B,B,_,B,B,_,_],
    [B,B,_,_,_,B,B,_],
    [B,_,_,_,_,_,B,_],
    [B,B,_,_,_,B,B,_],
    [_,B,D,_,D,B,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** T-head hammer */
function hammer(H: string, S: string): Sprite {
  return [
    [_,_,H,H,H,H,H,_],
    [_,_,H,H,H,H,H,_],
    [_,_,_,H,H,H,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,S,S,S,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Crescent axe head */
function axe(A: string, S: string, E: string): Sprite {
  return [
    [_,_,_,A,A,A,_,_],
    [_,_,A,A,A,A,A,_],
    [_,A,A,A,A,A,_,_],
    [_,_,A,A,A,E,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,S,S,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Massive gauntlet/fist weapon */
function gauntlet(B: string, D: string, K: string): Sprite {
  return [
    [_,_,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,_],
    [_,B,D,B,B,D,B,_],
    [_,B,B,B,B,B,B,_],
    [_,_,B,B,B,B,_,_],
    [_,_,K,K,K,K,_,_],
    [_,_,B,_,_,B,_,_],
    [_,_,B,_,_,B,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Vertical staff with nodes */
function staff(T: string, S: string, N: string): Sprite {
  return [
    [_,_,_,T,T,_,_,_],
    [_,_,T,T,T,T,_,_],
    [_,_,_,T,T,_,_,_],
    [_,_,_,S,_,_,_,_],
    [_,_,N,S,N,_,_,_],
    [_,_,_,S,_,_,_,_],
    [_,_,_,S,_,_,_,_],
    [_,_,N,S,N,_,_,_],
    [_,_,_,S,_,_,_,_],
    [_,_,_,S,_,_,_,_],
  ]
}

/** Wand with glowing orb */
function wand(O: string, G: string, W: string): Sprite {
  return [
    [_,_,_,_,O,_,_,_],
    [_,_,_,O,G,O,_,_],
    [_,_,_,_,O,_,_,_],
    [_,_,_,_,W,_,_,_],
    [_,_,_,_,W,_,_,_],
    [_,_,_,_,W,_,_,_],
    [_,_,_,_,W,_,_,_],
    [_,_,_,W,W,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Dark tome / spellbook */
function tome(C: string, P: string, G: string): Sprite {
  return [
    [_,_,C,C,C,C,C,_],
    [_,_,C,P,P,P,C,_],
    [_,_,C,P,G,P,C,_],
    [_,_,C,P,G,P,C,_],
    [_,_,C,P,G,P,C,_],
    [_,_,C,P,P,P,C,_],
    [_,_,C,C,C,C,C,_],
    [_,C,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Heater shield */
function shield(S: string, E: string): Sprite {
  return [
    [_,_,S,S,S,S,S,_],
    [_,S,S,S,S,S,S,S],
    [_,S,S,E,E,S,S,S],
    [_,S,S,E,E,S,S,S],
    [_,S,S,S,S,S,S,S],
    [_,_,S,S,S,S,S,_],
    [_,_,_,S,S,S,_,_],
    [_,_,_,_,S,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Body armor / breastplate */
function bodyArmor(B: string, D: string, H: string): Sprite {
  return [
    [_,_,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,_],
    [_,B,D,B,B,D,B,_],
    [_,B,B,B,B,B,B,_],
    [_,B,H,B,B,H,B,_],
    [_,B,B,B,B,B,B,_],
    [_,_,B,B,B,B,_,_],
    [_,_,B,_,_,B,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Chain armor (ring pattern) */
function chainArmor(C: string, R: string): Sprite {
  return [
    [_,_,C,C,C,C,_,_],
    [_,C,R,C,R,C,C,_],
    [_,C,C,C,C,C,C,_],
    [_,C,R,C,R,C,C,_],
    [_,C,C,C,C,C,C,_],
    [_,C,R,C,R,C,C,_],
    [_,C,C,C,C,C,C,_],
    [_,_,C,C,C,C,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Flowing robe */
function robe(B: string, D: string, T: string): Sprite {
  return [
    [_,_,_,B,B,_,_,_],
    [_,_,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,_],
    [_,B,B,_,_,B,B,_],
    [_,B,D,_,_,D,B,_],
    [_,B,B,_,_,B,B,_],
    [T,B,B,_,_,B,B,T],
    [T,B,_,_,_,_,B,T],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Flowing cloak */
function cloak(B: string, D: string): Sprite {
  return [
    [_,_,B,B,B,B,_,_],
    [_,B,B,B,B,B,_,_],
    [_,B,B,B,B,_,_,_],
    [_,B,B,D,_,_,_,_],
    [_,B,B,_,_,_,_,_],
    [_,B,D,_,_,_,_,_],
    [B,B,_,_,_,_,_,_],
    [B,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

/** Torn leather pieces */
function leatherScraps(): Sprite {
  const B = '#8b6914', D = '#6a4a10', T = '#a07820'
  return [
    [_,_,B,B,_,_,_,_],
    [_,B,B,B,B,_,_,_],
    [B,B,D,B,B,B,_,_],
    [B,B,B,B,B,B,_,_],
    [_,B,B,T,B,_,_,_],
    [_,B,B,B,_,_,_,_],
    [_,_,B,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_],
  ]
}

// ─── Item sprite registry ─────────────────────────────────────────────────────

const ITEM_SPRITES: Record<string, Sprite> = {
  // ── Common weapons ──
  'rusty-sword':    sword('#888060', '#666040', '#785830', '#4a3010'),
  'club':           hammer('#7a5520', '#4a3010'),
  'shiv':           dagger('#b0b0a0', '#807868', '#4a3820'),
  'hunting-knife':  dagger('#c8b880', '#988860', '#5a3820'),
  'crooked-staff':  staff('#c0a030', '#8b6914', '#6a4a10'),
  'apprentice-wand':wand('#c0c0d8', '#9090cc', '#6a4820'),

  // ── Uncommon weapons ──
  'iron-sword':     sword('#d0d0d8', '#a0a0a8', '#909090', '#303030'),
  'war-hammer':     hammer('#909090', '#604020'),
  'bone-dagger':    dagger('#e8e0c0', '#b0a880', '#8a7858'),
  'twin-daggers':   twinDaggers('#c0c0c8', '#909090', '#303030'),
  'steel-dagger':   dagger('#c0c8d8', '#9098a8', '#303040'),
  'throwing-knives':twinDaggers('#d0c0a0', '#9a8860', '#504030'),
  'ember-rod':      wand('#ff6600', '#cc2200', '#8b4010'),
  'arcane-wand':    wand('#8888ff', '#6060cc', '#303060'),
  'battle-staff':   staff('#b04040', '#802020', '#ff9090'),

  // ── Rare weapons ──
  'broad-sword':      wideSword('#c8c8d0', '#a0a0b0', '#c0a030', '#404048'),
  'battle-axe':       axe('#c0c0c0', '#604020', '#e0e0e8'),
  'executioners-axe': axe('#808080', '#502010', '#cc2222'),
  'venomblade':       dagger('#40cc40', '#208020', '#103010'),
  'cursed-blade':     dagger('#9030c0', '#601880', '#280850'),
  'spirit-blade':     dagger('#40d080', '#208050', '#0a2818'),
  'shadowstep-blade': dagger('#a060ff', '#6030b0', '#1e0848'),
  'spellbreaker':     staff('#a0a0a0', '#606060', '#ff4400'),
  'crystal-staff':    staff('#80e0ff', '#40b0e0', '#ffffff'),
  'lightning-rod':    staff('#ffe040', '#c0a820', '#8080ff'),

  // ── Epic weapons ──
  'shadowblade':    sword('#8030c0', '#501880', '#301050', '#180828'),
  'storm-cleaver':  wideSword('#40c8ff', '#2090d0', '#60b0ff', '#104080'),
  'berserker-axe':  axe('#cc4400', '#6a2200', '#ff8800'),
  'deathwhisper':   dagger('#0a0818', '#4040a0', '#c0c0ff'),
  'soul-reaper':    scythe('#303050', '#181828', '#8888ff'),
  'wraith-dagger':  dagger('#20a0b0', '#105860', '#041820'),
  'voidstaff':      staff('#18003a', '#300060', '#8800ff'),
  'arcane-surge':   staff('#ffee00', '#b0aa00', '#80ff00'),

  // ── Legendary weapons ──
  'void-edge':      wideSword('#4400cc', '#220088', '#8800ff', '#110044'),
  'godslayer':      wideSword('#ffd700', '#c89800', '#cc4400', '#8b0000'),
  'titans-fist':    gauntlet('#404058', '#606088', '#1a1830'),
  'shadowdancer':   phantomBlades('#8040c0', '#401880'),
  'wraithfang':     dagger('#40e0ff', '#10a0c0', '#083048'),
  'phantom-blades': phantomBlades('#c0c0ff', '#6060b0'),
  'celestial-tome': tome('#002244', '#003388', '#00ddff'),
  'eternum':        staff('#ffd700', '#cc8800', '#ff8800'),
  'abyssal-tome':   tome('#0a0520', '#1a1045', '#aa22ff'),

  // ── Common armor ──
  'leather-scraps': leatherScraps(),
  'worn-tunic':     bodyArmor('#5a4030', '#3a2820', '#7a5840'),

  // ── Uncommon armor ──
  'chainmail':      chainArmor('#909098', '#c0c0c8'),
  'padded-armor':   bodyArmor('#806040', '#604030', '#a08060'),
  'linen-robe':     robe('#c8b898', '#a09878', '#e0d0b8'),
  'iron-shield':    shield('#909090', '#d0d0d8'),
  'shadow-cloak':   cloak('#2a2040', '#181028'),
  'mage-robes':     robe('#304090', '#2030a0', '#6080ff'),

  // ── Rare armor ──
  'plate-armor':    bodyArmor('#808090', '#505060', '#c0c0c8'),
  'bone-plate':     bodyArmor('#d0c8a0', '#a8a080', '#e8e8d0'),
  'assassins-garb': bodyArmor('#1a1828', '#0e0c18', '#383448'),
  'scale-mail':     chainArmor('#507060', '#80a890'),
  'arcane-vestment':robe('#304898', '#204098', '#6090e8'),
  'cursed-vestments':robe('#301048', '#200838', '#9040c0'),

  // ── Epic armor ──
  'dragonscale-mail': bodyArmor('#305040', '#1e3428', '#50c070'),
  'thornmail':      bodyArmor('#2a5020', '#183010', '#60d050'),
  'blood-plate':    bodyArmor('#580808', '#3a0404', '#cc1818'),
  'phantom-shroud': cloak('#2a1850', '#140c30'),
  'shadow-veil':    cloak('#080610', '#040308'),
  'starweave-robe': robe('#080838', '#0c0c60', '#6060ff'),
  'arcane-barrier': robe('#0a1848', '#060e30', '#00aaff'),

  // ── Legendary armor ──
  'aegis-of-eternity':  shield('#7878a0', '#ffd700'),
  'voidweave-shroud':   cloak('#06030f', '#030108'),
  'archmages-mantle':   robe('#1a0035', '#110022', '#aa00ff'),
  'abyssal-plate':      bodyArmor('#080618', '#04030c', '#6600cc'),
  'void-shroud':        cloak('#020108', '#010104'),
  'rift-mantle':        robe('#020118', '#01010c', '#00ffaa'),

  // ── Shadowrealm weapons (epic) ──
  'dread-axe':          axe('#2a1a3a', '#1a0a28', '#6a40a0'),
  'shadow-knives':      twinDaggers('#3a2850', '#1a1030', '#8050c0'),
  'dusk-staff':         staff('#4a2870', '#2a1848', '#a060ff'),

  // ── Shadowrealm armor (epic) ──
  'shadow-plate':       bodyArmor('#1e1428', '#120c1c', '#4a3060'),
  'dread-shroud':       cloak('#2a1840', '#1a1030'),
  'cursed-mantle':      robe('#1a0a30', '#100618', '#6020a0'),

  // ── Shadowrealm BiS legendaries ──
  'shade-reaper':           axe('#0a0515', '#050208', '#c850ff'),
  'twilight-fang':          twinDaggers('#1a0525', '#0e0218', '#9030e0'),
  'grimoire-of-dread':      tome('#1a0830', '#0e0420', '#8800cc'),
  'shadowplate-fortress':   bodyArmor('#14101e', '#0a0812', '#5030a0'),
  'dread-stalker-veil':     cloak('#201535', '#100a20'),
  'shadow-weave-mantle':    robe('#12081e', '#0a0514', '#6030b0'),

  // ── Celestial weapons (epic) ──
  'holy-cleaver':       axe('#f0c040', '#c08020', '#ffffff'),
  'celestial-blades':   twinDaggers('#e0d080', '#c0a840', '#ffffff'),
  'star-wand':          wand('#ffffcc', '#ffd700', '#c0c0ff'),

  // ── Celestial armor (epic) ──
  'astral-plate':       bodyArmor('#c0c8e0', '#9098b0', '#ffd700'),
  'celestial-shroud':   cloak('#c0c8f0', '#9098c0'),
  'divine-robe':        robe('#e0d8f0', '#c0b8d8', '#ffd700'),

  // ── Celestial BiS legendaries ──
  'sunblade-divine':    wideSword('#ffd700', '#c09000', '#ffffff', '#806000'),
  'starburst-knives':   twinDaggers('#ffeea0', '#ffd040', '#ffffff'),
  'astral-codex':       tome('#000840', '#000060', '#ffd700'),
  'celestial-aegis':    shield('#ffd700', '#ffffff'),
  'starlight-veil':     cloak('#e8e0c0', '#c0b880'),
  'cosmic-mantle':      robe('#080828', '#04041c', '#ffd700'),

  // ── Void weapons (epic) ──
  'void-cleaver':       axe('#080428', '#040214', '#00eeff'),
  'null-daggers':       twinDaggers('#060420', '#030210', '#00ccff'),
  'rift-staff':         staff('#0a0530', '#050218', '#00eeff'),

  // ── Void armor (epic) ──
  'void-plate':         bodyArmor('#060418', '#03020c', '#004488'),
  'null-shroud':        cloak('#080630', '#040318'),
  'rift-vestment':      robe('#040220', '#020110', '#0044ff'),

  // ── Void BiS legendaries ──
  'null-executioner':   axe('#020110', '#01000a', '#00ffff'),
  'void-piercer':       twinDaggers('#030118', '#01000c', '#00ddff'),
  'entropy-grimoire':   tome('#020115', '#010010', '#0066ff'),
  'nullshield':         shield('#040310', '#00eeff'),
  'void-wraith-cloak':  cloak('#060430', '#030218'),
  'entropy-mantle':     robe('#030110', '#010008', '#00aaff'),

  // ── Nightmare weapons (epic) ──
  'horror-blade':       wideSword('#3a0808', '#200404', '#cc0000', '#8a0000'),
  'nightmare-blades':   twinDaggers('#2a0808', '#180404', '#cc1818'),
  'dread-tome':         tome('#1e0404', '#140202', '#cc0000'),

  // ── Nightmare armor (epic) ──
  'nightmare-plate':    bodyArmor('#1a0404', '#100202', '#660000'),
  'dread-wraith':       cloak('#2a0808', '#180404'),
  'horror-vestment':    robe('#160404', '#0e0202', '#aa0000'),

  // ── Nightmare BiS legendaries ──
  'apocalypse-blade':       wideSword('#2a0606', '#180303', '#ff0000', '#990000'),
  'nightmare-fang':         twinDaggers('#1a0303', '#0f0101', '#ee0000'),
  'tome-of-infinite-dread': tome('#160303', '#0a0101', '#dd0000'),
  'eternal-fortress':       bodyArmor('#120303', '#080101', '#550000'),
  'nightmare-wraith':       cloak('#220606', '#100303'),
  'dreamweavers-mantle':    robe('#120303', '#080101', '#990000'),
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getItemSpriteStyle(itemId: string, px = 3): string {
  const sprite = ITEM_SPRITES[itemId]
  if (!sprite) return ''
  return buildSpriteStyle(sprite, px)
}
