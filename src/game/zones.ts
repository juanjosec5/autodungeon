import type { ZoneId } from '../types/index'

export const ZONE_META: Record<ZoneId, { label: string; icon: string; color: string }> = {
  forest:      { label: 'Forest',      icon: '🌲', color: '#3a7d44' },
  dungeon:     { label: 'Dungeon',     icon: '🪨', color: '#6b6b6b' },
  volcano:     { label: 'Volcano',     icon: '🌋', color: '#c0440a' },
  abyss:       { label: 'Abyss',       icon: '🌀', color: '#4a2080' },
  shadowrealm: { label: 'Shadowrealm', icon: '👁', color: '#3d3580' },
  celestial:   { label: 'Celestial',   icon: '✨', color: '#e8d48b' },
  void:        { label: 'Void',        icon: '🕳', color: '#4b0082' },
  nightmare:   { label: 'Nightmare',   icon: '💀', color: '#8b0000' },
}
