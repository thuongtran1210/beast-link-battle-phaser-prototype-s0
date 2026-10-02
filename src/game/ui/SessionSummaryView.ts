import Phaser from 'phaser';
import type { SessionMetricSnapshot } from '../metrics/SessionMetrics';
import type { FormationValidationMetrics, FormationRunDelta } from '../battle/FormationValidationHarness';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

/**
 * Landscape Game Result Screen:
 * Large Victory / Defeat hero banner, 4 structured stat cards,
 * primary Restart CTA, and optional secondary Technical Details toggle.
 */
export class SessionSummaryView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly onRestart: () => void;
  private restartArmed = true;
  private showingDetails = false;
  private cachedMetrics?: SessionMetricSnapshot;
  private cachedOutcome?: 'Win' | 'Lose';
  private cachedValidationMetrics?: FormationValidationMetrics;
  private cachedComparison?: FormationRunDelta;
  private cachedRunA?: FormationValidationMetrics;
  private cachedRunB?: FormationValidationMetrics;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number, onRestart: () => void) {
    this.scene = scene;
    this.onRestart = onRestart;
    this.container = scene.add.container(centerX, centerY).setDepth(1000).setVisible(false);
  }

  render(
    metrics: Readonly<SessionMetricSnapshot>,
    outcome?: 'Win' | 'Lose',
    validationMetrics?: FormationValidationMetrics,
    comparison?: FormationRunDelta,
    runA?: FormationValidationMetrics,
    runB?: FormationValidationMetrics,
  ): void {
    this.cachedMetrics = { ...metrics };
    this.cachedOutcome = outcome;
    this.cachedValidationMetrics = validationMetrics;
    this.cachedComparison = comparison;
    this.cachedRunA = runA;
    this.cachedRunB = runB;
    this.restartArmed = true;
    this.rebuildDisplay();
  }

  private rebuildDisplay(): void {
    this.container.removeAll(true);
    const metrics = this.cachedMetrics;
    const outcome = this.cachedOutcome ?? metrics?.resultWinLose ?? 'Win';
    const isWin = outcome === 'Win';

    const panelW = 780;
    const panelH = 560;

    // Dark backdrop overlay
    const backdrop = this.scene.add
      .rectangle(0, 0, panelW, panelH, HudTokens.colors.bgSurfaceDark, 0.98)
      .setStrokeStyle(2, isWin ? HudTokens.colors.gold : HudTokens.colors.red);
    this.container.add(backdrop);

    // Hero Header Banner
    const bannerH = 76;
    const bannerY = -panelH / 2 + bannerH / 2 + 16;
    const bannerBg = this.scene.add
      .rectangle(0, bannerY, panelW - 40, bannerH, isWin ? 0x1e3a5f : 0x450a0a, 0.9)
      .setStrokeStyle(1.5, isWin ? HudTokens.colors.gold : HudTokens.colors.red);

    const resultTitle = this.scene.add
      .text(0, bannerY - 10, isWin ? '★ VICTORY ★' : '☠ DEFEAT ☠', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '28px',
        color: isWin ? HudTokens.colors.textGold : HudTokens.colors.textRed,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const resultSubtitle = this.scene.add
      .text(
        0,
        bannerY + 18,
        isWin ? 'Opposing Squad Eliminated' : 'All Deployed Player Units Defeated',
        {
          fontFamily: HudTokens.fonts.family,
          fontSize: '12px',
          color: HudTokens.colors.textSecondary,
        },
      )
      .setOrigin(0.5);

    this.container.add([bannerBg, resultTitle, resultSubtitle]);

    if (!this.showingDetails) {
      // 4 STAT CARDS IN 2x2 GRID
      const gridW = 350;
      const gridH = 130;
      const leftColX = -panelW / 4;
      const rightColX = panelW / 4;
      const row1Y = -60;
      const row2Y = 90;

      // Card 1: BATTLE & TIMING
      const c1Bg = this.scene.add
        .rectangle(leftColX, row1Y, gridW, gridH, HudTokens.colors.bgSurface, 0.9)
        .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
      const c1Title = this.scene.add
        .text(leftColX - gridW / 2 + 14, row1Y - gridH / 2 + 12, '⏱ BATTLE & DURATION', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textGold,
          fontStyle: 'bold',
        });
      const c1Val = this.scene.add
        .text(leftColX - gridW / 2 + 14, row1Y - 10, duration(metrics?.battleDuration ?? null), {
          fontFamily: HudTokens.fonts.family,
          fontSize: '28px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
      const c1Sub = this.scene.add
        .text(
          leftColX - gridW / 2 + 14,
          row1Y + 28,
          `First Cast: ${duration(metrics?.firstCastTime ?? null)} · Setup: ${duration(metrics?.timeInBattleSetup ?? null)}`,
          {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: HudTokens.colors.textMuted,
          },
        );
      this.container.add([c1Bg, c1Title, c1Val, c1Sub]);

      // Card 2: BEAST LINK & ARMY
      const totalUnits = (metrics?.starTierCounts[1] ?? 0) + (metrics?.starTierCounts[2] ?? 0) + (metrics?.starTierCounts[3] ?? 0);
      const c2Bg = this.scene.add
        .rectangle(rightColX, row1Y, gridW, gridH, HudTokens.colors.bgSurface, 0.9)
        .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
      const c2Title = this.scene.add
        .text(rightColX - gridW / 2 + 14, row1Y - gridH / 2 + 12, '🐾 BEAST RUSH & SQUAD', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textBlue,
          fontStyle: 'bold',
        });
      const c2Val = this.scene.add
        .text(rightColX - gridW / 2 + 14, row1Y - 10, `${metrics?.beastMatches ?? 0} Matches`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '24px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
      const c2Sub = this.scene.add
        .text(
          rightColX - gridW / 2 + 14,
          row1Y + 28,
          `Army: ${totalUnits} Units (★1: ${metrics?.starTierCounts[1] ?? 0}, ★2: ${metrics?.starTierCounts[2] ?? 0}, ★3: ${metrics?.starTierCounts[3] ?? 0})`,
          {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: HudTokens.colors.textMuted,
          },
        );
      const beastTypes = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f'];
      const beastIcons = beastTypes.map((id, idx) => {
        return createIconImage(this.scene, id, rightColX + gridW / 2 - 130 + idx * 22, row1Y - 12, 19);
      });
      this.container.add([c2Bg, c2Title, c2Val, c2Sub, ...beastIcons]);

      // Card 3: ENERGY RUSH & CASTS
      const c3Bg = this.scene.add
        .rectangle(leftColX, row2Y, gridW, gridH, HudTokens.colors.bgSurface, 0.9)
        .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
      const c3Title = this.scene.add
        .text(leftColX - gridW / 2 + 14, row2Y - gridH / 2 + 12, '⚡ ENERGY & HEALS', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textGreen,
          fontStyle: 'bold',
        });
      const c3Val = this.scene.add
        .text(leftColX - gridW / 2 + 14, row2Y - 10, `${metrics?.castsUsed ?? 0} Casts Used`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '24px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
      const c3Sub = this.scene.add
        .text(
          leftColX - gridW / 2 + 14,
          row2Y + 28,
          `Gathered: ${metrics?.energyChargesAtBattleStart?.total ?? 0} · Unused: ${metrics?.unusedChargesAtResult?.total ?? 0}`,
          {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: HudTokens.colors.textMuted,
          },
        );

      const energyTypes = ['energy-a', 'energy-b', 'energy-c', 'energy-d', 'energy-e', 'energy-f'];
      const energyIcons = energyTypes.map((id, idx) => {
        return createIconImage(this.scene, id, leftColX + gridW / 2 - 130 + idx * 22, row2Y - 12, 19);
      });
      this.container.add([c3Bg, c3Title, c3Val, c3Sub, ...energyIcons]);

      // Card 4: FORMATION & ROLES
      const roleStr = metrics?.roleCounts
        ? `T: ${metrics.roleCounts.Tanker} · A: ${metrics.roleCounts.Assassin} · R: ${metrics.roleCounts.Ranger} · M: ${metrics.roleCounts.Mage}`
        : '—';
      const c4Bg = this.scene.add
        .rectangle(rightColX, row2Y, gridW, gridH, HudTokens.colors.bgSurface, 0.9)
        .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
      const c4Title = this.scene.add
        .text(rightColX - gridW / 2 + 14, row2Y - gridH / 2 + 12, '🛡 ROLES & TACTICS', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textGold,
          fontStyle: 'bold',
        });
      const c4Val = this.scene.add
        .text(rightColX - gridW / 2 + 14, row2Y - 10, `${metrics?.arrangementChanges ?? 0} Repositions`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '24px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
      const c4Sub = this.scene.add
        .text(rightColX - gridW / 2 + 14, row2Y + 28, roleStr, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '10px',
          color: HudTokens.colors.textMuted,
        });
      this.container.add([c4Bg, c4Title, c4Val, c4Sub]);
    } else {
      // TECHNICAL MONOSPACE DETAILS PANEL
      const detailsW = panelW - 40;
      const detailsH = 290;
      const detailsY = 20;

      const detailsBg = this.scene.add
        .rectangle(0, detailsY, detailsW, detailsH, 0x111827, 0.95)
        .setStrokeStyle(1, HudTokens.colors.strokeDefault);

      const rawLines = [
        `Beast Matches: ${metrics?.beastMatches ?? 0}  |  Energy Matches: ${metrics?.energyMatches ?? 0}`,
        `Beast Queue: ${metrics?.beastQueueAtSetup?.total ?? 0}  |  Energy Start: ${metrics?.energyChargesAtBattleStart?.total ?? 0}  |  Unused: ${metrics?.unusedChargesAtResult?.total ?? 0}`,
        `Star Tiers: 1★:${metrics?.starTierCounts[1] ?? 0}  2★:${metrics?.starTierCounts[2] ?? 0}  3★:${metrics?.starTierCounts[3] ?? 0}`,
        `Setup Time: ${duration(metrics?.timeInBattleSetup ?? null)}  |  Battle Duration: ${duration(metrics?.battleDuration ?? null)}`,
        `Casts Used: ${metrics?.castsUsed ?? 0}  |  First Cast: ${duration(metrics?.firstCastTime ?? null)}`,
        `Army HP at First Cast: ${metrics?.armyHpAtFirstCast ?? '—'}  |  Enemy HP at First Cast: ${metrics?.enemyHpAtFirstCast ?? '—'}`,
      ];

      if (this.cachedComparison && this.cachedRunA && this.cachedRunB) {
        rawLines.push(
          '-------------------------------------------------------',
          'V11D FORMATION COMPARISON (Run A vs Run B)',
          `Backline 1st Hit:  A: ${this.cachedRunA.firstBacklineHitTime !== undefined ? this.cachedRunA.firstBacklineHitTime.toFixed(1) + 's' : 'Unhit'} | B: ${this.cachedRunB.firstBacklineHitTime !== undefined ? this.cachedRunB.firstBacklineHitTime.toFixed(1) + 's' : 'Unhit'}  (Delta: ${this.cachedComparison.firstBacklineHitDelta !== undefined ? (this.cachedComparison.firstBacklineHitDelta >= 0 ? '+' : '') + this.cachedComparison.firstBacklineHitDelta.toFixed(1) + 's' : 'N/A'})`,
          `Ranger Attacks:    A: ${this.cachedRunA.rangerAttacksResolved} | B: ${this.cachedRunB.rangerAttacksResolved}  (Delta: ${this.cachedComparison.rangerAttacksDelta >= 0 ? '+' : ''}${this.cachedComparison.rangerAttacksDelta})`,
          `Mage Casts:        A: ${this.cachedRunA.mageCastsResolved} | B: ${this.cachedRunB.mageCastsResolved}  (Delta: ${this.cachedComparison.mageCastsDelta >= 0 ? '+' : ''}${this.cachedComparison.mageCastsDelta})`,
          `Assassin Contact:  A: ${this.cachedRunA.firstAssassinContactTime !== undefined ? this.cachedRunA.firstAssassinContactTime.toFixed(1) + 's' : '—'} | B: ${this.cachedRunB.firstAssassinContactTime !== undefined ? this.cachedRunB.firstAssassinContactTime.toFixed(1) + 's' : '—'}`,
          `Carry Damage:      A: ${this.cachedRunA.carryDamageTaken} | B: ${this.cachedRunB.carryDamageTaken}  (Delta: ${this.cachedComparison.carryDamageDelta})`,
          `Diver Intercepts:  A: ${this.cachedRunA.diverInterceptionCount} | B: ${this.cachedRunB.diverInterceptionCount}`,
          ...this.cachedComparison.statements.map((s) => `• ${s}`),
        );
      } else if (this.cachedValidationMetrics) {
        rawLines.push(
          '-------------------------------------------------------',
          'V11D FORMATION METRICS',
          `1st Backline Hit: ${this.cachedValidationMetrics.firstBacklineHitTime !== undefined ? this.cachedValidationMetrics.firstBacklineHitTime.toFixed(1) + 's' : 'Unhit'}  |  1st Assassin Contact: ${this.cachedValidationMetrics.firstAssassinContactTime !== undefined ? this.cachedValidationMetrics.firstAssassinContactTime.toFixed(1) + 's' : '—'}`,
          `Ranger Attacks: ${this.cachedValidationMetrics.rangerAttacksResolved}  |  Mage Casts: ${this.cachedValidationMetrics.mageCastsResolved}  |  Assassin Attacks: ${this.cachedValidationMetrics.assassinAttacksResolved}`,
          `Tank Dmg: ${this.cachedValidationMetrics.tankDamageTaken}  |  Carry Dmg: ${this.cachedValidationMetrics.carryDamageTaken}  |  Diver Intercepts: ${this.cachedValidationMetrics.diverInterceptionCount}`,
        );
      }

      const detailsText = this.scene.add
        .text(-detailsW / 2 + 16, detailsY - detailsH / 2 + 14, rawLines.join('\n'), {
          fontFamily: HudTokens.fonts.mono,
          fontSize: '11px',
          color: HudTokens.colors.textSecondary,
          lineSpacing: 3,
        });

      this.container.add([detailsBg, detailsText]);
    }

    if (!this.showingDetails && this.cachedComparison) {
      const compBox = this.scene.add
        .rectangle(0, 168, panelW - 40, 36, 0x0f172a, 0.9)
        .setStrokeStyle(1, 0x3b82f6);
      const compSummary = this.cachedComparison.statements.slice(0, 2).join('  |  ');
      const compText = this.scene.add
        .text(0, 168, `⚡ COMPARISON: ${compSummary}`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: '#67e8f9',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.container.add([compBox, compText]);
    }

    // BOTTOM CONTROLS
    const btnRowY = panelH / 2 - 44;

    // Secondary Toggle: Details / Summary
    const toggleLabel = this.showingDetails ? '◀ SHOW SUMMARY' : 'VIEW TECHNICAL DETAILS ▶';
    const toggleBtn = this.scene.add
      .text(-panelW / 4, btnRowY, toggleLabel, {
        fontFamily: HudTokens.fonts.family,
        fontSize: '11px',
        color: HudTokens.colors.textMuted,
        backgroundColor: '#1e293b',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    toggleBtn.on('pointerup', () => {
      this.showingDetails = !this.showingDetails;
      this.rebuildDisplay();
    });
    this.container.add(toggleBtn);

    // Primary CTA: RESTART RUN (Prominent gold/amber button)
    const restartW = 240;
    const restartH = 44;
    const restartBg = this.scene.add
      .rectangle(panelW / 4, btnRowY, restartW, restartH, HudTokens.colors.goldDark, 1)
      .setStrokeStyle(1.5, HudTokens.colors.gold)
      .setInteractive({ useHandCursor: true });

    const restartLabel = this.scene.add
      .text(panelW / 4, btnRowY, '↺ RESTART RUN', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const triggerRestart = () => {
      if (!this.restartArmed) return;
      this.restartArmed = false;
      this.onRestart();
    };

    restartBg.on('pointerdown', triggerRestart);
    restartLabel.on('pointerdown', triggerRestart);
    this.container.add([restartBg, restartLabel]);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
}

function duration(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}s`;
}
