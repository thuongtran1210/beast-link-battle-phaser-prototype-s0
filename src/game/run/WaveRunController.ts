import type { EnemyFixture } from '../battle/AutonomousBattleModel';
import { fixturesForLevel, P1V13A1_LEVELS } from '../battle/ValidationLevels';

export interface WaveDefinition { id: string; index: number; name: string; threatLabel: string; enemyFixtures: ReadonlyArray<EnemyFixture>; }
export const P1V14A_WAVES: ReadonlyArray<WaveDefinition> = P1V13A1_LEVELS.slice(0, 3).map((level, index) => ({ id: `wave-${index + 1}`, index, name: level.name, threatLabel: level.threatLabel, enemyFixtures: fixturesForLevel(level) }));
export class WaveRunController {
  private waveIndex = 0;
  get currentWave(): WaveDefinition { return P1V14A_WAVES[this.waveIndex]; }
  get currentWaveIndex(): number { return this.waveIndex; }
  get totalWaves(): number { return P1V14A_WAVES.length; }
  get isFinalWave(): boolean { return this.waveIndex === P1V14A_WAVES.length - 1; }
  advanceWave(): boolean { if (this.isFinalWave) return false; this.waveIndex += 1; return true; }
  resetRun(): void { this.waveIndex = 0; }
}
