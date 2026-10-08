import Phaser from 'phaser';
import type { LandscapeLayout } from '../ui/layout/LandscapeLayout';
import type { PhaseStatusPanel } from '../ui/PhaseStatusPanel';
import type { GameTopHUD } from '../ui/GameTopHUD';
import type { BoardModel } from '../puzzle/BoardModel';
import type { BoardView } from '../ui/BoardView';
import type { BoardGenerator } from '../puzzle/BoardGenerator';
import type { OnetMatcher, MatchResult } from '../puzzle/OnetMatcher';
import type { DeadlockResolver } from '../puzzle/DeadlockResolver';
import type { BeastRushPhaseTimer } from '../combo/BeastRushPhaseTimer';
import type { ComboQualityTracker } from '../combo/ComboQualityTracker';
import type { EnergyRushTimer } from '../energy/EnergyRushTimer';
import type { BattleQueue } from '../queue/BattleQueue';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { SessionMetrics } from '../metrics/SessionMetrics';
import type { PhaseController } from '../state/PhaseController';
import { GamePhase } from '../state/GamePhase';
import { RuleConfig } from '../config/RuleConfig';
import { HudTokens } from '../ui/layout/HudTokens';
import { FeedbackEffects } from '../ui/feedback/FeedbackEffects';
import { beastDisplayName } from '../ui/icons/UnitIconRegistry';
import { compactEventLabel, type BeastRushEvent } from '../ui/BeastRushHudPresentation';
import { energyRushInventory, energyRushMatchLabel, type EnergyRushInventoryEntry } from '../ui/EnergyRushPresentation';
import { STRATEGIC_ENERGY } from '../energy/TacticalEnergyCatalog';
import { BoardView as ConcreteBoardView } from '../ui/BoardView';

export interface PuzzlePhaseContext {
  scene: Phaser.Scene;
  layout: LandscapeLayout;
  phaseStatusPanel?: PhaseStatusPanel;
  topHud?: GameTopHUD;
  boardGenerator: BoardGenerator;
  matcher: OnetMatcher;
  deadlockResolver: DeadlockResolver;
  beastRushTimer: BeastRushPhaseTimer;
  comboQuality: ComboQualityTracker;
  energyTimer: EnergyRushTimer;
  battleQueue: BattleQueue;
  energyQueue: EnergyQueue;
  metrics: SessionMetrics;
  phaseController: PhaseController;
  getEnergyCarryIn: () => number;
  syncTopHud: () => void;
}

export class PuzzlePhaseCoordinator {
  private board?: BoardModel;
  private boardView?: BoardView;
  private boardTitle?: Phaser.GameObjects.Text;
  private boardSubtitle?: Phaser.GameObjects.Text;
  private beastRushEvent: BeastRushEvent = { kind: 'idle' };
  private recentActionText = '';

  constructor(private readonly ctx: PuzzlePhaseContext) {}

  get currentBoard(): BoardModel | undefined {
    return this.board;
  }

  get currentBoardView(): BoardView | undefined {
    return this.boardView;
  }

  setRecentAction(text: string): void {
    this.recentActionText = text;
  }

  resetBeastRushEvent(): void {
    this.beastRushEvent = { kind: 'idle' };
  }

  createPuzzleBoard(
    title: string,
    subtitle: string,
    contentIds: string[],
    type: 'Beast' | 'Energy',
    onMatch: (contentId: string, turns: number, midpoint?: { x: number; y: number }) => void,
  ): void {
    const placement = this.ctx.layout.getPuzzleBoardPlacement(RuleConfig.boardSize);

    const phaseTitleColor = type === 'Energy' ? HudTokens.colors.textBlue : HudTokens.colors.textGold;
    this.boardTitle?.destroy();
    this.boardTitle = this.ctx.scene.add.text(placement.startX, placement.startY - 40, title, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '22px',
      color: phaseTitleColor,
      fontStyle: 'bold',
      letterSpacing: 1,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    });

    this.boardSubtitle?.destroy();
    this.boardSubtitle = this.ctx.scene.add.text(
      placement.startX,
      placement.startY + placement.totalSize + 14,
      subtitle,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '11px',
        color: HudTokens.colors.textSecondary,
      },
    );

    if (this.ctx.layout.compact) {
      this.boardTitle.setVisible(false);
      this.boardSubtitle.setVisible(false);
    }

    this.board = this.ctx.boardGenerator.generate(RuleConfig.boardSize, contentIds, Math.random, type);
    this.boardView?.destroy();
    this.boardView = new ConcreteBoardView(
      this.ctx.scene,
      this.board,
      this.ctx.matcher,
      placement.startX,
      placement.startY,
      placement.cellSize,
      placement.gap,
      {
        onInvalidSelection: () => {
          if (this.ctx.phaseController.phase === (type === 'Beast' ? GamePhase.BeastRush : GamePhase.EnergyRush)) {
            this.ctx.metrics.invalid();
            if (type === 'Beast') {
              this.ctx.comboQuality.breakStreak();
              const quality = this.ctx.comboQuality.snapshot;
              this.ctx.metrics.comboQuality(quality.currentStreak, quality.bestStreak, quality.breakCount);
              this.beastRushEvent = { kind: 'invalid' };
              this.recentActionText = compactEventLabel(this.beastRushEvent);
              this.refreshBeastHUD();
            }
          }
        },
        onMatchRemoved: (result: MatchResult, contentId: string, midpoint?: { x: number; y: number }) => onMatch(contentId, result.turnCount, midpoint),
      },
    );
    this.boardView.render();
  }

  onBeastMatch(contentId: string, turns: number, midpoint?: { x: number; y: number }): void {
    if (this.ctx.phaseController.phase !== GamePhase.BeastRush || !this.board || !this.boardView) return;
    this.ctx.beastRushTimer.start();
    const combo = this.ctx.comboQuality.registerValidMatch();
    this.ctx.metrics.comboQuality(combo.currentStreak, combo.bestStreak, combo.breakCount);
    this.ctx.metrics.beastMatch();
    this.ctx.battleQueue.addBeastMatch(contentId);
    const recovery = this.ctx.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();

    this.beastRushEvent = recovery.reshuffled ? { kind: 'reshuffle' } : { kind: 'match', beastName: beastDisplayName(contentId), comboStreak: combo.currentStreak };
    this.recentActionText = compactEventLabel(this.beastRushEvent);

    this.refreshBeastHUD();
    this.ctx.syncTopHud();

    // Consequence feedback to HUD
    if (midpoint) {
      const target = this.ctx.phaseStatusPanel?.getQueueItemTarget(contentId) ?? {
        x: this.ctx.layout.rightX + 40,
        y: this.ctx.layout.rightY + 360,
      };
      FeedbackEffects.flyToken(this.ctx.scene, midpoint.x, midpoint.y, target.x, target.y, contentId, () => {
        this.ctx.phaseStatusPanel?.pulseQueueRow(contentId);
      });
    }
    this.ctx.phaseStatusPanel?.pulseCombo();
    this.ctx.phaseStatusPanel?.pulseTimer(false);

    // Deadlock reshuffle notification
    if (recovery.reshuffled) {
      this.boardView.pulseBoard();
      FeedbackEffects.showToast(
        this.ctx.scene,
        this.ctx.layout.leftCenter.x,
        this.ctx.layout.leftCenter.y,
        '🔄 BOARD RESHUFFLED (Auto-Recovery)',
        '#fbbf24',
      );
    }
  }

  onEnergyMatch(contentId: string, midpoint?: { x: number; y: number }): void {
    if (this.ctx.phaseController.phase !== GamePhase.EnergyRush || !this.board || !this.boardView) return;
    this.ctx.energyTimer.start();
    this.ctx.energyQueue.addCharge(contentId);
    this.ctx.metrics.energyMatch();
    const recovery = this.ctx.deadlockResolver.ensurePlayable(this.board);
    this.boardView.render();

    const reshuffle = recovery.reshuffled ? ` (Reshuffled: ${recovery.attempts} attempt(s))` : '';
    this.recentActionText = `${energyRushMatchLabel(contentId)}.${reshuffle}`;

    this.refreshEnergyHUD();
    this.ctx.syncTopHud();

    // Consequence feedback to HUD
    if (midpoint) {
      const target = this.ctx.phaseStatusPanel?.getQueueItemTarget(contentId) ?? {
        x: this.ctx.layout.rightX + 40,
        y: this.ctx.layout.rightY + 360,
      };
      FeedbackEffects.flyToken(this.ctx.scene, midpoint.x, midpoint.y, target.x, target.y, contentId, () => {
        this.ctx.phaseStatusPanel?.pulseQueueRow(contentId);
      });
    }

    // Deadlock reshuffle notification
    if (recovery.reshuffled) {
      this.boardView.pulseBoard();
      FeedbackEffects.showToast(
        this.ctx.scene,
        this.ctx.layout.leftCenter.x,
        this.ctx.layout.leftCenter.y,
        '🔄 BOARD RESHUFFLED (Auto-Recovery)',
        '#38bdf8',
      );
    }
  }

  refreshBeastHUD(): void {
    if (this.ctx.phaseController.phase !== GamePhase.BeastRush) return;
    const phaseTimer = this.ctx.beastRushTimer.snapshot;
    const combo = this.ctx.comboQuality.snapshot;
    const isReady = this.ctx.beastRushTimer.isReady;
    this.ctx.phaseStatusPanel?.render({
      phaseTitle: 'BEAST RUSH',
      phaseSubtitle: '',
      timerSeconds: phaseTimer.remainingSeconds,
      timerLabel: 'Rush',
      timerSubtext: isReady ? 'READY' : '',
      statusBadge: {
        text: isReady ? 'READY' : combo.active ? `×${combo.currentStreak}` : '×0',
        active: combo.active,
      },
      matchCount: this.ctx.metrics.snapshot.beastMatches,
      queueTitle: 'Recruited Beasts',
      queueItems: this.ctx.battleQueue.entries().map((e) => ({
        id: e.contentId,
        name: beastDisplayName(e.contentId),
        count: e.count,
      })),
      recentAction: this.recentActionText,
      beastRushHud: true,
      comboCurrent: combo.currentStreak,
      comboBest: combo.bestStreak,
      isReady,
    });
  }

  refreshEnergyHUD(): void {
    if (this.ctx.phaseController.phase !== GamePhase.EnergyRush) return;
    const isReady = this.ctx.energyTimer.isReady;
    const remaining = this.ctx.energyTimer.snapshot.remainingSeconds;
    const total = this.ctx.energyQueue.getTotalCharges();
    const carryIn = this.ctx.getEnergyCarryIn();
    const queueTitle = carryIn > 0 ? `STORED ×${total} (CARRY IN ×${carryIn})` : `STORED ×${total}`;
    this.ctx.phaseStatusPanel?.render({
      energyCarryIn: carryIn,
      phaseTitle: 'TACTICAL CHARGE',
      phaseSubtitle: 'MATCH PAIRS  →  STORE TACTICAL ENERGY',
      timerSeconds: remaining,
      timerLabel: isReady ? 'READY' : 'TIME LEFT',
      timerSubtext: isReady ? 'READ THE BOARD · START WHEN READY' : 'MATCH FAST · BANK ENERGY FOR BATTLE',
      statusBadge: {
        text: isReady ? 'READY' : 'ACTIVE',
        active: !isReady,
      },
      matchCount: this.ctx.metrics.snapshot.energyMatches,
      queueTitle,
      queueItems: energyRushInventory((energyId: string) => this.ctx.energyQueue.getCharges(energyId), STRATEGIC_ENERGY).map((entry: EnergyRushInventoryEntry) => ({
        id: entry.energyId,
        name: entry.displayName,
        description: entry.shortDescription,
        count: entry.charges,
      })),
      recentAction: this.recentActionText,
      isReady,
    });
  }

  disableInput(): void {
    this.boardView?.setInputEnabled(false);
  }

  clearPuzzlePresentation(): void {
    this.boardView?.setInputEnabled(false);
    this.boardView?.destroy();
    this.boardView = undefined;
    this.board = undefined;
    this.boardTitle?.destroy();
    this.boardTitle = undefined;
    this.boardSubtitle?.destroy();
    this.boardSubtitle = undefined;
  }
}
