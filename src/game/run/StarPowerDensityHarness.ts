import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES, SIMULATION_STEP, roleBaseStats, type EnemyFixture } from '../battle/AutonomousBattleModel';
import { BattleFormation, type FormationUnit } from '../battle/BattleFormation';
import { starStatMultiplier } from './StarProfile';

export interface StarPowerDensityMetrics {
  activeSlotsUsed: number;
  bodyCount: number;
  totalStartingHp: number;
  totalStartingDamage: number;
}

export interface StarPowerDensityBattleMetrics extends StarPowerDensityMetrics {
  status: 'Running' | 'Win' | 'Lose';
  battleDuration: number;
  attacksResolved: number;
  interceptionCount: number;
  carryDamageTaken: number;
}

/** Small deterministic fixture metric, deliberately not a new analytics framework. */
export function deriveStarPowerDensityMetrics(units: ReadonlyArray<FormationUnit>): StarPowerDensityMetrics {
  const active = units.filter((unit) => unit.slotId !== null);
  return {
    activeSlotsUsed: active.length,
    bodyCount: active.length,
    totalStartingHp: active.reduce((sum, unit) => sum + roleBaseStats(unit.role).hp * starStatMultiplier(unit.star), 0),
    totalStartingDamage: active.reduce((sum, unit) => sum + roleBaseStats(unit.role).damage * starStatMultiplier(unit.star), 0),
  };
}

/** Controlled V14B.3 comparison runner for the existing three enemy fixture families. */
export function runStarPowerDensityScenario(formation: BattleFormation, enemies: ReadonlyArray<EnemyFixture>): StarPowerDensityBattleMetrics {
  const model = new AutonomousBattleModel(formation, enemies, P1V13A_SIGNATURE_RULES);
  for (let step = 0; step < 6000 && model.snapshot.status === 'Running'; step += 1) model.step(SIMULATION_STEP);
  const snapshot = model.snapshot;
  const consequence = snapshot.consequenceMetrics!;
  const starting = deriveStarPowerDensityMetrics(formation.units);
  return {
    ...starting,
    status: snapshot.status,
    battleDuration: snapshot.elapsedTime ?? 0,
    attacksResolved: Object.values(consequence.attacksResolvedByUnit).reduce((sum, value) => sum + value, 0),
    interceptionCount: consequence.interceptCount,
    carryDamageTaken: Object.values(consequence.damageTakenByUnit).reduce((sum, value) => sum + value, 0),
  };
}
