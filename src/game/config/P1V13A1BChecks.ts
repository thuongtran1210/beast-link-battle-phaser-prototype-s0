import { isTestHarness, runtimeModeFrom } from './RuntimeMode';
import { EnemyBoardState, P1V13A1_LEVELS, fixturesForLevel } from '../battle/ValidationLevels';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`P1-V13A.1B check failed: ${m}`); };
export function runP1V13A1BChecks(): void {
  expect(runtimeModeFrom(undefined) === 'Game', 'default startup is GAME');
  expect(isTestHarness(runtimeModeFrom('test')), 'test mode explicitly enables harness');
  expect(!isTestHarness(runtimeModeFrom('game')) && !isTestHarness(runtimeModeFrom('production')), 'GAME and unknown build labels hide composer');
  const testCopy = new EnemyBoardState(P1V13A1_LEVELS[0]); testCopy.place('Diver', 'Back', 6);
  expect(JSON.stringify(fixturesForLevel(P1V13A1_LEVELS[0])) !== JSON.stringify(testCopy.fixtures), 'test scenario is a mutable copy');
  expect(fixturesForLevel(P1V13A1_LEVELS[0]).length === 3, 'canonical level data remains unchanged');
}
