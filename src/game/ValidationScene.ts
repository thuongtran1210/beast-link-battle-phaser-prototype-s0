import Phaser from 'phaser';
import { ComboSystem } from './combo/ComboSystem';
import { runS2Checks } from './combo/S2Checks';
import { RuleConfig } from './config/RuleConfig';
import { EnergyQueue } from './energy/EnergyQueue';
import { runP1S1Checks } from './energy/P1S1Checks';
import { EnergyRushTimer } from './energy/EnergyRushTimer';
import { runP1V1Checks } from './energy/P1V1Checks';
import { runP1V2Checks } from './combo/P1V2Checks';
import { runP1V3Checks } from './combo/P1V3Checks';
import { BattleFormation } from './battle/BattleFormation';
import { runP1S2Checks } from './battle/P1S2Checks';
import {
  AutonomousBattleModel,
  P1V9_AUTONOMOUS_MOVEMENT_RULES,
  P1V11A_TIMELINE_RULES,
  P1V11B_ENGAGEMENT_RULES,
  P1V11B1_ROLE_IDENTITY_RULES,
  P1V11C_ARCHETYPE_RULES,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V11C_FIXTURE_B_DIVERS,
  P1V11C_FIXTURE_C_PROTECTED_RANGED,
  type EnemyFixture,
  SIMULATION_STEP,
} from './battle/AutonomousBattleModel';
import { runP1S3Checks } from './battle/P1S3Checks';
import { runP1S4Checks } from './battle/P1S4Checks';
import { deriveBattleHealPresentation, deriveBattleTickPresentation } from './battle/BattlePresentation';
import { runP1V4Checks } from './battle/P1V4Checks';
import { runP1V5Checks } from './battle/P1V5Checks';
import { P1V7_ENEMY_FIXTURES, runP1V7Checks } from './battle/P1V7Checks';
import { runP1V8Checks } from './battle/P1V8Checks';
import { runP1V9Checks } from './battle/P1V9Checks';
import { runP1V11AChecks } from './battle/P1V11AChecks';
import { runP1V11BChecks } from './battle/P1V11BChecks';
import { runP1V11B1Checks } from './battle/P1V11B1Checks';
import { runP1V11CChecks } from './battle/P1V11CChecks';
import { SessionMetrics } from './metrics/SessionMetrics';
import { BoardGenerator } from './puzzle/BoardGenerator';
import { BoardModel } from './puzzle/BoardModel';
import { DeadlockResolver } from './puzzle/DeadlockResolver';
import { OnetMatcher } from './puzzle/OnetMatcher';
import { runOnetMatcherChecks } from './puzzle/OnetMatcherChecks';
import { BattleQueue } from './queue/BattleQueue';
import { StarConverter, type DeployedUnit } from './queue/StarConverter';
import { runS3Checks } from './queue/S3Checks';
import { GamePhase } from './state/GamePhase';
import { PhaseController } from './state/PhaseController';
import { runP1S0Checks } from './state/P1S0Checks';
import { BoardView } from './ui/BoardView';
import { TransitionCueView } from './ui/TransitionCueView';
import { PrototypeFlowPanel } from './ui/PrototypeFlowPanel';
import { BattleSetupView } from './ui/BattleSetupView';
import { SessionSummaryView } from './ui/SessionSummaryView';
import { BattleActionView } from './ui/BattleActionView';
import { ShowcaseBattleHUDView } from './ui/ShowcaseBattleHUDView';
import { GameTopHUD } from './ui/GameTopHUD';
import { PhaseStatusPanel } from './ui/PhaseStatusPanel';
import { LandscapeLayout } from './ui/layout/LandscapeLayout';
import { HudTokens } from './ui/layout/HudTokens';
import { ensureIconTextures } from './ui/icons/IconFactory';
import { FeedbackEffects } from './ui/feedback/FeedbackEffects';
import { getIconDefinition } from './ui/icons/UnitIconRegistry';

const ENEMY_FIXTURE_PRESETS: ReadonlyArray<{ name: string; tag: string; fixtures: ReadonlyArray<EnemyFixture> }> = [
  { name: 'Frontline Pressure', tag: '3x Front', fixtures: P1V11C_FIXTURE_A_FRONTLINE },
  { name: 'Backline Dive', tag: '1 Front, 2 Diver', fixtures: P1V11C_FIXTURE_B_DIVERS },
  { name: 'Protected Ranged', tag: '2 Front, 2 Ranged', fixtures: P1V11C_FIXTURE_C_PROTECTED_RANGED },
];

/**
 * Landscape-First Beast Link Battle Validation Scene.
 * Reference resolution: 1280×720 (16:9).
 */
export class ValidationScene extends Phaser.Scene {
  private enemyFixturePresetIndex = 0;
  private readonly phaseController = new PhaseController();
  private readonly boardGenerator = new BoardGenerator();
  private readonly matcher = new OnetMatcher();
  private readonly deadlockResolver = new DeadlockResolver(this.matcher, this.boardGenerator);
  // P1-V3 Experimental Timing: Beast Rush 12.0s initial / +0.3s bonus / 12.0s cap
  private readonly comboSystem = new ComboSystem({ initialSeconds: 12.0, bonusSeconds: 0.3, capSeconds: 12.0 });
  // P1-V3 Experimental Timing: Energy Rush 12.0s countdown
  private readonly energyTimer = new EnergyRushTimer(12.0);
  private readonly battleQueue = new BattleQueue();
  private readonly energyQueue = new EnergyQueue();
  private readonly starConverter = new StarConverter();
  private formation?: BattleFormation;
  private battleModel?: AutonomousBattleModel;
  private battleTickAccumulator = 0;
  private battleOutcome?: 'Win' | 'Lose';
  private readonly metrics = new SessionMetrics();

  // Transition state
  private transitionCueTimer = 0;
  private isShowingTransitionCue = false;
  private battleSetupCueTimer = 0;
  private isShowingBattleSetupCue = false;

  private layout!: LandscapeLayout;
  private topHud?: GameTopHUD;
  private phaseStatusPanel?: PhaseStatusPanel;
  private board?: BoardModel;
  private boardView?: BoardView;
  private boardTitle?: Phaser.GameObjects.Text;
  private boardSubtitle?: Phaser.GameObjects.Text;
  private transitionCue?: TransitionCueView;
  private flowPanel?: PrototypeFlowPanel;
  private battleSetupView?: BattleSetupView;
  private battleActionView?: BattleActionView;
  private summary?: SessionSummaryView;
  private showcaseBattleHud?: ShowcaseBattleHUDView;

  private showcaseMode = false;
  private showcasePaused = false;
  private showcaseCleanFrame = false;
  private recentActionText = 'Awaiting first match...';

  constructor() {
    super('ValidationScene');
  }

  create(): void {
    try {
      runOnetMatcherChecks();
      runS2Checks();
      runS3Checks();
      runP1S0Checks();
      runP1S1Checks();
      runP1S2Checks();
      runP1S3Checks();
      runP1S4Checks();
      runP1V4Checks();
      runP1V5Checks();
      runP1V7Checks();
      runP1V8Checks();
      runP1V9Checks();
      runP1V11AChecks();
      runP1V11BChecks();
      runP1V11B1Checks();
      runP1V11CChecks();
      runP1V1Checks();
      runP1V2Checks();
      runP1V3Checks();
    } catch (error) {
      this.renderStartupFailure(error);
      return;
    }

    const { width, height } = this.scale;
    this.layout = new LandscapeLayout(width, height);
    ensureIconTextures(this);

    // Global Top HUD
    this.topHud = new GameTopHUD(this, {
      onToggleShowcase: () => this.toggleShowcaseMode(),
      onTogglePause: () => this.toggleShowcasePause(),
      onToggleCleanFrame: () => this.toggleShowcaseCleanFrame(),
    });

    // Reusable views
    this.phaseStatusPanel = new PhaseStatusPanel(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );
    this.transitionCue = new TransitionCueView(this, width / 2, height / 2);
    this.flowPanel = new PrototypeFlowPanel(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );
    this.summary = new SessionSummaryView(this, width / 2, height / 2, () => this.restartRun());
    this.showcaseBattleHud = new ShowcaseBattleHUDView(
      this,
      this.layout.rightX,
      this.layout.rightY,
      this.layout.rightWidth,
    );

    this.phaseController.subscribe((phase) => this.onPhaseChanged(phase));

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-F1', () => this.toggleShowcaseMode());
    this.input.keyboard?.on('keydown-SPACE', () => this.toggleShowcasePause());
    this.input.keyboard?.on('keydown-H', () => this.toggleShowcaseCleanFrame());
    this.input.keyboard?.on('keydown-E', () => this.cycleEnemyFixture());
    this.input.keyboard?.on('keydown-ONE', () => this.setEnemyFixturePreset(0));
    this.input.keyboard?.on('keydown-TWO', () => this.setEnemyFixturePreset(1));
    this.input.keyboard?.on('keydown-THREE', () => this.setEnemyFixturePreset(2));

    // When BeastRush combo ends: disable puzzle input immediately & start transition cue
    this.comboSystem.onEnded(() => {
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

    // BeastRush combo timer update
    if (this.phaseController.phase === GamePhase.BeastRush && this.comboSystem.snapshot.active) {
      this.comboSystem.update(deltaSeconds);
      this.refreshBeastHUD();
    }

    // EnergyRush countdown timer update
    if (this.phaseController.phase === GamePhase.EnergyRush && this.energyTimer.snapshot.active) {
      this.energyTimer.update(deltaSeconds);
      this.refreshEnergyHUD();
    }

    // Autonomous Battle ticking
    if (
      this.phaseController.phase === GamePhase.Battle &&
      this.battleModel?.snapshot.status === 'Running' &&
      !(this.showcaseMode && this.showcasePaused)
    ) {
      this.battleTickAccumulator += delta;
      let ticked = false;
      const STEP_MS = SIMULATION_STEP * 1000;
      while (this.battleTickAccumulator >= STEP_MS && this.battleModel.snapshot.status === 'Running') {
        this.battleTickAccumulator -= STEP_MS;
        const before = this.battleModel.snapshot;
        const after = this.battleModel.step(SIMULATION_STEP);
        this.battleActionView?.render(after);
        this.battleActionView?.playTick(deriveBattleTickPresentation(before, after));
        ticked = true;
      }
      if (ticked) this.renderBattle();
      const status = this.battleModel.snapshot.status;
      if (status !== 'Running') {
        this.renderBattle();
        this.metrics.result(status, this.energyQueue.getAll());
        this.battleOutcome = status;
        this.phaseController.setPhase(GamePhase.Result);
      }
    }
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
    this.boardView?.setInputEnabled(false);
    this.isShowingTransitionCue = true;
    this.transitionCueTimer = 1.0;
    this.transitionCue?.show('ENERGY RUSH', 'Collect Energy for Battle');
    this.recentActionText = 'Beast Rush ended. Preparing Energy Rush...';
    this.refreshBeastHUD();
  }

  private finishTransitionCue(): void {
    this.isShowingTransitionCue = false;
    this.transitionCueTimer = 0;
    this.isShowingBattleSetupCue = false;
    this.battleSetupCueTimer = 0;
    this.transitionCue?.hide();
    this.phaseController.setPhase(GamePhase.EnergyRush);
  }

  private handleEnergyRushEnded(): void {
    this.boardView?.setInputEnabled(false);
    if (this.phaseController.setPhase(GamePhase.BattleSetup)) {
      this.isShowingBattleSetupCue = true;
      this.battleSetupCueTimer = 0.8;
      this.transitionCue?.show('BATTLE SETUP', 'Arrange your Beasts');
    }
  }

  private onPhaseChanged(phase: GamePhase): void {
    this.clearPuzzlePresentation();
    this.phaseStatusPanel?.setVisible(false);
    this.transitionCue?.hide();
    this.flowPanel?.destroy();
    this.showcaseBattleHud?.setVisible(false);
    this.battleSetupView?.destroy();
    this.battleActionView?.destroy();
    this.battleActionView = undefined;
    this.summary?.setVisible(false);
    this.showcasePaused = false;

    this.syncTopHud();

    if (phase === GamePhase.BeastRush) this.enterBeastRush();
    else if (phase === GamePhase.EnergyRush) this.enterEnergyRush();
    else if (phase === GamePhase.BattleSetup) this.enterBattleSetup();
    else if (phase === GamePhase.Battle) this.enterBattle();
    else this.enterResult();
  }

  private syncTopHud(): void {
    const beastCount = this.battleQueue.entries().reduce((s, e) => s + e.count, 0);
    const energyCount = this.energyQueue.getTotalCharges();
    const canPause = this.phaseController.phase === GamePhase.Battle && this.battleModel?.snapshot.status === 'Running';
    this.topHud?.update(
      this.phaseController.phase,
      beastCount,
      energyCount,
      this.showcaseMode,
      this.showcasePaused,
      canPause,
      this.showcaseCleanFrame,
    );
  }

  private enterBeastRush(): void {
    this.recentActionText = 'Match identical Beast pairs with ≤ 2 turns.';
    this.createPuzzleBoard(
      'BEAST RUSH',
      'Match 6×6 Beast pairs to recruit combat units into your battle queue.',
      ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f'],
      'Beast',
      (contentId, turns, midpoint) => this.onBeastMatch(contentId, turns, midpoint),
    );
    this.phaseStatusPanel?.setVisible(true);
    this.refreshBeastHUD();
    this.syncTopHud();
  }

  private enterEnergyRush(): void {
    this.recentActionText = 'Match identical Energy pairs. 12.0s countdown started!';
    this.createPuzzleBoard(
      'ENERGY RUSH',
      'Match 6×6 Energy pairs to store Frontline Heal charges for battle.',
      ['energy-a', 'energy-b', 'energy-c', 'energy-d', 'energy-e', 'energy-f'],
      'Energy',
      (contentId, _turns, midpoint) => this.onEnergyMatch(contentId, midpoint),
    );
    this.energyTimer.start();
    this.phaseStatusPanel?.setVisible(true);
    this.refreshEnergyHUD();
    this.syncTopHud();
  }

  private enterBattleSetup(): void {
    this.metrics.enterBattleSetup(this.battleQueue.entries());
    if (!this.formation) {
      const converted: DeployedUnit[] = [];
      for (const entry of [...this.battleQueue.entries()]) {
        const units = this.starConverter.bulk(entry.contentId, entry.count);
        converted.push(...units);
        this.battleQueue.consume(entry.contentId, entry.count);
      }
      this.formation = new BattleFormation(converted);
    }
    const activePreset = ENEMY_FIXTURE_PRESETS[this.enemyFixturePresetIndex];
    this.battleSetupView = new BattleSetupView(
      this,
      this.formation,
      activePreset.fixtures,
      () => this.storedEnergyLines(),
      () => this.startBattle(),
      () => this.metrics.arrangementChanged(),
      activePreset.name,
      () => this.cycleEnemyFixture(),
    );
    this.battleSetupView.render();
    this.syncTopHud();
  }

  private setEnemyFixturePreset(index: number): void {
    this.enemyFixturePresetIndex =
      ((index % ENEMY_FIXTURE_PRESETS.length) + ENEMY_FIXTURE_PRESETS.length) %
      ENEMY_FIXTURE_PRESETS.length;
    if (this.phaseController.phase === GamePhase.BattleSetup && this.formation) {
      this.battleSetupView?.destroy();
      const activePreset = ENEMY_FIXTURE_PRESETS[this.enemyFixturePresetIndex];
      this.battleSetupView = new BattleSetupView(
        this,
        this.formation,
        activePreset.fixtures,
        () => this.storedEnergyLines(),
        () => this.startBattle(),
        () => this.metrics.arrangementChanged(),
        activePreset.name,
        () => this.cycleEnemyFixture(),
      );
      this.battleSetupView.render();
    }
  }

  private cycleEnemyFixture(): void {
    this.setEnemyFixturePreset(this.enemyFixturePresetIndex + 1);
  }

  private enterBattle(): void {
    if (!this.formation) return;
    const activePreset = ENEMY_FIXTURE_PRESETS[this.enemyFixturePresetIndex];
    this.battleModel = new AutonomousBattleModel(
      this.formation,
      activePreset.fixtures,
      P1V11C_ARCHETYPE_RULES,
    );
    this.battleTickAccumulator = 0;
    this.battleActionView = new BattleActionView(this, this.layout.leftX, this.layout.leftY);
    this.battleActionView.render(this.battleModel.snapshot);
    this.renderBattle();
    this.syncTopHud();
  }

  private enterResult(): void {
    this.summary?.render(this.metrics.snapshot, this.battleOutcome);
    this.summary?.setVisible(true);
    this.syncTopHud();
  }

  private castEnergy(energyId: string): void {
    if (this.phaseController.phase !== GamePhase.Battle || !this.battleModel || this.battleModel.snapshot.status !== 'Running') return;
    const before = this.battleModel.snapshot;
    const armyHp = before.units.reduce((sum, unit) => sum + unit.currentHp, 0);
    const success = this.battleModel.castFrontlineHeal(energyId, this.energyQueue);
    if (success) {
      const after = this.battleModel.snapshot;
      this.metrics.successfulCast(armyHp, before.enemyHp);
      this.battleActionView?.render(after);
      this.battleActionView?.playHeal(deriveBattleHealPresentation(before, after));
      this.renderBattle();
      this.syncTopHud();
    }
  }

  private renderBattle(): void {
    const battle = this.battleModel?.snapshot;
    if (!battle) return;
    const isRunning = battle.status === 'Running';
    const energyEntries = this.energyQueue.getAll().filter((entry) => entry.charges > 0);
    const frontline = this.battleModel?.frontmostAliveUnit();
    this.battleActionView?.render(battle);

    const frontlineDisplay = frontline
      ? `${(frontline.beastId.split('-').at(-1) ?? frontline.beastId).toUpperCase()} · ${frontline.role} · ${formatNumber(frontline.currentHp)}/${formatNumber(frontline.maxHp)} HP`
      : 'No living frontline unit';

    if (this.showcaseMode) {
      this.flowPanel?.destroy();
      this.showcaseBattleHud?.setVisible(true);
      this.showcaseBattleHud?.render(
        battle,
        energyEntries,
        frontlineDisplay,
        (energyId) => this.castEnergy(energyId),
        this.showcasePaused,
      );
    } else {
      this.showcaseBattleHud?.setVisible(false);
      const energyRows =
        isRunning && energyEntries.length > 0
          ? energyEntries.map((entry) => ({
              label: `${entry.energyId.toUpperCase()}  ·  ${entry.charges} charge${entry.charges === 1 ? '' : 's'}`,
              actionLabel: 'CAST HEAL',
              onAction: () => this.castEnergy(entry.energyId),
            }))
          : undefined;

      this.flowPanel?.render(
        'AUTONOMOUS BATTLE',
        [
          `STATUS: ${battle.status} · Tick ${battle.elapsedTicks} · Living: ${battle.enemies.filter((enemy) => enemy.currentHp > 0).length}/${battle.enemies.length}`,
          `ENEMY SQUAD HP: ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}`,
          `FRONTLINE: ${frontlineDisplay}`,
          '',
          'STORED ENERGY (TIMED CAST)',
          'Each Energy ID casts a Frontline Heal.',
          `Enemy pressure: ${formatNumber(battle.enemyDamage)} total dmg / tick.`,
          'Battle ticks automatically every 1.0 second.',
          ...(isRunning
            ? energyEntries.length > 0
              ? []
              : ['No stored Energy charges to cast.']
            : ['Battle ended.']),
        ],
        null,
        undefined,
        undefined,
        energyRows,
      );
    }
    this.syncTopHud();
  }

  private toggleShowcaseMode(): void {
    this.showcaseMode = !this.showcaseMode;
    this.showcasePaused = false;
    this.showcaseCleanFrame = false;
    if (this.phaseController.phase === GamePhase.Battle) {
      this.renderBattle();
    }
    this.syncTopHud();
  }

  private toggleShowcasePause(): void {
    if (!this.showcaseMode || this.phaseController.phase !== GamePhase.Battle) return;
    this.showcasePaused = !this.showcasePaused;
    this.renderBattle();
    this.syncTopHud();
  }

  private toggleShowcaseCleanFrame(): void {
    if (!this.showcaseMode) return;
    this.showcaseCleanFrame = !this.showcaseCleanFrame;
    this.syncTopHud();
  }

  private createPuzzleBoard(
    title: string,
    subtitle: string,
    contentIds: string[],
    type: 'Beast' | 'Energy',
    onMatch: (contentId: string, turns: number, midpoint?: { x: number; y: number }) => void,
  ): void {
    const placement = this.layout.getPuzzleBoardPlacement(RuleConfig.boardSize);

    this.boardTitle = this.add.text(placement.startX, placement.startY - 38, title, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '20px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    });

    this.boardSubtitle = this.add.text(
      placement.startX,
      placement.startY + placement.totalSize + 14,
      subtitle,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '12px',
        color: HudTokens.colors.textMuted,
      },
    );

    this.board = this.boardGenerator.generate(RuleConfig.boardSize, contentIds, Math.random, type);
    this.boardView = new BoardView(
      this,
      this.board,
      this.matcher,
      placement.startX,
      placement.startY,
      placement.cellSize,
      placement.gap,
      {
        onInvalidSelection: () => {
          if (this.phaseController.phase === (type === 'Beast' ? GamePhase.BeastRush : GamePhase.EnergyRush)) {
            this.metrics.invalid();
          }
        },
        onMatchRemoved: (result, contentId, midpoint) => onMatch(contentId, result.turnCount, midpoint),
      },
    );
    this.boardView.render();
  }

  private onBeastMatch(contentId: string, turns: number, midpoint?: { x: number; y: number }): void {
    if (this.phaseController.phase !== GamePhase.BeastRush || !this.board || !this.boardView) return;
    this.comboSystem.registerValidMatch();
    this.metrics.beastMatch();
    this.battleQueue.addBeastMatch(contentId);
    const recovery = this.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();

    const def = getIconDefinition(contentId);
    const reshuffle = recovery.reshuffled ? ` (Reshuffled: ${recovery.attempts} attempt(s))` : '';
    this.recentActionText = `Matched ${def.name} (${def.letter}) in ${turns} turn(s). Queue +1.${reshuffle}`;

    this.refreshBeastHUD();
    this.syncTopHud();

    // Consequence feedback to HUD
    if (midpoint) {
      const target = this.phaseStatusPanel?.getQueueItemTarget(contentId) ?? {
        x: this.layout.rightX + 40,
        y: this.layout.rightY + 360,
      };
      FeedbackEffects.flyToken(this, midpoint.x, midpoint.y, target.x, target.y, contentId, () => {
        this.phaseStatusPanel?.pulseQueueRow(contentId);
      });
      FeedbackEffects.floatText(this, midpoint.x, midpoint.y - 15, '+0.3s', '#fbbf24');
    }
    this.phaseStatusPanel?.pulseCombo();
    this.phaseStatusPanel?.pulseTimer(true);

    // Deadlock reshuffle notification
    if (recovery.reshuffled) {
      this.boardView.pulseBoard();
      FeedbackEffects.showToast(
        this,
        this.layout.leftCenter.x,
        this.layout.leftCenter.y,
        '🔄 BOARD RESHUFFLED (Auto-Recovery)',
        '#fbbf24',
      );
    }
  }

  private onEnergyMatch(contentId: string, midpoint?: { x: number; y: number }): void {
    if (this.phaseController.phase !== GamePhase.EnergyRush || !this.board || !this.boardView) return;
    this.energyQueue.addCharge(contentId);
    this.metrics.energyMatch();
    const recovery = this.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();

    const def = getIconDefinition(contentId);
    const reshuffle = recovery.reshuffled ? ` (Reshuffled: ${recovery.attempts} attempt(s))` : '';
    this.recentActionText = `Matched ${def.name} (${def.letter}). Stored charge +1.${reshuffle}`;

    this.refreshEnergyHUD();
    this.syncTopHud();

    // Consequence feedback to HUD
    if (midpoint) {
      const target = this.phaseStatusPanel?.getQueueItemTarget(contentId) ?? {
        x: this.layout.rightX + 40,
        y: this.layout.rightY + 360,
      };
      FeedbackEffects.flyToken(this, midpoint.x, midpoint.y, target.x, target.y, contentId, () => {
        this.phaseStatusPanel?.pulseQueueRow(contentId);
      });
      FeedbackEffects.floatText(this, midpoint.x, midpoint.y - 15, '+1 Charge', '#38bdf8');
    }

    // Deadlock reshuffle notification
    if (recovery.reshuffled) {
      this.boardView.pulseBoard();
      FeedbackEffects.showToast(
        this,
        this.layout.leftCenter.x,
        this.layout.leftCenter.y,
        '🔄 BOARD RESHUFFLED (Auto-Recovery)',
        '#38bdf8',
      );
    }
  }

  private storedEnergyLines(): string {
    const entries = this.energyQueue.getAll();
    if (!entries.length) return 'No stored Energy charges.\nTotal: 0';
    return `${entries.map((entry) => `${entry.energyId}: ${entry.charges}`).join('\n')}\nTotal: ${this.energyQueue.getTotalCharges()}`;
  }

  private refreshBeastHUD(): void {
    if (this.phaseController.phase !== GamePhase.BeastRush) return;
    const combo = this.comboSystem.snapshot;
    this.phaseStatusPanel?.render({
      phaseTitle: 'BEAST RUSH',
      phaseSubtitle: 'Match 6×6 Beast pairs with ≤ 2 turns to recruit combat units',
      timerSeconds: combo.remainingSeconds,
      timerLabel: 'Combo Timer',
      timerSubtext: '+0.3s per match · 12.0s cap',
      statusBadge: {
        text: combo.active ? 'ACTIVE' : 'READY',
        active: combo.active,
      },
      matchCount: combo.count,
      queueTitle: 'Beast Queue',
      queueItems: this.battleQueue.entries().map((e) => {
        const def = getIconDefinition(e.contentId);
        return {
          id: e.contentId,
          name: `${def.name} (${def.letter})`,
          count: e.count,
        };
      }),
      recentAction: this.recentActionText,
    });
  }

  private refreshEnergyHUD(): void {
    if (this.phaseController.phase !== GamePhase.EnergyRush) return;
    const remaining = this.energyTimer.snapshot.remainingSeconds;
    this.phaseStatusPanel?.render({
      phaseTitle: 'ENERGY RUSH',
      phaseSubtitle: 'Match 6×6 Energy pairs to collect Frontline Heal charges',
      timerSeconds: remaining,
      timerLabel: 'Countdown',
      timerSubtext: '12.0s timed lock · Prepare for battle',
      statusBadge: {
        text: 'COUNTDOWN',
        active: true,
      },
      matchCount: this.metrics.snapshot.energyMatches,
      queueTitle: 'Stored Energy',
      queueItems: this.energyQueue.getAll().map((e) => {
        const def = getIconDefinition(e.energyId);
        return {
          id: e.energyId,
          name: `${def.name} (${def.letter})`,
          count: e.charges,
        };
      }),
      recentAction: this.recentActionText,
    });
  }

  private startBattle(): void {
    if (this.phaseController.phase !== GamePhase.BattleSetup || !this.formation?.allPlaced) return;
    this.metrics.startBattle(this.energyQueue.getAll(), this.formation.units);
    this.phaseController.setPhase(GamePhase.Battle);
  }

  private clearPuzzlePresentation(): void {
    this.boardView?.setInputEnabled(false);
    this.boardView?.destroy();
    this.boardView = undefined;
    this.board = undefined;
    this.boardTitle?.destroy();
    this.boardTitle = undefined;
    this.boardSubtitle?.destroy();
    this.boardSubtitle = undefined;
  }

  private restartRun(): void {
    if (this.phaseController.phase !== GamePhase.Result) return;

    this.summary?.setVisible(false);
    this.battleTickAccumulator = 0;
    this.showcasePaused = false;
    this.showcaseCleanFrame = false;
    this.isShowingTransitionCue = false;
    this.transitionCueTimer = 0;
    this.isShowingBattleSetupCue = false;
    this.battleSetupCueTimer = 0;
    this.transitionCue?.hide();
    this.comboSystem.reset();
    this.energyTimer.reset();
    this.battleQueue.clear();
    this.energyQueue.reset();
    this.formation = undefined;
    this.battleActionView?.destroy();
    this.battleActionView = undefined;
    this.battleModel = undefined;
    this.battleOutcome = undefined;
    this.metrics.reset();
    this.cycleEnemyFixture();
    this.phaseController.setPhase(GamePhase.BeastRush);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
