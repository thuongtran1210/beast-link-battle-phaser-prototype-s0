import { P1V11C_FIXTURE_A_FRONTLINE, P1V11C_FIXTURE_B_DIVERS, P1V11C_FIXTURE_C_PROTECTED_RANGED } from '../battle/AutonomousBattleModel';
import { runP1V13AChecks } from '../battle/P1V13AChecks';
import { GamePhase } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';
import { P1V14A_WAVES, WaveRunController } from './WaveRunController';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`P1-V14A check failed: ${m}`); };
export function runP1V14AChecks(): void {
  const run = new WaveRunController();
  expect(run.currentWaveIndex === 0 && run.totalWaves === 3, 'fresh run starts at Wave 1 of 3');
  expect(P1V14A_WAVES[0].enemyFixtures === P1V11C_FIXTURE_A_FRONTLINE || P1V14A_WAVES[0].enemyFixtures.length === 3, 'Wave 1 resolves Frontline Pressure');
  expect(P1V14A_WAVES[1].enemyFixtures.length === P1V11C_FIXTURE_B_DIVERS.length, 'Wave 2 resolves Backline Dive');
  expect(P1V14A_WAVES[2].enemyFixtures.length === P1V11C_FIXTURE_C_PROTECTED_RANGED.length, 'Wave 3 resolves Protected Ranged');
  const phase = new PhaseController();
  expect(phase.setPhase(GamePhase.EnergyRush) && phase.setPhase(GamePhase.BattleSetup) && phase.setPhase(GamePhase.Battle), 'normal preparation reaches battle');
  expect(phase.setPhase(GamePhase.WaveResult), 'non-final win enters WaveResult');
  expect(run.advanceWave() && run.currentWaveIndex === 1, 'continue advances exactly once to Wave 2');
  expect(phase.setPhase(GamePhase.BeastRush) && phase.phase === GamePhase.BeastRush, 'next wave begins BeastRush');
  run.advanceWave(); expect(run.isFinalWave, 'Wave 3 is final');
  expect(!run.advanceWave() && run.currentWaveIndex === 2, 'final wave cannot advance');
  run.resetRun(); expect(run.currentWaveIndex === 0 && run.currentWave.name === 'FRONTLINE WALL', 'restart resets Wave 1 without state leak');
  const lossPhase = new PhaseController(); lossPhase.setPhase(GamePhase.EnergyRush); lossPhase.setPhase(GamePhase.BattleSetup); lossPhase.setPhase(GamePhase.Battle);
  expect(lossPhase.setPhase(GamePhase.Result) && lossPhase.phase === GamePhase.Result && run.currentWaveIndex === 0, 'loss ends run without wave advancement');
  runP1V13AChecks();
}
