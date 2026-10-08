import Phaser from 'phaser';
import type { LandscapeLayout } from '../ui/layout/LandscapeLayout';
import type { PrototypeFlowPanel } from '../ui/PrototypeFlowPanel';
import type { ShowcaseBattleHUDView } from '../ui/ShowcaseBattleHUDView';
import type { BattleActionView } from '../ui/BattleActionView';
import type { AutonomousBattleModel } from '../battle/AutonomousBattleModel';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { SessionMetrics } from '../metrics/SessionMetrics';
import { STRATEGIC_ENERGY_POOL as V14G_ENERGY_RUSH_POOL } from '../energy/TacticalEnergyCatalog';
import { FeedbackEffects } from '../ui/feedback/FeedbackEffects';
import { tacticalEnergyControl, tacticalEnergyCastFeedback } from '../ui/TacticalEnergyPresentation';

export interface BattlePresentationContext {
  scene: Phaser.Scene;
  getLayout: () => LandscapeLayout;
  getBattleModel: () => AutonomousBattleModel | undefined;
  getBattleActionView: () => BattleActionView | undefined;
  getFlowPanel: () => PrototypeFlowPanel | undefined;
  getShowcaseBattleHud: () => ShowcaseBattleHUDView | undefined;
  energyQueue: EnergyQueue;
  metrics: SessionMetrics;
  isShowcaseMode: () => boolean;
  isShowcasePaused: () => boolean;
  syncTopHud: () => void;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export class BattlePhaseCoordinator {
  constructor(private readonly ctx: BattlePresentationContext) {}

  castEnergy(energyId: string): void {
    const battleModel = this.ctx.getBattleModel();
    if (!battleModel) return;

    const before = battleModel.snapshot;
    const armyHp = before.units.reduce((sum, unit) => sum + unit.currentHp, 0);
    const result = battleModel.castTacticalEnergy(energyId, this.ctx.energyQueue);

    const showcaseMode = this.ctx.isShowcaseMode();
    const showcasePaused = this.ctx.isShowcasePaused();
    const layout = this.ctx.getLayout();
    const actionView = this.ctx.getBattleActionView();
    const showcaseHud = this.ctx.getShowcaseBattleHud();

    if (result.success) {
      const after = battleModel.snapshot;
      this.ctx.metrics.successfulCast(armyHp, before.enemyHp);

      if (showcaseMode) {
        const slot = V14G_ENERGY_RUSH_POOL.indexOf(energyId);
        const x = (layout.compact ? this.ctx.scene.scale.width / 2 : layout.rightX / 2) + (slot - 1.5) * 118;
        FeedbackEffects.showToast(this.ctx.scene, x, this.ctx.scene.scale.height - 178, '−1 CHARGE', '#f6d675', 650);
      }

      actionView?.render(after);
      if (result.kind === 'Mend' || result.kind === 'Rescue') {
        actionView?.playHeal({ unitId: result.targetUnitId, amount: result.amount });
      } else if (result.kind === 'Break' || result.kind === 'Pierce') {
        actionView?.playEnergyDamage(result.targetEnemyId, result.amount);
      }

      const identity = tacticalEnergyCastFeedback(result, after);
      if (showcaseMode) {
        const heal = result.kind === 'Mend' || result.kind === 'Rescue' || result.kind === 'Guard';
        const slot = V14G_ENERGY_RUSH_POOL.indexOf(energyId);
        actionView?.playTacticalCast(
          energyId,
          heal ? result.targetUnitId : result.targetEnemyId,
          result.amount,
          heal,
          {
            x: (layout.compact ? this.ctx.scene.scale.width / 2 : layout.rightX / 2) + (slot - 1.5) * 118,
            y: this.ctx.scene.scale.height - 102,
          },
        );
        showcaseHud?.showCastResult(identity ?? result.kind ?? '');
      }

      if (identity) {
        const toastX = showcaseMode ? layout.rightCenter.x : layout.leftCenter.x;
        const toastY = showcaseMode ? this.ctx.scene.scale.height - 46 : layout.leftCenter.y;
        FeedbackEffects.showToast(this.ctx.scene, toastX, toastY, identity, '#f6d675', 760);
      }

      this.renderBattle();
      this.ctx.syncTopHud();
    } else {
      const control = tacticalEnergyControl(
        battleModel.tacticalEnergyEligibility(energyId, this.ctx.energyQueue),
        this.ctx.energyQueue.getCharges(energyId),
        showcasePaused,
      );
      const toastX = showcaseMode ? layout.rightCenter.x : layout.leftCenter.x;
      const toastY = showcaseMode ? this.ctx.scene.scale.height - 46 : layout.leftCenter.y;
      FeedbackEffects.showToast(this.ctx.scene, toastX, toastY, control?.reasonLabel ?? 'UNAVAILABLE', '#f6d675', 760);
    }
  }

  renderBattle(): void {
    const battleModel = this.ctx.getBattleModel();
    const battle = battleModel?.snapshot;
    if (!battle) return;

    const showcaseMode = this.ctx.isShowcaseMode();
    const showcasePaused = this.ctx.isShowcasePaused();
    const actionView = this.ctx.getBattleActionView();
    const flowPanel = this.ctx.getFlowPanel();
    const showcaseHud = this.ctx.getShowcaseBattleHud();

    const isRunning = battle.status === 'Running';
    const energyEntries = this.ctx.energyQueue.getAll().filter((entry) => entry.charges > 0);
    const frontline = battleModel.frontmostAliveUnit();

    actionView?.setShowcaseMode(showcaseMode);
    actionView?.render(battle);

    const frontlineDisplay = frontline
      ? `${(frontline.beastId.split('-').at(-1) ?? frontline.beastId).toUpperCase()} · ${frontline.role} · ${formatNumber(frontline.currentHp)}/${formatNumber(frontline.maxHp)} HP`
      : 'No living frontline unit';

    if (showcaseMode) {
      flowPanel?.destroy();
      showcaseHud?.setVisible(true);
      showcaseHud?.render(
        battle,
        energyEntries,
        frontlineDisplay,
        (energyId) => this.castEnergy(energyId),
        showcasePaused,
        (energyId) =>
          tacticalEnergyControl(
            battleModel.tacticalEnergyEligibility(energyId, this.ctx.energyQueue),
            this.ctx.energyQueue.getCharges(energyId),
            showcasePaused,
          ),
      );
    } else {
      showcaseHud?.setVisible(false);
      const energyRows =
        isRunning && energyEntries.length > 0
          ? energyEntries.map((entry) => ({
              label: `${entry.energyId.toUpperCase()}  ·  ${entry.charges} charge${entry.charges === 1 ? '' : 's'}`,
              energyId: entry.energyId,
              displayName:
                tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)?.displayName ??
                entry.energyId,
              shortDescription:
                tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)?.shortDescription ??
                '',
              charges: entry.charges,
              stateLabel:
                tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)?.stateLabel ??
                'DISABLED',
              reasonLabel: tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)
                ?.reasonLabel,
              enabled:
                tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)?.enabled ??
                false,
              suggested:
                tacticalEnergyControl(battleModel.tacticalEnergyEligibility(entry.energyId, this.ctx.energyQueue), entry.charges, false)?.suggested ??
                false,
              onAction: () => this.castEnergy(entry.energyId),
            }))
          : undefined;

      flowPanel?.render(
        'AUTONOMOUS BATTLE',
        [
          `STATUS: ${battle.status} · Tick ${battle.elapsedTicks} · Living: ${battle.enemies.filter((enemy) => enemy.currentHp > 0).length}/${battle.enemies.length}`,
          `ENEMY SQUAD HP: ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}`,
          `FRONTLINE: ${frontlineDisplay}`,
          '',
          'STORED ENERGY (TIMED CAST)',
          'Tactical Energy: 1 charge per effective cast.',
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
    this.ctx.syncTopHud();
  }
}
