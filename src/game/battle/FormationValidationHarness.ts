import type { DeployedUnit } from '../queue/StarConverter';
import { BattleFormation } from './BattleFormation';
import type { AutonomousBattleSnapshot } from './AutonomousBattleModel';

export interface FormationValidationMetrics {
  firstPlayerContactTime?: number;
  firstBacklineHitTime?: number;
  firstCarryHitTime?: number;
  firstAssassinContactTime?: number;

  tankDamageTaken: number;
  rangerDamageTaken: number;
  mageDamageTaken: number;
  carryDamageTaken: number;

  rangerAttacksResolved: number;
  mageCastsResolved: number;
  assassinAttacksResolved: number;

  rangerForcedKiteCount: number;
  mageForcedRepositionCount: number;

  diverInterceptionCount: number;
  frontlineInterceptionCount: number;

  rangerSurvivalTime: number;
  mageSurvivalTime: number;

  battleDuration: number;
  battleResult: 'Win' | 'Lose' | 'Running';
}

export interface FormationRunDelta {
  firstPlayerContactDelta?: number;
  firstBacklineHitDelta?: number;
  firstCarryHitDelta?: number;
  firstAssassinContactDelta?: number;

  tankDamageDelta: number;
  rangerDamageDelta: number;
  mageDamageDelta: number;
  carryDamageDelta: number;

  rangerAttacksDelta: number;
  mageCastsDelta: number;
  assassinAttacksDelta: number;

  rangerForcedKiteDelta: number;
  mageForcedRepositionDelta: number;

  diverInterceptionsDelta: number;
  frontlineInterceptionsDelta: number;

  rangerSurvivalDelta: number;
  mageSurvivalDelta: number;

  battleDurationDelta: number;
  statements: string[];
}

export interface FormationPreset {
  id: string;
  name: string;
  threatType: string;
  description: string;
  slots: {
    tank: string;
    assassin: string;
    ranger: string;
    mage: string;
  };
}

export const V11D_FIXED_PLAYER_SQUAD: ReadonlyArray<DeployedUnit> = [
  { contentId: 'beast-a', star: 1 }, // Tanker
  { contentId: 'beast-b', star: 1 }, // Assassin
  { contentId: 'beast-c', star: 1 }, // Ranger
  { contentId: 'beast-d', star: 1 }, // Mage
];

export const V11D_PRESETS: Record<string, { presetA: FormationPreset; presetB: FormationPreset }> = {
  // Fixture A: Frontline Pressure (3 Frontliners)
  'frontline-pressure': {
    presetA: {
      id: 'a-covered',
      name: 'Frontline Cover (Response A)',
      threatType: 'FRONTLINE PRESSURE',
      description: 'Tank placed in threatened lane 3; carries protected behind.',
      slots: {
        tank: 'front-3',
        assassin: 'front-4',
        ranger: 'back-3',
        mage: 'back-2',
      },
    },
    presetB: {
      id: 'a-misaligned',
      name: 'Misaligned Tank (Response B)',
      threatType: 'FRONTLINE PRESSURE',
      description: 'Tank placed far in lane 6; carries exposed to lane 2-4 push.',
      slots: {
        tank: 'front-6',
        assassin: 'mid-4',
        ranger: 'back-3',
        mage: 'back-2',
      },
    },
  },
  // Fixture B: Backline Dive (1 Frontliner, 2 Divers)
  'backline-dive': {
    presetA: {
      id: 'b-carry-guard',
      name: 'Carry Guard (Response A)',
      threatType: 'BACKLINE DIVE',
      description: 'Tank stationed at mid-3 to intercept incoming Diver corridors.',
      slots: {
        tank: 'mid-3',
        assassin: 'front-3',
        ranger: 'back-4',
        mage: 'back-2',
      },
    },
    presetB: {
      id: 'b-exposed-backline',
      name: 'Exposed Backline (Response B)',
      threatType: 'BACKLINE DIVE',
      description: 'Tank pushed far in lane 1; carries directly exposed to Divers.',
      slots: {
        tank: 'front-1',
        assassin: 'front-5',
        ranger: 'back-4',
        mage: 'back-2',
      },
    },
  },
  // Fixture C: Protected Ranged (2 Frontliners, 2 Ranged)
  'protected-ranged': {
    presetA: {
      id: 'c-assassin-aligned',
      name: 'Assassin Alignment (Response A)',
      threatType: 'PROTECTED RANGED',
      description: 'Assassin aligned in lane 4 directly opposite enemy Ranged.',
      slots: {
        tank: 'front-3',
        assassin: 'front-4',
        ranger: 'back-2',
        mage: 'back-5',
      },
    },
    presetB: {
      id: 'c-assassin-misaligned',
      name: 'Assassin Misalignment (Response B)',
      threatType: 'PROTECTED RANGED',
      description: 'Assassin stationed in lane 1 requiring long diagonal travel.',
      slots: {
        tank: 'front-3',
        assassin: 'back-1',
        ranger: 'back-2',
        mage: 'back-5',
      },
    },
  },
};

/**
 * Applies a validation preset to an existing BattleFormation.
 * Maps units by role, leaving unmapped units in fallback unplaced or empty slots.
 */
export function applyFormationPreset(formation: BattleFormation, preset: FormationPreset): void {
  formation.reset();
  const units = formation.units;
  const tank = units.find((u) => u.role === 'Tanker');
  const assassin = units.find((u) => u.role === 'Assassin');
  const ranger = units.find((u) => u.role === 'Ranger');
  const mage = units.find((u) => u.role === 'Mage');

  if (tank) formation.place(tank.unitId, preset.slots.tank);
  if (assassin) formation.place(assassin.unitId, preset.slots.assassin);
  if (ranger) formation.place(ranger.unitId, preset.slots.ranger);
  if (mage) formation.place(mage.unitId, preset.slots.mage);
}

/**
 * Creates a fresh BattleFormation with the fixed squad deployed according to preset.
 */
export function createPresetFormation(preset: FormationPreset): BattleFormation {
  const f = new BattleFormation(V11D_FIXED_PLAYER_SQUAD);
  applyFormationPreset(f, preset);
  return f;
}

/**
 * Computes factual, objective comparison metrics and statements between two runs.
 * Does NOT generate artificial scores, tiers, or best-formation rankings.
 */
export function compareFormationRuns(
  runA: FormationValidationMetrics,
  runB: FormationValidationMetrics,
): FormationRunDelta {
  const firstBacklineHitDelta =
    runA.firstBacklineHitTime !== undefined && runB.firstBacklineHitTime !== undefined
      ? Number((runA.firstBacklineHitTime - runB.firstBacklineHitTime).toFixed(2))
      : undefined;

  const firstCarryHitDelta =
    runA.firstCarryHitTime !== undefined && runB.firstCarryHitTime !== undefined
      ? Number((runA.firstCarryHitTime - runB.firstCarryHitTime).toFixed(2))
      : undefined;

  const firstPlayerContactDelta =
    runA.firstPlayerContactTime !== undefined && runB.firstPlayerContactTime !== undefined
      ? Number((runA.firstPlayerContactTime - runB.firstPlayerContactTime).toFixed(2))
      : undefined;

  const firstAssassinContactDelta =
    runA.firstAssassinContactTime !== undefined && runB.firstAssassinContactTime !== undefined
      ? Number((runA.firstAssassinContactTime - runB.firstAssassinContactTime).toFixed(2))
      : undefined;

  const tankDamageDelta = runA.tankDamageTaken - runB.tankDamageTaken;
  const rangerDamageDelta = runA.rangerDamageTaken - runB.rangerDamageTaken;
  const mageDamageDelta = runA.mageDamageTaken - runB.mageDamageTaken;
  const carryDamageDelta = runA.carryDamageTaken - runB.carryDamageTaken;

  const rangerAttacksDelta = runA.rangerAttacksResolved - runB.rangerAttacksResolved;
  const mageCastsDelta = runA.mageCastsResolved - runB.mageCastsResolved;
  const assassinAttacksDelta = runA.assassinAttacksResolved - runB.assassinAttacksResolved;

  const rangerForcedKiteDelta = runA.rangerForcedKiteCount - runB.rangerForcedKiteCount;
  const mageForcedRepositionDelta = runA.mageForcedRepositionCount - runB.mageForcedRepositionCount;

  const diverInterceptionsDelta = runA.diverInterceptionCount - runB.diverInterceptionCount;
  const frontlineInterceptionsDelta = runA.frontlineInterceptionCount - runB.frontlineInterceptionCount;

  const rangerSurvivalDelta = Number((runA.rangerSurvivalTime - runB.rangerSurvivalTime).toFixed(2));
  const mageSurvivalDelta = Number((runA.mageSurvivalTime - runB.mageSurvivalTime).toFixed(2));
  const battleDurationDelta = Number((runA.battleDuration - runB.battleDuration).toFixed(2));

  const statements: string[] = [];

  // 1. Backline contact statement
  if (runA.firstBacklineHitTime !== undefined && runB.firstBacklineHitTime !== undefined) {
    const diff = Number((runA.firstBacklineHitTime - runB.firstBacklineHitTime).toFixed(1));
    if (diff > 0.05) {
      statements.push(`Backline contacted ${diff}s later in Run A (${runA.firstBacklineHitTime.toFixed(1)}s vs ${runB.firstBacklineHitTime.toFixed(1)}s)`);
    } else if (diff < -0.05) {
      statements.push(`Backline contacted ${Math.abs(diff)}s earlier in Run A (${runA.firstBacklineHitTime.toFixed(1)}s vs ${runB.firstBacklineHitTime.toFixed(1)}s)`);
    } else {
      statements.push(`Backline contacted at identical time (${runA.firstBacklineHitTime.toFixed(1)}s)`);
    }
  } else if (runA.firstBacklineHitTime === undefined && runB.firstBacklineHitTime !== undefined) {
    statements.push(`Backline remained unhit in Run A (hit at ${runB.firstBacklineHitTime.toFixed(1)}s in Run B)`);
  } else if (runA.firstBacklineHitTime !== undefined && runB.firstBacklineHitTime === undefined) {
    statements.push(`Backline hit at ${runA.firstBacklineHitTime.toFixed(1)}s in Run A (unhit in Run B)`);
  }

  // 2. Ranger attack uptime
  if (rangerAttacksDelta > 0) {
    statements.push(`Ranger resolved ${rangerAttacksDelta} more attacks in Run A (${runA.rangerAttacksResolved} vs ${runB.rangerAttacksResolved})`);
  } else if (rangerAttacksDelta < 0) {
    statements.push(`Ranger resolved ${Math.abs(rangerAttacksDelta)} fewer attacks in Run A (${runA.rangerAttacksResolved} vs ${runB.rangerAttacksResolved})`);
  }

  // 3. Mage casts
  if (mageCastsDelta > 0) {
    statements.push(`Mage completed ${mageCastsDelta} more casts in Run A (${runA.mageCastsResolved} vs ${runB.mageCastsResolved})`);
  } else if (mageCastsDelta < 0) {
    statements.push(`Mage completed ${Math.abs(mageCastsDelta)} fewer casts in Run A (${runA.mageCastsResolved} vs ${runB.mageCastsResolved})`);
  }

  // 4. Assassin contact
  if (runA.firstAssassinContactTime !== undefined && runB.firstAssassinContactTime !== undefined) {
    const diff = Number((runB.firstAssassinContactTime - runA.firstAssassinContactTime).toFixed(1));
    if (diff > 0.05) {
      statements.push(`Assassin reached deep target ${diff}s earlier in Run A (${runA.firstAssassinContactTime.toFixed(1)}s vs ${runB.firstAssassinContactTime.toFixed(1)}s)`);
    } else if (diff < -0.05) {
      statements.push(`Assassin reached deep target ${Math.abs(diff)}s later in Run A (${runA.firstAssassinContactTime.toFixed(1)}s vs ${runB.firstAssassinContactTime.toFixed(1)}s)`);
    }
  }

  // 5. Carry damage
  if (carryDamageDelta < -0.5) {
    statements.push(`Carries took ${Math.abs(carryDamageDelta)} less damage in Run A (${runA.carryDamageTaken} vs ${runB.carryDamageTaken})`);
  } else if (carryDamageDelta > 0.5) {
    statements.push(`Carries took ${carryDamageDelta} more damage in Run A (${runA.carryDamageTaken} vs ${runB.carryDamageTaken})`);
  }

  // 6. Diver interception
  if (diverInterceptionsDelta !== 0) {
    statements.push(`Diver intercepted ${runA.diverInterceptionCount} time(s) in Run A vs ${runB.diverInterceptionCount} in Run B`);
  }

  if (statements.length === 0) {
    statements.push('Both runs produced equivalent tactical metrics.');
  }

  return {
    firstPlayerContactDelta,
    firstBacklineHitDelta,
    firstCarryHitDelta,
    firstAssassinContactDelta,
    tankDamageDelta,
    rangerDamageDelta,
    mageDamageDelta,
    carryDamageDelta,
    rangerAttacksDelta,
    mageCastsDelta,
    assassinAttacksDelta,
    rangerForcedKiteDelta,
    mageForcedRepositionDelta,
    diverInterceptionsDelta,
    frontlineInterceptionsDelta,
    rangerSurvivalDelta,
    mageSurvivalDelta,
    battleDurationDelta,
    statements,
  };
}

/**
 * Returns a concise threat summary based on enemy archetypes present.
 */
export function getEnemyThreatSummary(enemyArchetypes: ReadonlyArray<string>): string {
  const hasDiver = enemyArchetypes.includes('Diver');
  const hasRanged = enemyArchetypes.includes('Ranged');
  const hasFront = enemyArchetypes.includes('Frontliner');

  if (hasDiver && hasRanged) return 'THREAT: DIVE & RANGED PRESSURE';
  if (hasDiver) return 'THREAT: BACKLINE DIVE';
  if (hasRanged) return 'THREAT: PROTECTED RANGED';
  if (hasFront) return 'THREAT: FRONTLINE PRESSURE';
  return 'THREAT: STANDARD ENCOUNTER';
}
