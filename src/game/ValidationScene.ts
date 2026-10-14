import { runDeckPool } from './run/RunDeck';
import { showFirstJourneyPhase } from './ui/FirstJourneyView';
import Phaser from 'phaser';
import { BeastRushPhaseTimer } from './combo/BeastRushPhaseTimer';
import { ComboQualityTracker } from './combo/ComboQualityTracker';
import { RuleConfig } from './config/RuleConfig';
import { isTestHarness } from './config/RuntimeMode';
import { WaveRunController } from './run/WaveRunController';
import { P1V14B_ACTIVE_SQUAD_LIMIT, RunRoster } from './run/RunRoster';
import { RunLinkShardPool, evaluateLinkShardReward } from './run/RunLinkShardPool';
import { EnergyQueue } from './energy/EnergyQueue';
import { STRATEGIC_ENERGY_POOL as V14G_ENERGY_RUSH_POOL } from './energy/TacticalEnergyCatalog';
import { EnergyRushTimer } from './energy/EnergyRushTimer';
import { BattleFormation } from './battle/BattleFormation';
import {
  AutonomousBattleModel,
  P1V13A_SIGNATURE_RULES,
  type EnemyFixture,
  SIMULATION_STEP,
} from './battle/AutonomousBattleModel';
import type { IBattleController } from './battle/controller/IBattleController';
import { LocalBattleController } from './battle/controller/LocalBattleController';
import { getOnlineBattleSession } from './network/OnlineBattleSession';
import type { DeployedFormationUnit } from '../network/protocol/NetworkMessages';
import { baseStats } from './battle/BattleConfig';
import { unitBaseStats } from './config/UnitOverrides';
import { starStatMultiplier } from './run/StarProfile';
import { P1V13A1_LEVELS } from './battle/ValidationLevels';
import { deriveBattleTickPresentation } from './battle/BattlePresentation';
import { SessionMetrics } from './metrics/SessionMetrics';
import { BoardGenerator } from './puzzle/BoardGenerator';
import { BoardModel } from './puzzle/BoardModel';
import { DeadlockResolver } from './puzzle/DeadlockResolver';
import { OnetMatcher } from './puzzle/OnetMatcher';
import { BattleQueue } from './queue/BattleQueue';
import { StarConverter, type DeployedUnit } from './queue/StarConverter';
import { GamePhase } from './state/GamePhase';
import { PhaseController } from './state/PhaseController';
import { runValidationSceneStartupChecks } from './scene/ValidationSceneStartupChecks';
import { PuzzlePhaseCoordinator } from './scene/PuzzlePhaseCoordinator';
import { BattlePhaseCoordinator } from './scene/BattlePhaseCoordinator';
import { ShowcaseModeController } from './scene/ShowcaseModeController';
import { RunLifecycleCoordinator } from './scene/RunLifecycleCoordinator';
import { TransitionCueView } from './ui/TransitionCueView';
import { PrototypeFlowPanel } from './ui/PrototypeFlowPanel';
import { BattleSetupView } from './ui/BattleSetupView';
import { SessionSummaryView } from './ui/SessionSummaryView';
import { BattleActionView } from './ui/BattleActionView';
import { WaveResultView } from './ui/WaveResultView';
import { ValidationKeyboardRouter } from './scene/ValidationKeyboardRouter';
import { ShowcaseBattleHUDView } from './ui/ShowcaseBattleHUDView';
import { GameTopHUD } from './ui/GameTopHUD';
import { PhaseStatusPanel } from './ui/PhaseStatusPanel';
import { LandscapeLayout } from './ui/layout/LandscapeLayout';
import { HudTokens } from './ui/layout/HudTokens';
import { wavesForRunLevel, selectedRunLevel } from './run/RunLevels';
import { discoverCampBeasts } from './run/CampState';
import { ensureIconTextures } from './ui/icons/IconFactory';
import { preloadBattleCharacterArt } from './ui/art/BattleCharacterLoader';
import { preloadOwnerEnergyArt } from './ui/icons/OwnerEnergyArt';
import { preloadSnowguardAnimations } from './ui/art/SnowguardAnimationPlayer';
import { preloadIroncladAnimations } from './ui/art/IroncladAnimationPlayer';
import { preloadWindstriderAnimations } from './ui/art/WindstriderAnimationPlayer';
import { preloadEnemyCharacterArt } from './ui/art/EnemyCharacterLoader';
import { runBattleCharacterArtChecks } from './ui/art/BattleCharacterArtChecks';
import { FeedbackEffects } from './ui/feedback/FeedbackEffects';

import { BattleFixtureManager } from './battle/BattleFixtureManager';

export class ValidationScene extends Phaser.Scene {
  private readonly fixtureManager = new BattleFixtureManager();
  private readonly phaseController = new PhaseController();
  private readonly boardGenerator = new BoardGenerator();
  private readonly matcher = new OnetMatcher();
  private readonly deadlockResolver = new DeadlockResolver(this.matcher, this.boardGenerator);
  // Historical ComboSystem is regression-only; C.1 separates live phase time from Combo quality.
  private readonly beastRushTimer = new BeastRushPhaseTimer(12.0);
  private readonly comboQuality = new ComboQualityTracker(1.5);
  // P1-V3 Experimental Timing: Energy Rush 12.0s countdown
  private readonly energyTimer = new EnergyRushTimer(12.0);
  private readonly battleQueue = new BattleQueue();
  private readonly energyQueue = new EnergyQueue();
  private energyCarryIn = 0;
  private readonly starConverter = new StarConverter();
  private formation?: BattleFormation;
  private battleModel?: AutonomousBattleModel;
  private battleController?: IBattleController;
  private onlineFormationSubmitted = false;
  private onlineBattleUnsubs: Array<() => void> = [];
  private onlineCountdown?: import('../network/protocol/NetworkMessages').RoomUpdateMessage['battleCountdown'];
  private battleTickAccumulator = 0;
  private battleOutcome?: 'Win' | 'Lose';
  private readonly waveRun = isTestHarness() ? new WaveRunController() : new WaveRunController(wavesForRunLevel(selectedRunLevel().id), selectedRunLevel().id);
  private readonly runRoster = new RunRoster();
  private readonly shardPool = new RunLinkShardPool();
  private waveResultView?: WaveResultView;
  private readonly metrics = new SessionMetrics();

  // Transition state
  private transitionCueTimer = 0;
  private isShowingTransitionCue = false;
  private battleSetupCueTimer = 0;
  private isShowingBattleSetupCue = false;

  private layout!: LandscapeLayout;
  private topHud?: GameTopHUD;
  private phaseStatusPanel?: PhaseStatusPanel;
  private puzzleCoordinator!: PuzzlePhaseCoordinator;
  private battleCoordinator!: BattlePhaseCoordinator;
  private showcaseController!: ShowcaseModeController;
  private lifecycleCoordinator!: RunLifecycleCoordinator;
  private transitionCue?: TransitionCueView;
  private flowPanel?: PrototypeFlowPanel;
  private battleSetupView?: BattleSetupView;
  private battleActionView?: BattleActionView;
  private summary?: SessionSummaryView;
  private showcaseBattleHud?: ShowcaseBattleHUDView;
  private captureEnemyFixtures?: ReadonlyArray<EnemyFixture>;
  private isConcludingBattle = false;

  constructor() {
    super('ValidationScene');
  }

  preload(): void {
    this.load.on('progress', (value: number) => window.dispatchEvent(new CustomEvent('beast-link-load-progress', { detail: value })));
    this.events.once(Phaser.Scenes.Events.CREATE, () => window.dispatchEvent(new Event('beast-link-scene-ready')));
    preloadSnowguardAnimations(this);
    preloadIroncladAnimations(this);
    preloadWindstriderAnimations(this);
    preloadOwnerEnergyArt(this);
    this.load.image('owner-camp-battle', '/assets/backgrounds/owner-camp-battle-v1.png');
    preloadBattleCharacterArt(this);
    preloadEnemyCharacterArt(this);
  }

  create(): void {
    try {
      runValidationSceneStartupChecks();
    } catch (error) {
      this.renderStartupFailure(error);
      return;
    }

    const { width, height } = this.scale;
    this.layout = new LandscapeLayout(width, height);
    ensureIconTextures(this);

    // Global Top HUD
    this.topHud = new GameTopHUD(this);

    this.phaseStatusPanel = new PhaseStatusPanel(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );
    this.puzzleCoordinator = new PuzzlePhaseCoordinator({
      scene: this,
      layout: this.layout,
      phaseStatusPanel: this.phaseStatusPanel,
      topHud: this.topHud,
      boardGenerator: this.boardGenerator,
      matcher: this.matcher,
      deadlockResolver: this.deadlockResolver,
      beastRushTimer: this.beastRushTimer,
      comboQuality: this.comboQuality,
      energyTimer: this.energyTimer,
      battleQueue: this.battleQueue,
      energyQueue: this.energyQueue,
      metrics: this.metrics,
      phaseController: this.phaseController,
      getEnergyCarryIn: () => this.energyCarryIn,
      syncTopHud: () => this.syncTopHud(),
    });
    this.transitionCue = new TransitionCueView(this, width / 2, height / 2);
    this.flowPanel = new PrototypeFlowPanel(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );
    this.summary = new SessionSummaryView(this, width / 2, height / 2, () => this.lifecycleCoordinator.restartRun());
    this.waveResultView = new WaveResultView(this, () => this.lifecycleCoordinator.advanceToNextWave());
    this.showcaseBattleHud = new ShowcaseBattleHUDView(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );
    this.showcaseController = new ShowcaseModeController({
      scene: this,
      getLayout: () => this.layout,
      battleQueue: this.battleQueue,
      runRoster: this.runRoster,
      energyQueue: this.energyQueue,
      shardPool: this.shardPool,
      fixtureManager: this.fixtureManager,
      phaseController: this.phaseController,
      getBattleActionView: () => this.battleActionView,
      setFormation: (formation) => { this.formation = formation; },
      setCaptureEnemyFixtures: (fixtures) => { this.captureEnemyFixtures = fixtures; },
      setBattleModel: (model) => { this.battleModel = model; },
      setBattleOutcome: (outcome) => { this.battleOutcome = outcome; },
      renderBattleSetup: () => this.renderBattleSetup(),
      renderBattle: () => this.battleCoordinator.renderBattle(),
      startBattle: () => this.startBattle(),
      syncTopHud: () => this.syncTopHud(),
    });
    this.battleCoordinator = new BattlePhaseCoordinator({
      scene: this,
      getLayout: () => this.layout,
      getBattleModel: () => this.battleModel,
      getBattleController: () => this.battleController,
      getBattleActionView: () => this.battleActionView,
      getFlowPanel: () => this.flowPanel,
      getShowcaseBattleHud: () => this.showcaseBattleHud,
      energyQueue: this.energyQueue,
      metrics: this.metrics,
      isShowcaseMode: () => this.showcaseController.isShowcaseMode,
      isShowcasePaused: () => this.showcaseController.isShowcasePaused,
      syncTopHud: () => this.syncTopHud(),
    });
    this.lifecycleCoordinator = new RunLifecycleCoordinator({
      waveRun: this.waveRun,
      energyQueue: this.energyQueue,
      shardPool: this.shardPool,
      runRoster: this.runRoster,
      fixtureManager: this.fixtureManager,
      metrics: this.metrics,
      beastRushTimer: this.beastRushTimer,
      comboQuality: this.comboQuality,
      energyTimer: this.energyTimer,
      battleQueue: this.battleQueue,
      phaseController: this.phaseController,
      showcaseController: this.showcaseController,
      getWaveResultView: () => this.waveResultView,
      getSummaryView: () => this.summary,
      getBattleModel: () => this.battleModel,
      getBattleOutcome: () => this.battleOutcome,
      getFormation: () => this.formation,
      getBattleActionView: () => this.battleActionView,
      getTransitionCue: () => this.transitionCue,
      setFormation: (formation) => { this.formation = formation; },
      setBattleModel: (model) => { this.battleModel = model; },
      setBattleOutcome: (outcome) => { this.battleOutcome = outcome; },
      setBattleActionView: (view) => { this.battleActionView = view; },
      setCaptureEnemyFixtures: (fixtures) => { this.captureEnemyFixtures = fixtures; },
      setBattleTickAccumulator: (ticks) => { this.battleTickAccumulator = ticks; },
      setIsShowingTransitionCue: (showing) => { this.isShowingTransitionCue = showing; },
      setTransitionCueTimer: (time) => { this.transitionCueTimer = time; },
      setIsShowingBattleSetupCue: (showing) => { this.isShowingBattleSetupCue = showing; },
      setBattleSetupCueTimer: (time) => { this.battleSetupCueTimer = time; },
      setEnergyCarryIn: (carryIn) => { this.energyCarryIn = carryIn; },
      cycleEnemyFixture: () => this.cycleEnemyFixture(),
      syncTopHud: () => this.syncTopHud(),
    });

    const online = getOnlineBattleSession();
    if (online) {
      this.puzzleCoordinator.setSeed(online.matchInfo.seed);
      const unsubs = [
        online.adapter.onMatchStart(message => {
          online.matchInfo = message;
          this.summary?.setVisible(false);
          this.beastRushTimer.reset(); this.comboQuality.reset(); this.energyTimer.reset();
          this.runRoster.reset(); this.shardPool.reset(); this.energyQueue.reset(); this.battleQueue.clear();
          this.formation = undefined; this.battleOutcome = undefined; this.metrics.reset();
          this.isShowingTransitionCue = false; this.isShowingBattleSetupCue = false;
          this.battleController = undefined;
          this.puzzleCoordinator.setSeed(message.seed);
          this.phaseController.setPhase(GamePhase.BeastRush);
        }),
        online.adapter.onRoomUpdate(update => {
          if (!update.battleCountdown || this.phaseController.phase !== GamePhase.BattleSetup) return;
          this.onlineCountdown = update.battleCountdown;
          this.renderBattleSetup();
          this.transitionCue?.hide();
          this.topHud?.update(this.phaseController.phase, 0, this.energyQueue.getTotalCharges(), {
            primaryTitle: `BẮT ĐẦU SAU ${update.battleCountdown.remainingSeconds} GIÂY`, secondaryTitle: 'Đội hình đã khóa · Thú đối thủ sẽ hiện khi vào trận', waveLabel: 'ONLINE MATCH', linkShards: 0,
          });
        }),
        online.adapter.onPreparationPhase(phase => {
          this.isShowingTransitionCue = false;
          this.transitionCueTimer = 0;
          this.phaseController.setPhase(phase === 'EnergyRush' ? GamePhase.EnergyRush : GamePhase.BattleSetup);
        }),
        online.adapter.onOpponentFormationReady(update => {
          if (this.phaseController.phase === GamePhase.BattleSetup) {
            this.renderBattleSetup();
            if (update.ready) FeedbackEffects.showToast(this, this.layout.leftCenter.x, 100, 'Đối thủ đã sẵn sàng', '#22c55e', 1500);
          }
        }),
        online.adapter.onOnlineBattleStart(() => {
          this.phaseController.setPhase(GamePhase.Battle);
        }),
        online.adapter.onEnergyInventory(message => {
          this.energyQueue.reset();
          message.entries.forEach(entry => this.energyQueue.addCharge(entry.energyId, entry.charges));
          if (this.phaseController.phase === GamePhase.Battle) this.battleCoordinator.renderBattle();
        }),
        online.adapter.onError(error => {
          if (['OPPONENT_LEFT', 'HOST_DISCONNECTED', 'HOST_BACKGROUND', 'CONNECTION_LOST', 'INVALID_BATTLE_RESULT'].includes(error.code)) {
            window.dispatchEvent(new CustomEvent('beast-link-online-abort', { detail: error.message }));
            return;
          }
          FeedbackEffects.showToast(this, this.layout.leftCenter.x, this.layout.leftCenter.y, error.message, '#ef7777', 3000);
          if (error.code === 'INVALID_FORMATION') {
            this.onlineFormationSubmitted = false;
            this.renderBattleSetup();
          }
        }),
      ];
      this.events.once('shutdown', () => { unsubs.forEach(unsubscribe => unsubscribe()); this.onlineBattleUnsubs.splice(0).forEach(unsubscribe => unsubscribe()); });
    }
    this.phaseController.subscribe((phase) => this.onPhaseChanged(phase));

    // Keyboard shortcuts
    new ValidationKeyboardRouter(this, this.phaseController, this.battleQueue, {
      setEnemyFixturePreset: (index) => this.setEnemyFixturePreset(index),
      cycleEnemyFixture: () => this.cycleEnemyFixture(),
      loadFormationPreset: (key) => this.loadFormationPreset(key),
      toggleShowcaseMode: () => this.showcaseController.toggleShowcaseMode(),
      toggleShowcasePause: () => this.showcaseController.toggleShowcasePause(),
      toggleShowcaseCleanFrame: () => this.showcaseController.toggleShowcaseCleanFrame(),
      loadV15ACaptureFixture: () => this.showcaseController.loadV15ACaptureFixture(),
      startV15AHeroBattle: () => this.showcaseController.startV15AHeroBattle(),
    }).register();

    // P1-V14C.1: fixed phase time, never Combo expiry, ends Beast Rush.
    this.beastRushTimer.onEnded(() => {
      this.handleBeastRushEnded();
    });

    // When EnergyRush countdown reaches 0: disable input and transition to BattleSetup
    this.energyTimer.onEnded(() => {
      this.handleEnergyRushEnded();
    });

    // Listen to resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.layout = new LandscapeLayout(gameSize.width, gameSize.height);
    });
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    // Hide the Battle Setup cue after short confirmation window
    if (this.isShowingBattleSetupCue) {
      this.battleSetupCueTimer -= deltaSeconds;
      if (this.battleSetupCueTimer <= 0) {
        this.isShowingBattleSetupCue = false;
        this.battleSetupCueTimer = 0;
        this.transitionCue?.hide();
      }
    }

    // Handle Beast Rush → Energy Rush transition cue countdown
    if (this.isShowingTransitionCue) {
      this.transitionCueTimer -= deltaSeconds;
      if (this.transitionCueTimer <= 0) {
        this.finishTransitionCue();
      }
      return;
    }

    if (this.phaseController.phase === GamePhase.BeastRush && this.beastRushTimer.snapshot.active) {
      this.beastRushTimer.update(deltaSeconds);
      this.comboQuality.update(deltaSeconds);
      const quality = this.comboQuality.snapshot;
      this.metrics.comboQuality(quality.currentStreak, quality.bestStreak, quality.breakCount);
      this.puzzleCoordinator.refreshBeastHUD();
    }

    // EnergyRush countdown timer update
    if (this.phaseController.phase === GamePhase.EnergyRush && this.energyTimer.snapshot.active) {
      this.energyTimer.update(deltaSeconds);
      this.puzzleCoordinator.refreshEnergyHUD();
    }

    // Autonomous Battle ticking
    if (this.phaseController.phase === GamePhase.Battle) {
      const controller = this.battleController;
      const model = this.battleModel;
      if (controller && controller.isRemote) {
        const status = controller.currentSnapshot.status;
        if (status !== 'Running') {
          this.handleBattleEnded(status);
        }
      } else if (model) {
        const status = model.snapshot.status;
        if (status !== 'Running') {
          this.handleBattleEnded(status);
        } else if (!this.showcaseController.isShowcaseMode || !this.showcaseController.isShowcasePaused) {
          this.battleTickAccumulator += delta;
          let ticked = false;
          const STEP_MS = SIMULATION_STEP * 1000;
          while (this.battleTickAccumulator >= STEP_MS && model.snapshot.status === 'Running') {
            this.battleTickAccumulator -= STEP_MS;
            const before = model.snapshot;
            const after = model.step(SIMULATION_STEP);
            this.battleActionView?.render(after);
            this.battleActionView?.playTick(deriveBattleTickPresentation(before, after));
            ticked = true;
          }
          if (ticked) this.battleCoordinator.renderBattle();
          const finalStatus = model.snapshot.status;
          if (finalStatus !== 'Running') {
            this.handleBattleEnded(finalStatus);
          }
        }
      }
    }
  }

  private handleBattleEnded(status: 'Win' | 'Lose'): void {
    if (getOnlineBattleSession() && !getOnlineBattleSession()!.adapter.roundResult) return;
    if (this.isConcludingBattle) return;
    this.isConcludingBattle = true;
    this.battleCoordinator.renderBattle();

    // KO clips/fades take up to 870ms; finish their presentation before the result.
    this.time.delayedCall(1200, () => {
      this.isConcludingBattle = false;
      if (this.phaseController.phase !== GamePhase.Battle) return;
      const online = getOnlineBattleSession();
      const units = this.battleController?.currentSnapshot.units ?? this.battleModel?.snapshot.units ?? [];
      this.runRoster.reconcile(online ? units.map(unit => ({ ...unit, unitId: unit.unitId.replace(`${online.adapter.playerId}:`, '') })) : units);
      this.metrics.result(status, this.energyQueue.getAll());
      this.battleOutcome = status;
      this.phaseController.setPhase(!online && status === 'Win' && !this.waveRun.isFinalWave ? GamePhase.WaveResult : GamePhase.Result);
    });
  }

  private renderStartupFailure(error: unknown): void {
    const { width, height } = this.scale;
    const message = error instanceof Error ? error.message : String(error);

    this.add.rectangle(width / 2, height / 2, width - 80, 260, 0x7f1d1d, 0.96)
      .setStrokeStyle(3, 0xfca5a5);

    this.add.text(70, height / 2 - 100, 'VALIDATION STARTUP CHECK FAILED', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(70, height / 2 - 52, message, {
      fontFamily: HudTokens.fonts.mono,
      fontSize: '14px',
      color: '#fee2e2',
      wordWrap: { width: width - 140 },
      lineSpacing: 6,
    });

    this.add.text(70, height / 2 + 70, 'The scene was stopped intentionally so a failed regression cannot contaminate validation.', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '13px',
      color: '#fecaca',
      wordWrap: { width: width - 140 },
    });
  }

  private handleBeastRushEnded(): void {
    this.puzzleCoordinator.disableInput();
    const bestStreak = this.comboQuality.snapshot.bestStreak;
    const reward = evaluateLinkShardReward(bestStreak);
    if (reward > 0) {
      const awarded = this.shardPool.award(reward);
      if (awarded > 0) {
        this.metrics.recordLinkShardsEarned(awarded);
        FeedbackEffects.floatText(
          this,
          640,
          260,
          `BEST ×${bestStreak}  ·  +${awarded} LINK SHARD${awarded > 1 ? 'S' : ''}`,
          '#38bdf8',
          '16px',
          1100,
        );
      }
    }
    this.isShowingTransitionCue = true;
    this.transitionCueTimer = 1.0;
    this.transitionCue?.show('ENERGY RUSH', 'Collect Energy for Battle');
    this.puzzleCoordinator.setRecentAction('Beast Rush ended. Preparing Energy Rush...');
    this.puzzleCoordinator.refreshBeastHUD();
  }

  private finishTransitionCue(): void {
    this.isShowingTransitionCue = false;
    this.transitionCueTimer = 0;
    this.isShowingBattleSetupCue = false;
    this.battleSetupCueTimer = 0;
    this.transitionCue?.hide();
    const online = getOnlineBattleSession();
    if (online) {
      online.adapter.preparationReady('BeastRush');
      if (this.phaseController.phase === GamePhase.BeastRush) this.transitionCue?.show('CHỜ ĐỐI THỦ', 'Cùng chuyển sang Energy Rush khi cả hai hoàn tất');
      return;
    }
    this.phaseController.setPhase(GamePhase.EnergyRush);
  }

  private handleEnergyRushEnded(): void {
    this.puzzleCoordinator.disableInput();
    const online = getOnlineBattleSession();
    if (online) {
      online.adapter.preparationReady('EnergyRush');
      if (this.phaseController.phase === GamePhase.EnergyRush) this.transitionCue?.show('CHỜ ĐỐI THỦ', 'Cùng xếp đội hình khi cả hai hoàn tất');
      return;
    }
    if (this.phaseController.setPhase(GamePhase.BattleSetup)) {
      this.isShowingBattleSetupCue = true;
      this.battleSetupCueTimer = 0.8;
      this.transitionCue?.show('BATTLE SETUP', 'Arrange your Beasts');
    }
  }

  private onPhaseChanged(phase: GamePhase): void {
    if (phase !== GamePhase.Battle) this.onlineBattleUnsubs.splice(0).forEach(unsubscribe => unsubscribe());
    this.puzzleCoordinator.clearPuzzlePresentation();
    this.phaseStatusPanel?.setVisible(false);
    this.transitionCue?.hide();
    this.flowPanel?.destroy();
    this.showcaseBattleHud?.setVisible(false);
    this.battleSetupView?.destroy();
    this.battleActionView?.destroy();
    this.battleActionView = undefined;
    this.summary?.setVisible(false);
    this.waveResultView?.destroy();
    this.showcaseController.resetShowcaseState();
    this.isConcludingBattle = false;

    this.syncTopHud();

    if (phase === GamePhase.BeastRush) this.enterBeastRush();
    else if (phase === GamePhase.EnergyRush) this.enterEnergyRush();
    else if (phase === GamePhase.BattleSetup) this.enterBattleSetup();
    else if (phase === GamePhase.Battle) this.enterBattle();
    else if (phase === GamePhase.WaveResult) this.lifecycleCoordinator.enterWaveResult();
    else this.lifecycleCoordinator.enterResult();
    if(!getOnlineBattleSession()&&!isTestHarness()&&this.waveRun.levelId==='woodland')showFirstJourneyPhase(this,phase);
  }

  private syncTopHud(): void {
    const onlineSession = getOnlineBattleSession();
    if (onlineSession) {
      const modeLabel = onlineSession.matchInfo.mode === 'pvp' ? 'ĐỐI KHÁNG' : 'CO-OP ĐỒNG ĐỘI';
      const hearts = onlineSession.adapter.roundResult?.hearts ?? onlineSession.matchInfo.hearts ?? { TeamA: 4, TeamB: 4 };
      const own = onlineSession.adapter.teamId;
      const other = own === 'TeamA' ? 'TeamB' : 'TeamA';
      this.topHud?.setOnlineHearts(hearts[own], hearts[other]);
      this.topHud?.update(this.phaseController.phase, 0, this.energyQueue.getTotalCharges(), {
        primaryTitle: `⚔️ ĐẤU ONLINE · ${modeLabel}`,
        secondaryTitle: `VÒNG ${onlineSession.matchInfo.round ?? 1} · ${modeLabel}`,
        waveLabel: `ONLINE · VÒNG ${onlineSession.matchInfo.round ?? 1}`,
        linkShards: 0,
      });
      this.topHud?.setVisible(true);
      return;
    }

    const beastCount = this.battleQueue.entries().reduce((s, e) => s + e.count, 0);
    this.topHud?.setOnlineHearts();
    const energyCount = this.energyQueue.getTotalCharges();
    const wave = this.waveRun.currentWave;
    const setup = this.phaseController.phase === GamePhase.BattleSetup;
    this.topHud?.update(this.phaseController.phase, beastCount, energyCount, {
      ...(setup ? { primaryTitle: `WAVE ${this.waveRun.currentWaveIndex + 1} / ${this.waveRun.totalWaves} · ${wave.name}`, secondaryTitle: `Threat · ${wave.threatLabel}`, hideBrand: true } : {}),
      waveLabel: `WAVE ${this.waveRun.currentWaveIndex + 1} / ${this.waveRun.totalWaves}`,
      linkShards: this.shardPool.count,
    });
    this.topHud?.setVisible(!(this.showcaseController.isShowcaseMode && this.showcaseController.isShowcaseCleanFrame));
  }

  private enterBeastRush(): void {
    this.beastRushTimer.reset();
    this.comboQuality.reset();
    this.puzzleCoordinator.resetBeastRushEvent();
    this.puzzleCoordinator.setRecentAction('');
    this.puzzleCoordinator.createPuzzleBoard(
      'BEAST RUSH',
      'Match Beast pairs to recruit units for this Wave.',
      runDeckPool(),
      'Beast',
      (contentId, turns, midpoint) => this.puzzleCoordinator.onBeastMatch(contentId, turns, midpoint),
    );
    this.phaseStatusPanel?.setVisible(true);
    this.puzzleCoordinator.refreshBeastHUD();
    this.syncTopHud();
  }

  private enterEnergyRush(): void {
    const online = getOnlineBattleSession();
    if (online) this.puzzleCoordinator.setSeed(online.matchInfo.seed ^ 0x45e);
    this.energyTimer.reset();
    this.energyCarryIn = this.energyQueue.getTotalCharges();
    this.metrics.recordEnergyCarryIn(this.energyCarryIn);
    this.puzzleCoordinator.setRecentAction('Match identical Energy pairs to store Tactical Energy.');
    this.puzzleCoordinator.createPuzzleBoard(
      'ENERGY RUSH',
      'Match Energy pairs to prepare tactical tools for Battle.',
      V14G_ENERGY_RUSH_POOL,
      'Energy',
      (contentId, _turns, midpoint) => this.puzzleCoordinator.onEnergyMatch(contentId, midpoint),
    );
    this.phaseStatusPanel?.setVisible(true);
    this.puzzleCoordinator.refreshEnergyHUD();
    this.syncTopHud();
  }

  private enterBattleSetup(): void {
    this.onlineCountdown = undefined;
    this.onlineFormationSubmitted = false;
    this.metrics.enterBattleSetup(this.battleQueue.entries());
    if (!this.formation) {
      const converted: DeployedUnit[] = [];
      for (const entry of [...this.battleQueue.entries()]) {
        const units = this.starConverter.recruit(entry.contentId, entry.count);
        converted.push(...units);
        this.battleQueue.consume(entry.contentId, entry.count);
      }
      this.runRoster.recruit(converted);
      if (!isTestHarness() && !getOnlineBattleSession()) discoverCampBeasts(converted.map(unit => unit.contentId));
      this.formation = new BattleFormation(this.runRoster.formationUnits());
    }
    this.renderBattleSetup();
  }

  private renderBattleSetup(): void {
    if (!this.formation) return;
    this.battleSetupView?.destroy();
    this.fixtureManager.ensureBoard();
    const onlineSession = getOnlineBattleSession();
    const enemiesToDisplay = onlineSession
      ? ((this.onlineCountdown?.placements ?? onlineSession.adapter.opponentFormation?.placements)?.map((slot, index) => ({ ...slot, enemyId: `hidden-${index}`, maxHp: 0, damage: 0 })) ?? [])
      : (this.captureEnemyFixtures ?? this.fixtureManager.board?.fixtures ?? this.waveRun.currentWave.enemyFixtures);

    this.battleSetupView = new BattleSetupView(
      this,
      this.formation,
      enemiesToDisplay,
      () => this.energyQueue.getAll(),
      () => this.startBattle(),
      () => {
        this.fixtureManager.clearActiveKey();
        this.metrics.arrangementChanged();
        this.publishOnlineFormation();
      },
      onlineSession ? '⚔️ ĐẤU ONLINE · CHUẨN BỊ ĐỘI HÌNH' : `WAVE ${this.waveRun.currentWaveIndex + 1} / ${this.waveRun.totalWaves} · ${this.waveRun.currentWave.name}${isTestHarness() && this.fixtureManager.board?.isCustomized ? ' [CUSTOMIZED]' : ''}`,
      isTestHarness() && !this.showcaseController.isShowcaseMode ? () => this.cycleEnemyFixture() : undefined,
      onlineSession ? 'Chế độ đối kháng 1v1 PvP' : `Threat: ${this.waveRun.currentWave.threatLabel}`,
      isTestHarness() && !this.showcaseController.isShowcaseMode ? this.fixtureManager.activeKey : undefined,
      isTestHarness() && !this.showcaseController.isShowcaseMode ? () => this.loadFormationPreset('A') : undefined,
      isTestHarness() && !this.showcaseController.isShowcaseMode ? () => this.loadFormationPreset('B') : undefined,
      isTestHarness() && !this.showcaseController.isShowcaseMode ? (tool, row, column) => this.editEnemyBoard(tool, row, column) : undefined,
      this.runRoster,
      (selectedUnitId) => this.consolidateReserveUnit(selectedUnitId),
      this.shardPool,
      () => {
        if (this.phaseController.phase !== GamePhase.BattleSetup || !this.runRoster.buyFifthSlot(this.shardPool)) return;
        this.metrics.recordLinkShardsSpent(2);
        this.renderBattleSetup();
      },
      Boolean(onlineSession),
    );
    this.battleSetupView.render();
    if (this.onlineFormationSubmitted) this.battleSetupView.lock();
    this.syncTopHud();
  }

  private loadFormationPreset(key: 'A' | 'B'): void {
    if (this.phaseController.phase !== GamePhase.BattleSetup || !this.formation) return;
    if (this.fixtureManager.loadFormationPreset(this.formation, key)) {
      this.metrics.arrangementChanged();
      this.renderBattleSetup();
    }
  }

  private setEnemyFixturePreset(index: number): void {
    this.fixtureManager.setPresetIndex(index);
    if (this.phaseController.phase === GamePhase.BattleSetup && this.formation) {
      this.renderBattleSetup();
    }
  }

  private cycleEnemyFixture(): void {
    this.setEnemyFixturePreset(this.fixtureManager.presetIndex + 1);
  }

  private editEnemyBoard(tool: import('./battle/AutonomousBattleModel').EnemyArchetype | 'Erase', row: 'Front' | 'Mid' | 'Back', column: number): void {
    if (!isTestHarness() || !this.fixtureManager.board) return;
    if (this.fixtureManager.editEnemyBoard(tool, row, column)) {
      this.renderBattleSetup();
    }
  }

  private enterBattle(): void {
    const onlineSession = getOnlineBattleSession();
    if (onlineSession) {
      this.battleController = onlineSession.controller;
      this.battleModel = undefined;
      this.battleTickAccumulator = 0;
      this.isConcludingBattle = false;
      this.battleActionView = new BattleActionView(this, this.layout.leftX, this.layout.leftY);
      this.battleActionView.setShowcaseMode(false);
      this.battleActionView.render(onlineSession.controller.currentSnapshot);

      let previousSnapshot = onlineSession.controller.currentSnapshot;
      const unsubscribeSnapshot = onlineSession.controller.onSnapshot((snapshot) => {
        this.battleActionView?.render(snapshot);
        this.battleActionView?.playTick(deriveBattleTickPresentation(previousSnapshot, snapshot));
        previousSnapshot = snapshot;
        this.battleCoordinator.renderBattle();
      });

      const unsubscribeStatus = onlineSession.controller.onStatus((status) => {
        if (status !== 'Running') {
          this.handleBattleEnded(status);
        }
      });
      this.onlineBattleUnsubs.push(unsubscribeSnapshot, unsubscribeStatus);

      this.battleCoordinator.renderBattle();
      this.syncTopHud();
      return;
    }

    if (!this.formation) return;
    this.battleModel = new AutonomousBattleModel(
      this.formation,
      this.captureEnemyFixtures ?? (isTestHarness() && this.fixtureManager.board ? this.fixtureManager.board.fixtures : this.waveRun.currentWave.enemyFixtures),
      P1V13A_SIGNATURE_RULES,
      Object.fromEntries(this.runRoster.units.map((unit) => [unit.instanceId, unit.currentHp])),
    );
    this.battleController = new LocalBattleController(this.battleModel, this.energyQueue);
    this.battleTickAccumulator = 0;
    this.isConcludingBattle = false;
    this.battleActionView = new BattleActionView(this, this.layout.leftX, this.layout.leftY);
    this.battleActionView.setShowcaseMode(this.showcaseController.isShowcaseMode);
    this.battleActionView.render(this.battleModel.snapshot);
    this.battleCoordinator.renderBattle();
    this.syncTopHud();
  }

  private consolidateReserveUnit(selectedUnitId: string): string | undefined {
    if (!this.formation) return undefined;
    const deployedIds = new Set(this.formation.units.filter((unit) => unit.slotId !== null).map((unit) => unit.unitId));
    const result = this.runRoster.consolidate(selectedUnitId, deployedIds, this.shardPool);
    if (!result) return undefined;
    if (result.shardsSpent > 0) {
      this.metrics.recordLinkShardsSpent(result.shardsSpent);
    }
    if (result.isShardAssisted) {
      this.metrics.recordAssistedConsolidation();
    }
    result.consumedIds.forEach((unitId) => this.formation?.removeUnplacedUnit(unitId));
    this.formation.updateUnplacedUnitStar(result.upgraded.instanceId, result.upgraded.star);
    return result.upgraded.instanceId;
  }

  private startBattle(): void {
    if (this.onlineFormationSubmitted) return;
    if (this.phaseController.phase !== GamePhase.BattleSetup || !this.formation) return;
    const active = this.formation.units.filter((unit) => unit.slotId !== null && this.runRoster.canDeploy(unit.unitId));
    if (active.length < 1 || active.length > this.runRoster.squadLimit) return;
    this.metrics.startBattle(this.energyQueue.getAll(), this.formation.units);

    const onlineSession = getOnlineBattleSession();
    if (onlineSession) {
      const deployedUnits: DeployedFormationUnit[] = active.map((unit) => {
        const slot = this.formation!.slots.find((s) => s.unitId === unit.unitId);
        const row = slot?.row ?? 'Mid';
        const col = slot?.column ?? 1;
        const rosterUnit = this.runRoster.units.find((u) => u.instanceId === unit.unitId);
        const base = unitBaseStats(unit.beastId, baseStats[unit.role]);
        const mult = starStatMultiplier(unit.star);
        const maxHp = base.hp * mult;
        const damage = base.damage * mult;
        const hp = rosterUnit?.currentHp ?? maxHp;
        return {
          unitId: unit.unitId,
          beastId: unit.beastId,
          role: unit.role,
          star: unit.star,
          slotId: unit.slotId!,
          row,
          column: col,
          maxHp,
          currentHp: hp,
          damage,
        };
      });

      this.onlineFormationSubmitted = true;
      this.transitionCue?.hide();
      this.battleSetupView?.lock();
      onlineSession.adapter.deployFormation(deployedUnits, true, this.energyQueue.getAll());

      FeedbackEffects.showToast(
        this,
        this.layout.leftCenter.x,
        this.layout.leftCenter.y,
        'ĐÃ SẴN SÀNG · CHỜ ĐỐI THỦ...',
        '#f6d675',
        3000,
      );

      if (!this.onlineCountdown) this.topHud?.update(this.phaseController.phase, 0, this.energyQueue.getTotalCharges(), {
        primaryTitle: 'ĐÃ SẴN SÀNG · CHỜ ĐỐI THỦ',
        secondaryTitle: 'Đã gửi đội hình lên máy chủ',
        waveLabel: 'ONLINE MATCH',
        linkShards: 0,
      });

      return;
    }

    this.phaseController.setPhase(GamePhase.Battle);
  }

  private publishOnlineFormation(): void {
    const online = getOnlineBattleSession();
    if (!online || !this.formation || this.onlineFormationSubmitted || this.phaseController.phase !== GamePhase.BattleSetup) return;
    const units = this.formation.units.filter(unit => unit.slotId !== null && this.runRoster.canDeploy(unit.unitId)).map(unit => {
      const slot = this.formation!.slots.find(candidate => candidate.unitId === unit.unitId)!;
      const base = unitBaseStats(unit.beastId, baseStats[unit.role]);
      const mult = starStatMultiplier(unit.star);
      return { unitId: unit.unitId, beastId: unit.beastId, role: unit.role, star: unit.star, slotId: unit.slotId!,
        row: slot.row, column: slot.column, maxHp: base.hp * mult, damage: base.damage * mult,
        currentHp: this.runRoster.units.find(candidate => candidate.instanceId === unit.unitId)?.currentHp ?? base.hp * mult };
    });
    online.adapter.deployFormation(units, false);
  }

}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
