import {
  type EnemyFixture,
  type EnemyArchetype,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V11C_FIXTURE_B_DIVERS,
  P1V11C_FIXTURE_C_PROTECTED_RANGED,
} from './AutonomousBattleModel';
import { EnemyBoardState, fixturesForLevel, P1V13A1_LEVELS } from './ValidationLevels';
import { isTestHarness } from '../config/RuntimeMode';
import {
  V11D_PRESETS,
  applyFormationPreset,
  compareFormationRuns,
  type FormationValidationMetrics,
  type FormationRunDelta,
} from './FormationValidationHarness';
import type { BattleFormation } from './BattleFormation';

export interface EnemyFixturePreset {
  id: string;
  name: string;
  tag: string;
  threatType: string;
  presetKey: 'frontline-pressure' | 'backline-dive' | 'protected-ranged';
  fixtures: ReadonlyArray<EnemyFixture>;
}

export const ENEMY_FIXTURE_PRESETS: ReadonlyArray<EnemyFixturePreset> = [
  {
    id: 'frontline-pressure',
    name: 'Frontline Pressure',
    tag: '3x Front',
    threatType: 'FRONTLINE PRESSURE',
    presetKey: 'frontline-pressure',
    fixtures: P1V11C_FIXTURE_A_FRONTLINE,
  },
  {
    id: 'backline-dive',
    name: 'Backline Dive',
    tag: '1 Front, 2 Diver',
    threatType: 'BACKLINE DIVE',
    presetKey: 'backline-dive',
    fixtures: P1V11C_FIXTURE_B_DIVERS,
  },
  {
    id: 'protected-ranged',
    name: 'Protected Ranged',
    tag: '2 Front, 2 Ranged',
    threatType: 'PROTECTED RANGED',
    presetKey: 'protected-ranged',
    fixtures: P1V11C_FIXTURE_C_PROTECTED_RANGED,
  },
  {
    id: 'mixed-threat',
    name: 'Mixed Threat',
    tag: '1 Front, 1 Diver, 1 Ranged',
    threatType: 'MIXED PRESSURE',
    presetKey: 'frontline-pressure',
    fixtures: fixturesForLevel(P1V13A1_LEVELS[3]),
  },
];

export class BattleFixtureManager {
  private enemyFixturePresetIndex = 0;
  private enemyBoard?: EnemyBoardState;
  private activePresetKey?: 'A' | 'B';
  private readonly fixtureRunHistory = new Map<
    string,
    { runA?: FormationValidationMetrics; runB?: FormationValidationMetrics }
  >();

  get presetIndex(): number {
    return this.enemyFixturePresetIndex;
  }

  get activePreset(): EnemyFixturePreset {
    return ENEMY_FIXTURE_PRESETS[this.enemyFixturePresetIndex];
  }

  get activeKey(): 'A' | 'B' | undefined {
    return this.activePresetKey;
  }

  clearActiveKey(): void {
    this.activePresetKey = undefined;
  }

  get board(): EnemyBoardState | undefined {
    return this.enemyBoard;
  }

  initBoardForWave(waveIndex: number): void {
    this.enemyBoard = isTestHarness() ? new EnemyBoardState(P1V13A1_LEVELS[waveIndex]) : undefined;
  }

  ensureBoard(): void {
    if (isTestHarness() && !this.enemyBoard) {
      this.enemyBoard = new EnemyBoardState(P1V13A1_LEVELS[this.enemyFixturePresetIndex]);
    }
  }

  setPresetIndex(index: number): void {
    this.enemyFixturePresetIndex =
      ((index % ENEMY_FIXTURE_PRESETS.length) + ENEMY_FIXTURE_PRESETS.length) %
      ENEMY_FIXTURE_PRESETS.length;
    if (isTestHarness()) {
      this.enemyBoard = new EnemyBoardState(P1V13A1_LEVELS[this.enemyFixturePresetIndex]);
    }
  }

  cyclePreset(): void {
    this.setPresetIndex(this.enemyFixturePresetIndex + 1);
  }

  loadFormationPreset(formation: BattleFormation, key: 'A' | 'B'): boolean {
    const activeFixture = this.activePreset;
    const presets = V11D_PRESETS[activeFixture.presetKey];
    if (!presets) return false;
    const preset = key === 'A' ? presets.presetA : presets.presetB;
    applyFormationPreset(formation, preset);
    this.activePresetKey = key;
    return true;
  }

  editEnemyBoard(tool: EnemyArchetype | 'Erase', row: 'Front' | 'Mid' | 'Back', column: number): boolean {
    if (!isTestHarness() || !this.enemyBoard) return false;
    return tool === 'Erase' ? this.enemyBoard.erase(row, column) : this.enemyBoard.place(tool, row, column);
  }

  recordMetrics(validationMetrics?: FormationValidationMetrics): {
    comparison?: FormationRunDelta;
    history: { runA?: FormationValidationMetrics; runB?: FormationValidationMetrics };
  } {
    const activeFixture = this.activePreset;
    let history = this.fixtureRunHistory.get(activeFixture.id);
    if (!history) {
      history = {};
      this.fixtureRunHistory.set(activeFixture.id, history);
    }

    if (validationMetrics) {
      if (this.activePresetKey === 'B') {
        history.runB = validationMetrics;
      } else {
        history.runA = validationMetrics;
      }
    }

    let comparison: FormationRunDelta | undefined;
    if (history.runA && history.runB) {
      comparison = compareFormationRuns(history.runA, history.runB);
    }

    return { comparison, history };
  }
}
