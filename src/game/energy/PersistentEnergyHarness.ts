import {
  AutonomousBattleModel,
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
  type EnemyFixture,
} from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { EnergyQueue } from './EnergyQueue';

export interface PersistentEnergyPolicyResult {
  policy: 'SPEND_NOW' | 'SAVE';
  energyCarryIn: number;
  energySpent: number;
  energyCarryOut: number;
  rosterHpRemaining: number;
  survivorCount: number;
  status: 'Running' | 'Win' | 'Lose';
  battleDuration: number;
}

export interface PersistentEnergyComparison {
  spendNow: PersistentEnergyPolicyResult;
  save: PersistentEnergyPolicyResult;
}

/** Runs a single battle simulation under either SPEND_NOW or SAVE policy. */
export function runPersistentEnergyPolicy(
  formation: BattleFormation,
  enemies: ReadonlyArray<EnemyFixture>,
  queue: EnergyQueue,
  policy: 'SPEND_NOW' | 'SAVE',
  healAtDamageThreshold = 30,
): PersistentEnergyPolicyResult {
  const model = new AutonomousBattleModel(formation, enemies, P1V13A_SIGNATURE_RULES);
  const carryIn = queue.getTotalCharges();
  let spent = 0;

  for (let step = 0; step < 6000 && model.snapshot.status === 'Running'; step += 1) {
    if (policy === 'SPEND_NOW' && queue.getTotalCharges() > 0) {
      const target = model.target();
      if (target && target.maxHp - target.currentHp >= healAtDamageThreshold) {
        const available = queue.getAll().find((e) => e.charges > 0);
        if (available) {
          const success = model.castFrontlineHeal(available.energyId, queue);
          if (success) {
            spent += 1;
          }
        }
      }
    }
    model.step(SIMULATION_STEP);
  }

  const snapshot = model.snapshot;
  const livingUnits = snapshot.units.filter((u) => u.currentHp > 0);
  const rosterHpRemaining = livingUnits.reduce((sum, u) => sum + u.currentHp, 0);

  return {
    policy,
    energyCarryIn: carryIn,
    energySpent: spent,
    energyCarryOut: queue.getTotalCharges(),
    rosterHpRemaining,
    survivorCount: livingUnits.length,
    status: snapshot.status,
    battleDuration: snapshot.elapsedTime ?? 0,
  };
}

/** Runs a controlled deterministic comparison of SPEND_NOW vs SAVE on identical starting conditions. */
export function runPersistentEnergyComparison(
  createFormation: () => BattleFormation,
  enemies: ReadonlyArray<EnemyFixture>,
  initialCharges: Record<string, number>,
): PersistentEnergyComparison {
  const formationA = createFormation();
  const queueA = new EnergyQueue();
  for (const [id, count] of Object.entries(initialCharges)) {
    queueA.addCharge(id, count);
  }
  const spendNow = runPersistentEnergyPolicy(formationA, enemies, queueA, 'SPEND_NOW');

  const formationB = createFormation();
  const queueB = new EnergyQueue();
  for (const [id, count] of Object.entries(initialCharges)) {
    queueB.addCharge(id, count);
  }
  const save = runPersistentEnergyPolicy(formationB, enemies, queueB, 'SAVE');

  return { spendNow, save };
}
