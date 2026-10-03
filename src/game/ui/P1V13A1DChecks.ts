import { BattleFormation } from '../battle/BattleFormation';
import { P1V13A1_LEVELS, fixturesForLevel } from '../battle/ValidationLevels';
import { isTestHarness, runtimeModeFrom } from '../config/RuntimeMode';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`P1-V13A.1D check failed: ${m}`); };
export function runP1V13A1DChecks(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }]);
  const dock = () => formation.units.filter((u) => u.slotId === null);
  expect(dock().length === 2 && !formation.allPlaced, 'dock and start gate derive from formation');
  expect(formation.place('unit-1', 'front-3'), 'drag-equivalent placement succeeds');
  expect(dock().length === 1 && formation.getSlot('front-3')?.unitId === 'unit-1', 'deployed unit leaves dock and occupies exactly one slot');
  expect(formation.place('unit-1', 'mid-3'), 'reposition succeeds');
  expect(dock().length === 1 && formation.slots.filter((s) => s.unitId === 'unit-1').length === 1, 'reposition never duplicates');
  expect(formation.unplace('unit-1') && dock().length === 2, 'return to bench restores dock once');
  expect(!isTestHarness(runtimeModeFrom('game')), 'GAME enemy board is read-only by mode boundary');
  const level = P1V13A1_LEVELS[1]; const fixtures = fixturesForLevel(level);
  expect(fixtures.length === 3 && fixtures.some((e) => e.slotId === 'enemy-front-2'), 'level preview has exact deployment slots');
}
