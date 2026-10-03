import type { EnemyArchetype, EnemyFixture } from './AutonomousBattleModel';

export interface EnemySpawnDefinition { unitId: string; archetype: EnemyArchetype; row: 'Front' | 'Mid' | 'Back'; lane: number; }
export interface ValidationLevelDefinition { id: string; name: string; description: string; threatLabel: string; enemyUnits: ReadonlyArray<EnemySpawnDefinition>; }
export interface ArchetypeVisualModel { iconId: string; shortLabel: string; behaviorSummary: string; silhouette: 'broad' | 'sharp' | 'narrow'; }
export const ENEMY_ARCHETYPE_VISUALS: Readonly<Record<EnemyArchetype, ArchetypeVisualModel>> = {
  Frontliner: { iconId: 'shield', shortLabel: 'FRONT', silhouette: 'broad', behaviorSummary: 'Advances into the frontline. Naturally engages Tanks.' },
  Diver: { iconId: 'dagger', shortLabel: 'DIVER', silhouette: 'sharp', behaviorSummary: 'Targets deep Ranger/Mage units. Local Tank coverage can intercept it.' },
  Ranged: { iconId: 'bow', shortLabel: 'RANGED', silhouette: 'narrow', behaviorSummary: 'Holds distance behind frontline and attacks from range.' },
};
const units = (items: Array<[EnemyArchetype, 'Front' | 'Mid' | 'Back', number]>) => items.map(([archetype, row, lane], i) => ({ unitId: `enemy-${i + 1}`, archetype, row, lane }));
export const P1V13A1_LEVELS: ReadonlyArray<ValidationLevelDefinition> = [
  { id: 'level-1', name: 'FRONTLINE WALL', description: 'Test Tank interception and protected Ranger uptime.', threatLabel: 'FRONTLINE PRESSURE', enemyUnits: units([['Frontliner', 'Front', 2], ['Frontliner', 'Front', 3], ['Frontliner', 'Front', 4]]) },
  { id: 'level-2', name: 'BACKLINE HUNT', description: 'Test Diver pressure and local Tank protection.', threatLabel: 'BACKLINE DIVE', enemyUnits: units([['Frontliner', 'Front', 3], ['Diver', 'Front', 2], ['Diver', 'Front', 4]]) },
  { id: 'level-3', name: 'PROTECTED BATTERY', description: 'Test Assassin access to protected ranged targets.', threatLabel: 'PROTECTED RANGED', enemyUnits: units([['Frontliner', 'Front', 3], ['Frontliner', 'Front', 4], ['Ranged', 'Back', 3], ['Ranged', 'Back', 4]]) },
  { id: 'level-4', name: 'MIXED THREAT', description: 'Observe the full squad against separated pressures.', threatLabel: 'MIXED PRESSURE', enemyUnits: units([['Frontliner', 'Front', 2], ['Diver', 'Front', 4], ['Ranged', 'Back', 5]]) },
];
const stats: Record<EnemyArchetype, { maxHp: number; damage: number }> = { Frontliner: { maxHp: 180, damage: 10 }, Diver: { maxHp: 120, damage: 12 }, Ranged: { maxHp: 100, damage: 11 } };
export function fixturesForLevel(level: ValidationLevelDefinition): EnemyFixture[] { return level.enemyUnits.map((unit) => ({ enemyId: unit.unitId, slotId: `enemy-${unit.row.toLowerCase()}-${unit.lane}`, row: unit.row, column: unit.lane, archetype: unit.archetype, ...stats[unit.archetype] })); }
export class EnemyBoardState {
  private enemies: EnemyFixture[];
  private custom = false;
  constructor(private readonly level: ValidationLevelDefinition) { this.enemies = fixturesForLevel(level); }
  get isCustomized(): boolean { return this.custom; }
  get fixtures(): ReadonlyArray<EnemyFixture> { return this.enemies.map((e) => ({ ...e })); }
  place(archetype: EnemyArchetype, row: 'Front' | 'Mid' | 'Back', lane: number): boolean { if (lane < 1 || lane > 6 || this.enemies.length >= 6 || this.enemies.some((e) => e.row === row && e.column === lane)) return false; const s = stats[archetype]; this.enemies.push({ enemyId: `custom-${this.enemies.length + 1}`, slotId: `enemy-${row.toLowerCase()}-${lane}`, row, column: lane, archetype, ...s }); this.custom = true; return true; }
  erase(row: 'Front' | 'Mid' | 'Back', lane: number): boolean { const index = this.enemies.findIndex((e) => e.row === row && e.column === lane); if (index < 0) return false; this.enemies.splice(index, 1); this.custom = true; return true; }
  reset(): void { this.enemies = fixturesForLevel(this.level); this.custom = false; }
}
