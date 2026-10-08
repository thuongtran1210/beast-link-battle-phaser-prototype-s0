import type { AutonomousBattleSnapshot, CombatUnit, EnemyCombatUnit, FrontlineHealCastResult, TacticalEnergyEligibility, TacticalEnergyCastResult } from '../BattleTypes';
import type { EnergyQueue } from '../../energy/EnergyQueue';
import { FRONTLINE_HEAL_HP } from '../BattleConfig';
import { tacticalEnergyDefinition } from '../../energy/TacticalEnergyCatalog';

export interface BattleEnergyContext {
  state: AutonomousBattleSnapshot;
  target(): CombatUnit | undefined;
  frontmostAliveUnit(): CombatUnit | undefined;
  applyDamage(enemy: EnemyCombatUnit, requestedDamage: number): number;
  syncEnemyAggregates(): void;
  freezeOnTerminal(): void;
}

export class BattleEnergySystem {
  constructor(private readonly ctx: BattleEnergyContext) {}

  public rescueTarget(): CombatUnit | undefined {
    return this.ctx.state.units
      .filter((unit) => unit.currentHp > 0 && (unit.row === 'Mid' || unit.row === 'Back') && unit.currentHp < unit.maxHp)
      .sort((a, b) => (b.maxHp - b.currentHp) - (a.maxHp - a.currentHp) || a.unitId.localeCompare(b.unitId))[0];
  }

  public frontlineHealEligibility(energyId: string, energyQueue: EnergyQueue): FrontlineHealCastResult {
    if (this.ctx.state.status !== 'Running') return { success: false, reason: 'battle-not-running', energyId, healedAmount: 0 };
    if (energyQueue.getCharges(energyId) <= 0) return { success: false, reason: 'no-charge', energyId, healedAmount: 0 };
    const target = this.ctx.target();
    if (!target) return { success: false, reason: 'no-target', energyId, healedAmount: 0 };
    const healedAmount = Math.min(FRONTLINE_HEAL_HP, Math.max(0, target.maxHp - target.currentHp));
    if (healedAmount <= 0) return { success: false, reason: 'target-full-hp', energyId, targetUnitId: target.unitId, healedAmount: 0 };
    return { success: true, reason: 'ok', energyId, targetUnitId: target.unitId, healedAmount };
  }

  public castFrontlineHealResult(energyId: string, energyQueue: EnergyQueue): FrontlineHealCastResult {
    const result = this.frontlineHealEligibility(energyId, energyQueue);
    if (!result.success) return result;
    const target = this.ctx.state.units.find((unit) => unit.unitId === result.targetUnitId);
    if (!target || !energyQueue.consumeCharge(energyId, 1)) return { success: false, reason: target ? 'no-charge' : 'no-target', energyId, healedAmount: 0 };
    target.currentHp = Math.min(target.maxHp, target.currentHp + result.healedAmount);
    return result;
  }

  public castFrontlineHeal(energyId?: string, energyQueue?: EnergyQueue): boolean {
    if (!energyId || !energyQueue) return false;
    return this.castFrontlineHealResult(energyId, energyQueue).success;
  }

  public tacticalEnergyEligibility(energyId: string, energyQueue: EnergyQueue): TacticalEnergyEligibility {
    const definition = tacticalEnergyDefinition(energyId);
    if (!definition) return { energyId, availability: 'disabled', reason: 'unsupported-energy' };
    if (this.ctx.state.status !== 'Running') return { energyId, kind: definition.kind, availability: 'disabled', reason: 'battle-not-running' };
    if (energyQueue.getCharges(energyId) <= 0) return { energyId, kind: definition.kind, availability: 'disabled', reason: 'no-charge' };

    if (definition.kind === 'Mend') {
      const result = this.frontlineHealEligibility(energyId, energyQueue);
      if (!result.success) return { energyId, kind: definition.kind, availability: 'disabled', reason: result.reason, targetUnitId: result.targetUnitId };
      const target = this.ctx.state.units.find((unit) => unit.unitId === result.targetUnitId)!;
      const suggested = target.maxHp - target.currentHp >= FRONTLINE_HEAL_HP || target.currentHp / target.maxHp <= 0.60;
      return { energyId, kind: definition.kind, availability: suggested ? 'suggested' : 'ready', reason: 'ok', targetUnitId: target.unitId, suggestedReason: suggested ? 'FRONT INJURED' : undefined };
    }

    if (definition.kind === 'Guard') {
      const target = this.ctx.frontmostAliveUnit();
      if (!target) return { energyId, kind: 'Guard', availability: 'disabled', reason: 'no-target' };
      if ((target.temporaryShieldHp ?? 0) >= 60 && (target.temporaryShieldExpiresAt ?? 0) > (this.ctx.state.elapsedTime ?? 0))
        return { energyId, kind: 'Guard', availability: 'disabled', reason: 'shield-active', targetUnitId: target.unitId };
      const pressure = this.ctx.state.enemies.some((enemy) => enemy.currentHp > 0 && enemy.targetUnitId === target.unitId);
      return { energyId, kind: 'Guard', availability: pressure ? 'suggested' : 'ready', reason: 'ok', targetUnitId: target.unitId, suggestedReason: pressure ? 'FRONT UNDER ATTACK' : undefined };
    }
    if (definition.kind === 'Disrupt') {
      const enemies = this.ctx.state.enemies.filter((enemy) => enemy.currentHp > 0 && (enemy.funControlUntil ?? 0) <= (this.ctx.state.elapsedTime ?? 0))
        .sort((a, b) => Number((b.attackWindupRemaining ?? 0) > 0) - Number((a.attackWindupRemaining ?? 0) > 0) || a.positionX - b.positionX || a.enemyId.localeCompare(b.enemyId));
      const target = enemies[0];
      if (!target) return { energyId, kind: 'Disrupt', availability: 'disabled', reason: 'no-target' };
      const windup = (target.attackWindupRemaining ?? 0) > 0;
      return { energyId, kind: 'Disrupt', availability: windup ? 'suggested' : 'ready', reason: 'ok', targetEnemyId: target.enemyId, suggestedReason: windup ? 'ENEMY WINDUP' : undefined };
    }
    if (definition.kind === 'Rescue') {
      const target = this.rescueTarget();
      if (!target) return { energyId, kind: definition.kind, availability: 'disabled', reason: 'no-target' };
      const diverPressure = this.ctx.state.enemies.some((enemy) => {
        if (enemy.currentHp <= 0 || enemy.archetype !== 'Diver') return false;
        const isBackline = (id: string | undefined) => { const pressured = this.ctx.state.units.find((unit) => unit.unitId === id); return Boolean(pressured && pressured.currentHp > 0 && (pressured.row === 'Mid' || pressured.row === 'Back')); };
        return isBackline(enemy.engagedTargetId) || isBackline(enemy.targetUnitId);
      });
      const lowHp = target.currentHp / target.maxHp <= 0.60;
      return { energyId, kind: definition.kind, availability: diverPressure || lowHp ? 'suggested' : 'ready', reason: 'ok', targetUnitId: target.unitId, suggestedReason: diverPressure ? 'DIVER PRESSURE' : lowHp ? 'BACKLINE HIT' : undefined };
    }

    const archetype = definition.kind === 'Break' ? 'Frontliner' : 'Ranged';
    const targets = this.ctx.state.enemies.filter((enemy) => enemy.currentHp > 0 && enemy.archetype === archetype);
    if (!targets.length) return { energyId, kind: definition.kind, availability: 'disabled', reason: definition.kind === 'Break' ? 'no-frontliner' : 'no-ranged' };
    const target = definition.kind === 'Break'
      ? targets.sort((a, b) => a.positionX - b.positionX || a.enemyId.localeCompare(b.enemyId))[0]
      : targets.sort((a, b) => a.currentHp - b.currentHp || a.enemyId.localeCompare(b.enemyId))[0];
    const suggested = definition.kind === 'Break'
      ? targets.length >= 2
      : this.ctx.state.enemies.some((enemy) => enemy.currentHp > 0 && enemy.archetype === 'Frontliner');
    return { energyId, kind: definition.kind, availability: suggested ? 'suggested' : 'ready', reason: 'ok', targetEnemyId: target.enemyId, suggestedReason: suggested ? definition.kind === 'Break' ? 'FRONTLINE PRESSURE' : 'RANGED PROTECTED' : undefined };
  }

  public castTacticalEnergy(energyId: string, energyQueue: EnergyQueue): TacticalEnergyCastResult {
    const eligibility = this.tacticalEnergyEligibility(energyId, energyQueue);
    if (eligibility.reason !== 'ok' || !eligibility.kind) return { success: false, energyId, kind: eligibility.kind, reason: eligibility.reason, amount: 0, targetUnitId: eligibility.targetUnitId, targetEnemyId: eligibility.targetEnemyId };
    if (eligibility.kind === 'Mend') {
      const result = this.castFrontlineHealResult(energyId, energyQueue);
      return { success: result.success, energyId, kind: 'Mend', reason: result.reason, targetUnitId: result.targetUnitId, amount: result.healedAmount };
    }
    if (eligibility.kind === 'Guard') {
      const target = this.ctx.state.units.find((unit) => unit.unitId === eligibility.targetUnitId && unit.currentHp > 0);
      if (!target || !energyQueue.consumeCharge(energyId)) return { success: false, energyId, kind: 'Guard', reason: 'no-target', amount: 0 };
      target.guardUntil = (this.ctx.state.elapsedTime ?? 0) + 3;
      const added = Math.max(0, 60 - (target.temporaryShieldHp ?? 0));
      target.temporaryShieldHp = Math.max(target.temporaryShieldHp ?? 0, 60);
      target.temporaryShieldExpiresAt = Math.max(target.temporaryShieldExpiresAt ?? 0, (this.ctx.state.elapsedTime ?? 0) + 3);
      return { success: true, energyId, kind: 'Guard', reason: 'ok', targetUnitId: target.unitId, amount: added };
    }
    if (eligibility.kind === 'Disrupt') {
      const target = this.ctx.state.enemies.find((enemy) => enemy.enemyId === eligibility.targetEnemyId && enemy.currentHp > 0);
      if (!target || !energyQueue.consumeCharge(energyId)) return { success: false, energyId, kind: 'Disrupt', reason: 'no-target', amount: 0 };
      target.attackWindupRemaining = 0; target.actionState = 'Idle';
      target.funControlKind = 'Disrupt'; target.funControlUntil = (this.ctx.state.elapsedTime ?? 0) + 1;
      return { success: true, energyId, kind: 'Disrupt', reason: 'ok', targetEnemyId: target.enemyId, amount: 1 };
    }
    if (eligibility.kind === 'Rescue') {
      const target = this.rescueTarget();
      const amount = target ? Math.min(FRONTLINE_HEAL_HP, target.maxHp - target.currentHp) : 0;
      if (!target || amount <= 0 || !energyQueue.consumeCharge(energyId)) return { success: false, energyId, kind: 'Rescue', reason: target ? 'no-charge' : 'no-target', amount: 0 };
      target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
      return { success: true, energyId, kind: 'Rescue', reason: 'ok', targetUnitId: target.unitId, amount };
    }
    const target = this.ctx.state.enemies.find((enemy) => enemy.enemyId === eligibility.targetEnemyId && enemy.currentHp > 0);
    const amount = target ? Math.min(FRONTLINE_HEAL_HP, target.currentHp) : 0;
    if (!target || amount <= 0 || !energyQueue.consumeCharge(energyId)) return { success: false, energyId, kind: eligibility.kind, reason: target ? 'no-charge' : eligibility.kind === 'Break' ? 'no-frontliner' : 'no-ranged', amount: 0 };
    this.ctx.applyDamage(target, amount);
    this.ctx.syncEnemyAggregates();
    if (this.ctx.state.enemyHp <= 0) { this.ctx.state.status = 'Win'; this.ctx.freezeOnTerminal(); }
    return { success: true, energyId, kind: eligibility.kind, reason: 'ok', targetEnemyId: target.enemyId, amount };
  }
}
