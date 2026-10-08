import type { CombatUnit, FormationConsequenceMetrics, AutonomousBattleSnapshot } from '../BattleTypes';
import type { FormationValidationMetrics } from '../FormationValidationHarness';

export function createInitialConsequenceMetrics(): FormationConsequenceMetrics {
  return {
    interceptCount: 0,
    diverInterceptionCount: 0,
    frontlineInterceptionCount: 0,
    firstPlayerContactTime: undefined,
    firstBacklineHitTime: undefined,
    firstCarryHitTime: undefined,
    firstAssassinContactTime: undefined,
    attacksResolvedByUnit: {},
    damageTakenByUnit: {},
    timeEngaged: {},
    rangerForcedKiteCount: 0,
    mageForcedRepositionCount: 0,
    unitDeathTimes: {},
  };
}

export function cloneConsequenceMetrics(m: FormationConsequenceMetrics): FormationConsequenceMetrics {
  return {
    interceptCount: m.interceptCount,
    diverInterceptionCount: m.diverInterceptionCount,
    frontlineInterceptionCount: m.frontlineInterceptionCount,
    firstPlayerContactTime: m.firstPlayerContactTime,
    firstBacklineHitTime: m.firstBacklineHitTime,
    firstCarryHitTime: m.firstCarryHitTime,
    firstAssassinContactTime: m.firstAssassinContactTime,
    attacksResolvedByUnit: { ...m.attacksResolvedByUnit },
    damageTakenByUnit: { ...m.damageTakenByUnit },
    timeEngaged: { ...m.timeEngaged },
    rangerForcedKiteCount: m.rangerForcedKiteCount,
    mageForcedRepositionCount: m.mageForcedRepositionCount,
    unitDeathTimes: { ...m.unitDeathTimes },
  };
}

export function computeValidationMetrics(
  state: AutonomousBattleSnapshot,
  consequenceMetrics: FormationConsequenceMetrics,
): FormationValidationMetrics {
  const elapsed = state.elapsedTime ?? (state.elapsedTicks * 0.1);
  const units = state.units;

  const tankUnits = units.filter((u) => u.role === 'Tanker');
  const rangerUnits = units.filter((u) => u.role === 'Ranger');
  const mageUnits = units.filter((u) => u.role === 'Mage');
  const assassinUnits = units.filter((u) => u.role === 'Assassin');

  const sumDamage = (group: CombatUnit[]) =>
    group.reduce((sum, u) => sum + (consequenceMetrics.damageTakenByUnit[u.unitId] ?? 0), 0);

  const sumAttacks = (group: CombatUnit[]) =>
    group.reduce((sum, u) => sum + (consequenceMetrics.attacksResolvedByUnit[u.unitId] ?? 0), 0);

  const calcSurvival = (group: CombatUnit[]) => {
    if (!group.length) return elapsed;
    return Math.min(
      ...group.map((u) => consequenceMetrics.unitDeathTimes[u.unitId] ?? elapsed),
    );
  };

  const rangerDamage = sumDamage(rangerUnits);
  const mageDamage = sumDamage(mageUnits);

  return {
    firstPlayerContactTime: consequenceMetrics.firstPlayerContactTime,
    firstBacklineHitTime: consequenceMetrics.firstBacklineHitTime,
    firstCarryHitTime: consequenceMetrics.firstCarryHitTime ?? consequenceMetrics.firstBacklineHitTime,
    firstAssassinContactTime: consequenceMetrics.firstAssassinContactTime,

    tankDamageTaken: sumDamage(tankUnits),
    rangerDamageTaken: rangerDamage,
    mageDamageTaken: mageDamage,
    carryDamageTaken: rangerDamage + mageDamage,

    rangerAttacksResolved: sumAttacks(rangerUnits),
    mageCastsResolved: sumAttacks(mageUnits),
    assassinAttacksResolved: sumAttacks(assassinUnits),

    rangerForcedKiteCount: consequenceMetrics.rangerForcedKiteCount,
    mageForcedRepositionCount: consequenceMetrics.mageForcedRepositionCount,

    diverInterceptionCount: consequenceMetrics.diverInterceptionCount,
    frontlineInterceptionCount: consequenceMetrics.frontlineInterceptionCount,

    rangerSurvivalTime: Number(calcSurvival(rangerUnits).toFixed(2)),
    mageSurvivalTime: Number(calcSurvival(mageUnits).toFixed(2)),

    battleDuration: Number(elapsed.toFixed(2)),
    battleResult: state.status,
  };
}
