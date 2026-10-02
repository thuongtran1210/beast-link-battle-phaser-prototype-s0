import Phaser from 'phaser';
import type { SessionMetricSnapshot } from '../metrics/SessionMetrics';

/** Result-only P1 validation summary; rendering reads a frozen metric snapshot. */
export class SessionSummaryView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly summary: Phaser.GameObjects.Text;
  private restartArmed = true;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number, onRestart: () => void) {
    const panel = scene.add.rectangle(0, 0, 720, 670, 0x18212b, 1).setStrokeStyle(3, 0xfbbf24);
    const title = scene.add.text(0, -300, 'RESULT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const heading = scene.add.text(-320, -260, 'P1 VALIDATION SUMMARY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#fbbf24',
      fontStyle: 'bold',
    });
    this.summary = scene.add.text(-320, -230, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e5e7eb',
      lineSpacing: 5,
    });

    const restartBg = scene.add.rectangle(0, 285, 310, 48, 0xfbbf24)
      .setStrokeStyle(2, 0xf59e0b)
      .setInteractive({ useHandCursor: true });
    const restartLabel = scene.add.text(0, 285, 'RESTART VALIDATION RUN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#18212b',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const triggerRestart = () => {
      if (!this.restartArmed) return;
      this.restartArmed = false;
      onRestart();
    };
    restartBg.on('pointerdown', triggerRestart);
    restartLabel.on('pointerdown', triggerRestart);

    this.container = scene.add.container(
      centerX,
      centerY,
      [panel, title, heading, this.summary, restartBg, restartLabel],
    ).setDepth(1000).setVisible(false);
  }

  render(metrics: Readonly<SessionMetricSnapshot>, outcome?: 'Win' | 'Lose'): void {
    this.restartArmed = true;
    this.summary.setText([
      'COLLECTION',
      `Beast Matches          ${metrics.beastMatches}`,
      `Beast Queue at Setup  ${metrics.beastQueueAtSetup?.total ?? 0}`,
      `Energy Matches        ${metrics.energyMatches}`,
      `Energy at Start       ${metrics.energyChargesAtBattleStart?.total ?? 0}`,
      '',
      'ARMY / SETUP',
      `Roles T/A/R/M         ${Object.values(metrics.roleCounts).join(' / ')}`,
      `Stars 1 / 2 / 3      ${metrics.starTierCounts[1]} / ${metrics.starTierCounts[2]} / ${metrics.starTierCounts[3]}`,
      `Formation Repositions ${metrics.arrangementChanges}`,
      `Time in Setup         ${duration(metrics.timeInBattleSetup)}`,
      '',
      'BATTLE',
      `Outcome                ${outcome ?? metrics.resultWinLose ?? '—'}`,
      `Battle Duration        ${duration(metrics.battleDuration)}`,
      `First Cast Time       ${duration(metrics.firstCastTime)}`,
      `Casts Used             ${metrics.castsUsed}`,
      `Army HP at First Cast ${metrics.armyHpAtFirstCast ?? '—'}`,
      `Enemy HP at First Cast ${metrics.enemyHpAtFirstCast ?? '—'}`,
      `Unused Energy         ${metrics.unusedChargesAtResult?.total ?? 0}`,
    ].join('\n'));
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
}

function duration(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}s`;
}
