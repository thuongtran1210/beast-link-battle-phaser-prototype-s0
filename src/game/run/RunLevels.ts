import { fixturesForLevel, P1V13A1_LEVELS } from '../battle/ValidationLevels';
import type { WaveDefinition } from './WaveRunController';

export const RUN_LEVELS = [
  { id: 'woodland', name: 'Woodland Trail', label: '01', theme: 'Learn the formation', description: 'Frontline → Divers → Protected ranged', encounters: [0, 1, 2], portrait: '/assets/characters/deer-archer/icon_v02.png' },
  { id: 'shadow', name: 'Shadow Crossing', label: '02', theme: 'Protect your backline', description: 'Divers → Mixed pressure → Protected ranged', encounters: [1, 3, 2], portrait: '/assets/characters/crow-assassin/icon_v02.png' },
  { id: 'stronghold', name: 'Beast Stronghold', label: '03', theme: 'Break the enemy formation', description: 'Protected ranged → Mixed pressure → Frontline', encounters: [2, 3, 0], portrait: '/assets/characters/penguin-knight/icon_v02.png' },
] as const;
export type RunLevelId = typeof RUN_LEVELS[number]['id'];
let selected: RunLevelId = 'woodland';
export function selectRunLevel(id: string): void {
  if (!RUN_LEVELS.some(level => level.id === id)) throw new Error('Unknown Run level');
  selected = id as RunLevelId;
}
export function selectedRunLevel() { return RUN_LEVELS.find(level => level.id === selected)!; }
export function wavesForRunLevel(id: RunLevelId): WaveDefinition[] {
  const level = RUN_LEVELS.find(item => item.id === id);
  if (!level) throw new Error('Unknown Run level');
  return level.encounters.map((encounter, index) => {
    const source = P1V13A1_LEVELS[encounter];
    return { id: `${id}-wave-${index + 1}`, index, name: source.name, threatLabel: source.threatLabel, enemyFixtures: fixturesForLevel(source) };
  });
}
export function completedRunLevels(): string[] {
  try { const saved: unknown = JSON.parse(localStorage.getItem('beast-link-levels-v1') ?? '[]'); return Array.isArray(saved) ? saved.filter(id => RUN_LEVELS.some(level => level.id === id)) : []; }
  catch { return []; }
}
export function markRunLevelComplete(id: string): void {
  if (!RUN_LEVELS.some(level => level.id === id)) return;
  try { localStorage.setItem('beast-link-levels-v1', JSON.stringify([...new Set([...completedRunLevels(), id])])); } catch { /* Progress storage is optional. */ }
}
