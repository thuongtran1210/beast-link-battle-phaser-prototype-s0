import { RUN_LEVELS, selectRunLevel, selectedRunLevel, wavesForRunLevel } from './RunLevels';
import { WaveRunController, P1V14A_WAVES } from './WaveRunController';

export function runLevelChecks(): void {
  const expect = (ok: boolean, label: string) => { if (!ok) throw new Error(`Run level: ${label}`); };
  for (const level of RUN_LEVELS) {
    selectRunLevel(level.id);
    expect(selectedRunLevel().id === level.id, 'selection is applied');
    const waves = wavesForRunLevel(level.id);
    const run = new WaveRunController(waves, level.id);
    expect(run.totalWaves === 3 && run.currentWaveIndex === 0, 'each region starts a three-wave Run');
    for (let i = 0; i < 3; i++) {
      expect(run.currentWave.id === `${level.id}-wave-${i + 1}` && run.currentWave.enemyFixtures.length > 0, 'correct regional encounter');
      expect(run.advanceWave() === (i < 2), 'advance respects final Wave');
    }
    run.resetRun(); expect(run.currentWaveIndex === 0 && run.levelId === level.id, 'restart retains chosen region');
    const copy = wavesForRunLevel(level.id); copy[0].enemyFixtures[0].maxHp = 1;
    expect(wavesForRunLevel(level.id)[0].enemyFixtures[0].maxHp !== 1, 'fixture instances are isolated');
  }
  let rejected = false; try { selectRunLevel('invalid'); } catch { rejected = true; }
  expect(rejected, 'invalid selection rejected');
  expect(new WaveRunController().currentWave === P1V14A_WAVES[0], 'default harness remains unchanged');
  selectRunLevel('woodland');
}
