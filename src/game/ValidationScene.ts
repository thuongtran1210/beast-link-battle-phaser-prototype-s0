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
import { AutonomousBattleModel } from './battle/AutonomousBattleModel';
import { runP1S3Checks } from './battle/P1S3Checks';
import { runP1S4Checks } from './battle/P1S4Checks';
import { deriveBattleHealPresentation, deriveBattleTickPresentation } from './battle/BattlePresentation';
import { runP1V4Checks } from './battle/P1V4Checks';
import { runP1V5Checks } from './battle/P1V5Checks';
import { P1V7_ENEMY_FIXTURES, runP1V7Checks } from './battle/P1V7Checks';
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
import { HUDView } from './ui/HUDView';
import { EnergyHUDView } from './ui/EnergyHUDView';
import { TransitionCueView } from './ui/TransitionCueView';
import { PrototypeFlowPanel } from './ui/PrototypeFlowPanel';
import { BattleSetupView } from './ui/BattleSetupView';
import { SessionSummaryView } from './ui/SessionSummaryView';
import { BattleActionView } from './ui/BattleActionView';

/** P1-V3: Experimental Variant — Beast Rush 12s / Energy Rush 12s Timing. */
export class ValidationScene extends Phaser.Scene {
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

  // P1-V1/V3 Transition state
  private transitionCueTimer = 0;
  private isShowingTransitionCue = false;
  private battleSetupCueTimer = 0;
  private isShowingBattleSetupCue = false;

  private phaseText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private boardTitle?: Phaser.GameObjects.Text;
  private board?: BoardModel;
  private boardView?: BoardView;
  private hud?: HUDView;
  private energyHud?: EnergyHUDView;
  private transitionCue?: TransitionCueView;
  private flowPanel?: PrototypeFlowPanel;
  private battleSetupView?: BattleSetupView;
  private battleActionView?: BattleActionView;
  private summary?: SessionSummaryView;
  private footerText?: Phaser.GameObjects.Text;

  constructor() {
    super('ValidationScene');
  }

  create(): void {
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
    runP1V1Checks();
    runP1V2Checks();
    runP1V3Checks();

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, 42, width, 84, 0x18212b).setOrigin(0.5);
    this.add.text(28, 18, 'Beast Link Battle', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.add.text(28, 50, 'P1-V7 Combat Pressure · Integrated Battle Setup', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1',
    });
    this.phaseText = this.add.text(650, 26, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '23px',
      color: '#fbbf24',
      fontStyle: 'bold',
    });

    this.hud = new HUDView(this, 600, 145);
    this.energyHud = new EnergyHUDView(this, 600, 145);
    this.transitionCue = new TransitionCueView(this, width / 2, height / 2);
    this.flowPanel = new PrototypeFlowPanel(this, 600, 145);
    this.summary = new SessionSummaryView(this, width / 2, height / 2, () => this.restartRun());
    this.footerText = this.add
      .text(
        width / 2,
        height - 36,
        'P1-V7 Experimental: 6-enemy pressure fixture (160 HP / 3 DMG each) + integrated Setup/Battle field.',
        { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#66737f' }
      )
      .setOrigin(0.5, 1);

    this.phaseController.subscribe((phase) => this.onPhaseChanged(phase));

    // When BeastRush combo ends: disable puzzle input immediately & start transition cue
    this.comboSystem.onEnded(() => {
      this.handleBeastRushEnded();
    });

    // When EnergyRush countdown reaches 0: disable input and transition to BattleSetup
    this.energyTimer.onEnded(() => {
      this.handleEnergyRushEnded();
    });
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    // Hide the Battle Setup cue after a short visual-only confirmation window.
    // BattleSetup is already the active phase underneath; this does not alter gameplay timing.
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
    if (this.phaseController.phase === GamePhase.Battle && this.battleModel?.snapshot.status === 'Running') {
      this.battleTickAccumulator += delta;
      let ticked = false;
      while (this.battleTickAccumulator >= 1000 && this.battleModel.snapshot.status === 'Running') {
        this.battleTickAccumulator -= 1000;
        const before = this.battleModel.snapshot;
        const after = this.battleModel.tick();
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

  private handleBeastRushEnded(): void {
    // 1. Disable Beast puzzle input immediately
    this.boardView?.setInputEnabled(false);
    // 2. Start 1.0s transition cue
    this.isShowingTransitionCue = true;
    this.transitionCueTimer = 1.0;
    this.transitionCue?.show('ENERGY RUSH', 'Collect Energy for Battle');
    this.statusText?.setText('Beast Rush ended. Preparing Energy Rush...');
  }

  private finishTransitionCue(): void {
    this.isShowingTransitionCue = false;
    this.transitionCueTimer = 0;
    this.isShowingBattleSetupCue = false;
    this.battleSetupCueTimer = 0;
    this.transitionCue?.hide();
    // Transition to EnergyRush
    this.phaseController.setPhase(GamePhase.EnergyRush);
  }

  private handleEnergyRushEnded(): void {
    // Hard-lock Energy puzzle input before leaving the phase.
    this.boardView?.setInputEnabled(false);

    // Enter BattleSetup immediately, then show a short visual-only phase cue over it.
    // This preserves the automatic timeout rule while making the phase change readable.
    if (this.phaseController.setPhase(GamePhase.BattleSetup)) {
      this.isShowingBattleSetupCue = true;
      this.battleSetupCueTimer = 0.8;
      this.transitionCue?.show('BATTLE SETUP', 'Arrange your Beasts');
    }
  }

  private onPhaseChanged(phase: GamePhase): void {
    this.phaseText?.setText(`Current Phase: ${phase}`);
    this.clearPuzzlePresentation();
    this.hud?.setVisible(false);
    this.energyHud?.setVisible(false);
    this.transitionCue?.hide();
    this.flowPanel?.destroy();
    this.battleSetupView?.destroy();
    this.battleActionView?.destroy();
    this.battleActionView = undefined;
    this.summary?.setVisible(false);
    this.footerText?.setVisible(phase !== GamePhase.Result);

    if (phase === GamePhase.BeastRush) this.enterBeastRush();
    else if (phase === GamePhase.EnergyRush) this.enterEnergyRush();
    else if (phase === GamePhase.BattleSetup) this.enterBattleSetup();
    else if (phase === GamePhase.Battle) this.enterBattle();
    else this.enterResult();
  }

  private enterBeastRush(): void {
    this.createPuzzleBoard(
      'Beast Rush',
      ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f'],
      'Beast',
      (contentId, turns) => this.onBeastMatch(contentId, turns)
    );
    this.hud?.setVisible(true);
    this.refreshBeastHUD();
  }

  private enterEnergyRush(): void {
    // Create fresh Energy-only 6x6 board
    this.createPuzzleBoard(
      'Energy Rush',
      ['energy-a', 'energy-b', 'energy-c', 'energy-d', 'energy-e', 'energy-f'],
      'Energy',
      (contentId) => this.onEnergyMatch(contentId)
    );
    // Start visible 12.0s countdown & enable Energy puzzle input
    this.energyTimer.start();
    this.energyHud?.setVisible(true);
    this.refreshEnergyHUD();
    this.statusText?.setText('Match Energy pairs! 12.0s countdown started.');
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
    this.battleSetupView = new BattleSetupView(
      this,
      this.formation,
      P1V7_ENEMY_FIXTURES,
      () => this.storedEnergyLines(),
      () => this.startBattle(),
      () => this.metrics.arrangementChanged()
    );
    this.battleSetupView.render();
  }

  private enterBattle(): void {
    if (!this.formation) return;
    this.battleModel = new AutonomousBattleModel(this.formation, P1V7_ENEMY_FIXTURES);
    this.battleTickAccumulator = 0;
    this.battleActionView = new BattleActionView(this, 18, 105);
    this.battleActionView.render(this.battleModel.snapshot);
    this.renderBattle();
  }

  private enterResult(): void {
    this.summary?.render(this.metrics.snapshot, this.battleOutcome);
    this.summary?.setVisible(true);
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
    }
  }

  private renderBattle(): void {
    const battle = this.battleModel?.snapshot;
    if (!battle) return;
    const isRunning = battle.status === 'Running';
    const energyEntries = this.energyQueue.getAll().filter((entry) => entry.charges > 0);
    const energyRows =
      isRunning && energyEntries.length > 0
        ? energyEntries.map((entry) => ({
            label: `${entry.energyId.toUpperCase()}  ·  ${entry.charges} charge${entry.charges === 1 ? '' : 's'}`,
            actionLabel: 'CAST HEAL',
            onAction: () => this.castEnergy(entry.energyId),
          }))
        : undefined;
    const frontline = this.battleModel?.frontmostAliveUnit();
    this.battleActionView?.render(battle);

    this.flowPanel?.render(
      'AUTONOMOUS BATTLE',
      [
        `STATUS: ${battle.status}    Tick: ${battle.elapsedTicks}`,
        `ENEMY SQUAD HP: ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}    Living: ${battle.enemies.filter((enemy) => enemy.currentHp > 0).length}/${battle.enemies.length}`,
        '',
        'CURRENT FRONTLINE',
        frontline
          ? `${(frontline.beastId.split('-').at(-1) ?? frontline.beastId).toUpperCase()} · ${frontline.role} · ${formatNumber(frontline.currentHp)} / ${formatNumber(frontline.maxHp)}`
          : 'No alive player unit.',
        '',
        'LOCKED FORMATION (READ-ONLY)',
        ...battle.units.map(
          (unit) =>
            `${unit.slotId}: ${(unit.beastId.split('-').at(-1) ?? unit.beastId).toUpperCase()} · ${unit.role} · ${unit.star}★ — HP ${formatNumber(unit.currentHp)} / ${formatNumber(unit.maxHp)}`
        ),
        '',
        'STORED ENERGY (TIMED CAST)',
        '',
        isRunning
          ? energyEntries.length > 0
            ? 'Each Energy ID has its own aligned Frontline Heal action.'
            : 'No stored Energy charges to cast.'
          : 'Battle ended.',
        `Enemy pressure: ${formatNumber(battle.enemyDamage)} total damage / tick.`,
        'Battle ticks automatically every 1.0 second.',
      ],
      null,
      undefined,
      undefined,
      energyRows
    );
  }

  private createPuzzleBoard(
    title: string,
    contentIds: string[],
    type: 'Beast' | 'Energy',
    onMatch: (contentId: string, turns: number) => void
  ): void {
    const cellSize = 68,
      gap = 7;
    const totalSize = RuleConfig.boardSize * cellSize + (RuleConfig.boardSize - 1) * gap;
    const startX = 300 - totalSize / 2,
      startY = 150;
    this.boardTitle = this.add.text(startX, startY - 34, title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#18212b',
      fontStyle: 'bold',
    });
    this.statusText = this.add.text(
      startX,
      startY + totalSize + 14,
      type === 'Beast' ? 'Match identical Beasts.' : 'Match identical Energy.',
      { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#44525f' }
    );
    this.board = this.boardGenerator.generate(RuleConfig.boardSize, contentIds, Math.random, type);
    this.boardView = new BoardView(this, this.board, this.matcher, startX, startY, cellSize, gap, {
      onInvalidSelection: () => {
        if (this.phaseController.phase === (type === 'Beast' ? GamePhase.BeastRush : GamePhase.EnergyRush)) {
          this.metrics.invalid();
        }
      },
      onMatchRemoved: (result, contentId) => onMatch(contentId, result.turnCount),
    });
    this.boardView.render();
  }

  private onBeastMatch(contentId: string, turns: number): void {
    if (this.phaseController.phase !== GamePhase.BeastRush || !this.board || !this.boardView) return;
    this.comboSystem.registerValidMatch();
    this.metrics.beastMatch();
    this.battleQueue.addBeastMatch(contentId);
    const recovery = this.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();
    this.refreshBeastHUD();
    const reshuffle = recovery.reshuffled ? ` Board reshuffled after ${recovery.attempts} attempt(s).` : '';
    this.statusText?.setText(
      `Matched ${contentId.split('-').at(-1)?.toUpperCase() ?? contentId} in ${turns} turn(s). Queue +1.${reshuffle}`
    );
  }

  private onEnergyMatch(contentId: string): void {
    if (this.phaseController.phase !== GamePhase.EnergyRush || !this.board || !this.boardView) return;
    this.energyQueue.addCharge(contentId);
    this.metrics.energyMatch();
    const recovery = this.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();
    this.refreshEnergyHUD();
    const reshuffle = recovery.reshuffled ? ` Board reshuffled after ${recovery.attempts} attempt(s).` : '';
    this.statusText?.setText(
      `Matched ${contentId.split('-').at(-1)?.toUpperCase() ?? contentId}. Stored charge +1.${reshuffle}`
    );
  }

  private storedEnergyLines(): string {
    const entries = this.energyQueue.getAll();
    if (!entries.length) return 'No stored Energy charges.\nTotal: 0';
    return `${entries.map((entry) => `${entry.energyId}: ${entry.charges}`).join('\n')}\nTotal: ${this.energyQueue.getTotalCharges()}`;
  }

  private refreshBeastHUD(): void {
    if (this.phaseController.phase === GamePhase.BeastRush) {
      this.hud?.render(this.comboSystem.snapshot, this.battleQueue.entries());
    }
  }

  private refreshEnergyHUD(): void {
    if (this.phaseController.phase === GamePhase.EnergyRush) {
      this.energyHud?.render(this.energyTimer.snapshot.remainingSeconds, this.storedEnergyLines());
    }
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
    this.statusText?.destroy();
    this.statusText = undefined;
  }

  private restartRun(): void {
    if (this.phaseController.phase !== GamePhase.Result) return;

    // Give immediate visual feedback that Restart was accepted.
    this.summary?.setVisible(false);
    this.battleTickAccumulator = 0;
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
    this.phaseController.setPhase(GamePhase.BeastRush);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
