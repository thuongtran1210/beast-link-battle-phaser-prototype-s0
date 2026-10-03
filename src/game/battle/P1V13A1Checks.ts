import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { ENEMY_ARCHETYPE_VISUALS, EnemyBoardState, P1V13A1_LEVELS, fixturesForLevel } from './ValidationLevels';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`P1-V13A.1 check failed: ${m}`); };
export function runP1V13A1Checks(): void {
  const ids = new Set(P1V13A1_LEVELS.map((l) => l.id)); expect(ids.size === 4, 'four unique level IDs');
  for (const level of P1V13A1_LEVELS) { const slots = new Set(level.enemyUnits.map((u) => `${u.row}-${u.lane}`)); expect(slots.size === level.enemyUnits.length && level.enemyUnits.every((u) => u.lane >= 1 && u.lane <= 6), `${level.id} has valid unique slots`); }
  const level2 = new EnemyBoardState(P1V13A1_LEVELS[1]); expect(level2.fixtures.filter((e) => e.archetype === 'Diver').length === 2, 'Level 2 loads two Divers'); expect(level2.place('Ranged', 'Back', 6), 'custom place works'); expect(!level2.place('Diver', 'Back', 6), 'duplicate slot rejected'); expect(level2.erase('Back', 6), 'custom erase works'); level2.place('Diver', 'Mid', 1); const f = new BattleFormation([{ contentId: 'beast-a', star: 1 }]); f.place('unit-1', 'front-3'); const model = new AutonomousBattleModel(f, level2.fixtures, P1V13A_SIGNATURE_RULES); expect(model.snapshot.enemies.some((e) => e.row === 'Mid' && e.column === 1 && e.archetype === 'Diver'), 'custom board drives battle model'); level2.reset(); expect(JSON.stringify(level2.fixtures) === JSON.stringify(fixturesForLevel(P1V13A1_LEVELS[1])), 'level reset restores preset');
  expect(new Set(Object.values(ENEMY_ARCHETYPE_VISUALS).map((v) => v.iconId)).size === 3, 'archetypes expose distinct icons');
}
