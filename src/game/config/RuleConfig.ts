/**
 * Adopted gameplay baseline copied from Current Gameplay Spec v1.
 * This file is implementation mapping, not a second design source of truth.
 */
export const RuleConfig = {
  // PUZ-001
  boardSize: 6,

  // MATCH-001
  maxPathTurns: 2,

  // COMBO-002 / COMBO-003 / COMBO-004
  comboInitialSeconds: 5.0,
  comboBonusSeconds: 0.3,
  comboCapSeconds: 5.0,

  // QUEUE-001
  queuePerBeastMatch: 1,

  // STAR-001
  starCosts: {
    star1: 1,
    star2: 3,
    star3: 9,
  },

  // ENERGY-001 / ENERGY-002
  energyPerMatch: 10,
  energyMax: 20,
} as const;

export type RuleConfigType = typeof RuleConfig;
