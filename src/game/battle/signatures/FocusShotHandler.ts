import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import { focusHoldThresholdForStar } from '../../run/StarProfile';
import { movementProfile } from '../BattleConfig';

export class FocusShotHandler {
  static updateProgress(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit, deltaSeconds: number): void {
    if (unit.signatureId !== 'FocusShot' || unit.focusReady) return;
    const profile = movementProfile[unit.role];
    const dist = ctx.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);
    let nearest = Infinity;
    for (const enemy of ctx.state.enemies) {
      if (enemy.currentHp > 0) {
        nearest = Math.min(nearest, ctx.distance(unit.positionX, unit.positionLane, enemy.positionX, enemy.positionLane));
      }
    }
    if (unit.movementPolicyState === 'Hold' && dist <= profile.attackRange && nearest >= profile.dangerRange) {
      unit.continuousHoldTime = (unit.continuousHoldTime ?? 0) + deltaSeconds;
      if (unit.continuousHoldTime >= focusHoldThresholdForStar(unit.star)) {
        unit.focusReady = true;
        ctx.signatureEvents.push({
          type: 'SignatureReady',
          unitId: unit.unitId,
          signatureId: 'FocusShot',
          time: ctx.state.elapsedTime ?? 0,
        });
      }
    } else if (unit.movementPolicyState === 'Kite' || unit.movementPolicyState === 'AdvanceToRange') {
      unit.continuousHoldTime = 0;
    }
  }
}
