import type Phaser from 'phaser';
import type { BattleFormation } from '../battle/BattleFormation';
import type { BattleFixtureManager } from '../battle/BattleFixtureManager';
import type { AutonomousBattleModel, EnemyFixture } from '../battle/AutonomousBattleModel';
import type { BattleActionView } from '../ui/BattleActionView';
import { setupV15ACapturePreset } from '../battle/V15ACaptureFixture';
import { FeedbackEffects } from '../ui/feedback/FeedbackEffects';
import { GamePhase } from '../state/GamePhase';
import type { BattleQueue } from '../queue/BattleQueue';
import type { RunRoster } from '../run/RunRoster';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { RunLinkShardPool } from '../run/RunLinkShardPool';
import type { PhaseController } from '../state/PhaseController';
import type { LandscapeLayout } from '../ui/layout/LandscapeLayout';

export interface ShowcaseControllerContext {
  scene: Phaser.Scene;
  getLayout: () => LandscapeLayout;
  battleQueue: BattleQueue;
  runRoster: RunRoster;
  energyQueue: EnergyQueue;
  shardPool: RunLinkShardPool;
  fixtureManager: BattleFixtureManager;
  phaseController: PhaseController;
  getBattleActionView: () => BattleActionView | undefined;
  setFormation: (formation: BattleFormation | undefined) => void;
  setCaptureEnemyFixtures: (fixtures: ReadonlyArray<EnemyFixture> | undefined) => void;
  setBattleModel: (model: AutonomousBattleModel | undefined) => void;
  setBattleOutcome: (outcome: 'Win' | 'Lose' | undefined) => void;
  renderBattleSetup: () => void;
  renderBattle: () => void;
  startBattle: () => void;
  syncTopHud: () => void;
}

export class ShowcaseModeController {
  private showcaseMode = true;
  private showcasePaused = false;
  private showcaseCleanFrame = false;

  constructor(private readonly ctx: ShowcaseControllerContext) {}

  get isShowcaseMode(): boolean {
    return this.showcaseMode;
  }

  get isShowcasePaused(): boolean {
    return this.showcasePaused;
  }

  get isShowcaseCleanFrame(): boolean {
    return this.showcaseCleanFrame;
  }

  resetShowcaseState(): void {
    this.showcasePaused = false;
    this.showcaseCleanFrame = false;
  }

  startV15AHeroBattle(): void {
    this.loadV15ACaptureFixture();
    if (this.ctx.phaseController.phase === GamePhase.BattleSetup) {
      this.ctx.startBattle();
    }
  }

  loadV15ACaptureFixture(): void {
    this.showcaseMode = true;
    this.showcasePaused = false;
    this.showcaseCleanFrame = false;
    this.ctx.scene.tweens.resumeAll();

    this.ctx.setBattleModel(undefined);
    this.ctx.setBattleOutcome(undefined);

    const fixture = setupV15ACapturePreset(
      this.ctx.battleQueue,
      this.ctx.runRoster,
      this.ctx.energyQueue,
      this.ctx.shardPool,
      this.ctx.fixtureManager,
    );
    this.ctx.setFormation(fixture.formation);
    this.ctx.setCaptureEnemyFixtures(fixture.captureEnemyFixtures);

    this.ctx.phaseController.setPhaseForTools(GamePhase.BattleSetup);

    const layout = this.ctx.getLayout();
    FeedbackEffects.showToast(
      this.ctx.scene,
      layout.rightCenter.x,
      this.ctx.scene.scale.height - 46,
      'V15A FIXTURE READY · 4 ENEMIES · 1180 HP',
      '#8be2bd',
      900,
    );
  }

  toggleShowcaseMode(): void {
    this.showcaseMode = !this.showcaseMode;
    this.showcasePaused = false;
    this.ctx.scene.tweens.resumeAll();
    this.showcaseCleanFrame = false;
    this.ctx.getBattleActionView()?.setShowcaseMode(this.showcaseMode);
    if (this.ctx.phaseController.phase === GamePhase.BattleSetup) {
      this.ctx.renderBattleSetup();
    } else if (this.ctx.phaseController.phase === GamePhase.Battle) {
      this.ctx.renderBattle();
    }
    this.ctx.syncTopHud();
  }

  toggleShowcasePause(): void {
    if (!this.showcaseMode || this.ctx.phaseController.phase !== GamePhase.Battle) return;
    this.showcasePaused = !this.showcasePaused;
    this.ctx.renderBattle();

    if (this.showcasePaused) {
      this.ctx.scene.tweens.pauseAll();
    } else {
      this.ctx.scene.tweens.resumeAll();
    }

    this.ctx.syncTopHud();
  }

  toggleShowcaseCleanFrame(): void {
    if (!this.showcaseMode) return;
    this.showcaseCleanFrame = !this.showcaseCleanFrame;
    this.ctx.syncTopHud();
  }
}
