import type { BeastSignatureId } from '../battle/BeastRoles';

export type StarLevel = 1 | 2 | 3;

/** One V14B.3 source for stat density. Three bodies intentionally exceed one upgrade's raw total. */
export const STAR_STAT_MULTIPLIERS: Readonly<Record<StarLevel, number>> = { 1: 1, 2: 1.8, 3: 3.2 };

export const V14B3_SIGNATURE_STAR_PROFILE: Readonly<Record<BeastSignatureId, Readonly<Record<StarLevel, number>>>> = {
  GuardianBrace: { 1: 70, 2: 91, 3: 116 },
  AmbushStrike: { 1: 1.55, 2: 1.75, 3: 2.0 },
  FocusShot: { 1: 1.5, 2: 1.7, 3: 1.95 },
  ArcaneBloom: { 1: 0.5, 2: 0.65, 3: 0.8 },
};

export function starStatMultiplier(star: StarLevel): number { return STAR_STAT_MULTIPLIERS[star]; }
export function signatureStrengthForStar(signature: BeastSignatureId, star: StarLevel): number {
  return V14B3_SIGNATURE_STAR_PROFILE[signature][star];
}
