import type { WaveRunController } from '../run/WaveRunController';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { RunLinkShardPool } from '../run/RunLinkShardPool';
import type { RunRoster } from '../run/RunRoster';
import type { BattleFormation } from '../battle/BattleFormation';
import type { AutonomousBattleModel, EnemyFixture } from '../battle/AutonomousBattleModel';
import type { BattleFixtureManager } from '../battle/BattleFixtureManager';
import type { SessionMetrics } from '../metrics/SessionMetrics';
import type { BeastRushPhaseTimer } from '../combo/BeastRushPhaseTimer';
import type { ComboQualityTracker } from '../combo/ComboQualityTracker';
import type { EnergyRushTimer } from '../energy/EnergyRushTimer';
import type { BattleQueue } from '../queue/BattleQueue';
import type { PhaseController } from '../state/PhaseController';
import type { WaveResultView } from '../ui/WaveResultView';
import type { SessionSummaryView } from '../ui/SessionSummaryView';
import type { BattleActionView } from '../ui/BattleActionView';
import type { TransitionCueView } from '../ui/TransitionCueView';
import type { ShowcaseModeController } from './ShowcaseModeController';
import { GamePhase } from '../state/GamePhase';
import { markRunLevelComplete } from '../run/RunLevels';
import { rewardCampWin } from '../run/CampState';

export interface RunLifecycleContext {
  waveRun: WaveRunController;
  energyQueue: EnergyQueue;
  shardPool: RunLinkShardPool;
  runRoster: RunRoster;
  fixtureManager: BattleFixtureManager;
  metrics: SessionMetrics;
  beastRushTimer: BeastRushPhaseTimer;
  comboQuality: ComboQualityTracker;
  energyTimer: EnergyRushTimer;
  battleQueue: BattleQueue;
  phaseController: PhaseController;
  showcaseController: ShowcaseModeController;
  getWaveResultView: () => WaveResultView | undefined;
  getSummaryView: () => SessionSummaryView | undefined;
  getBattleModel: () => AutonomousBattleModel | undefined;
  getBattleOutcome: () => 'Win' | 'Lose' | undefined;
  getFormation: () => BattleFormation | undefined;
  getBattleActionView: () => BattleActionView | undefined;
  getTransitionCue: () => TransitionCueView | undefined;
  setFormation: (formation: BattleFormation | undefined) => void;
  setBattleModel: (model: AutonomousBattleModel | undefined) => void;
  setBattleOutcome: (outcome: 'Win' | 'Lose' | undefined) => void;
  setBattleActionView: (view: BattleActionView | undefined) => void;
  setCaptureEnemyFixtures: (fixtures: ReadonlyArray<EnemyFixture> | undefined) => void;
  setBattleTickAccumulator: (ticks: number) => void;
  setIsShowingTransitionCue: (showing: boolean) => void;
  setTransitionCueTimer: (time: number) => void;
  setIsShowingBattleSetupCue: (showing: boolean) => void;
  setBattleSetupCueTimer: (time: number) => void;
  setEnergyCarryIn: (carryIn: number) => void;
  cycleEnemyFixture: () => void;
  syncTopHud: () => void;
}

export class RunLifecycleCoordinator {
  private campRewardGranted = false;
  constructor(private readonly ctx: RunLifecycleContext) {}

  enterResult(): void {
    const battleModel = this.ctx.getBattleModel();
    const validationMetrics = battleModel?.getValidationMetrics();
    const { comparison, history } = this.ctx.fixtureManager.recordMetrics(validationMetrics);
    const battleOutcome = this.ctx.getBattleOutcome();
    if (battleOutcome === 'Win' && this.ctx.waveRun.isFinalWave && this.ctx.waveRun.levelId) markRunLevelComplete(this.ctx.waveRun.levelId);
    if (battleOutcome === 'Win' && this.ctx.waveRun.isFinalWave && this.ctx.waveRun.levelId && !this.campRewardGranted) {rewardCampWin();this.campRewardGranted=true;}

    this.ctx.getSummaryView()?.render(
      this.ctx.metrics.snapshot,
      battleOutcome,
      validationMetrics,
      comparison,
      history.runA,
      history.runB,
      battleOutcome === 'Win'
        ? `RUN COMPLETE · ${this.ctx.waveRun.totalWaves} / ${this.ctx.waveRun.totalWaves} Waves Cleared`
        : `RUN DEFEAT · Reached Wave ${this.ctx.waveRun.currentWaveIndex + 1} / ${this.ctx.waveRun.totalWaves}`,
    );
    this.ctx.getSummaryView()?.setVisible(true);
    this.ctx.syncTopHud();
  }

  enterWaveResult(): void {
    this.ctx.getWaveResultView()?.render(
      this.ctx.waveRun,
      this.ctx.energyQueue,
      this.ctx.shardPool,
      this.ctx.runRoster,
    );
  }

  advanceToNextWave(): void {
    if (this.ctx.phaseController.phase !== GamePhase.WaveResult || !this.ctx.waveRun.advanceWave()) return;
    this.resetWavePreparation();
    this.ctx.phaseController.setPhase(GamePhase.BeastRush);
  }

  resetWavePreparation(): void {
    this.ctx.beastRushTimer.reset();
    this.ctx.comboQuality.reset();
    this.ctx.energyTimer.reset();
    this.ctx.battleQueue.clear();
    // P1-V14D: Unused stored Energy persists across Waves. Do NOT call energyQueue.reset()!
    // Deployment is per-Wave only. The roster retains body state, never slots.
    const formation = this.ctx.getFormation();
    formation?.reset();
    this.ctx.setFormation(undefined);
    this.ctx.setBattleModel(undefined);
    this.ctx.setBattleOutcome(undefined);
    this.ctx.fixtureManager.clearActiveKey();
    this.ctx.setCaptureEnemyFixtures(undefined);
    this.ctx.metrics.reset();
    this.ctx.fixtureManager.initBoardForWave(this.ctx.waveRun.currentWaveIndex);
  }

  restartRun(): void {
    if (this.ctx.phaseController.phase !== GamePhase.Result) return;
    this.campRewardGranted=false;

    this.ctx.getSummaryView()?.setVisible(false);
    this.ctx.setBattleTickAccumulator(0);
    this.ctx.showcaseController.resetShowcaseState();
    this.ctx.setIsShowingTransitionCue(false);
    this.ctx.setTransitionCueTimer(0);
    this.ctx.setIsShowingBattleSetupCue(false);
    this.ctx.setBattleSetupCueTimer(0);
    this.ctx.getTransitionCue()?.hide();
    this.ctx.beastRushTimer.reset();
    this.ctx.comboQuality.reset();
    this.ctx.shardPool.reset();
    this.ctx.energyTimer.reset();
    this.ctx.battleQueue.clear();
    this.ctx.energyQueue.reset();
    this.ctx.setEnergyCarryIn(0);
    this.ctx.setFormation(undefined);
    this.ctx.getBattleActionView()?.destroy();
    this.ctx.setBattleActionView(undefined);
    this.ctx.setBattleModel(undefined);
    this.ctx.setBattleOutcome(undefined);
    this.ctx.metrics.reset();
    this.ctx.waveRun.resetRun();
    this.ctx.runRoster.reset();
    this.ctx.fixtureManager.clearActiveKey();
    this.ctx.cycleEnemyFixture();
    this.ctx.phaseController.setPhase(GamePhase.BeastRush);
  }
}
