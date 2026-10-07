import type { BeastSignatureId } from '../battle/BeastRoles';

export type StarLevel = 1 | 2 | 3;

/** One V14B.3 source for stat density. Three bodies intentionally exceed one upgrade's raw total. */
export const STAR_STAT_MULTIPLIERS: Readonly<Record<StarLevel, number>> = { 1: 1, 2: 1.8, 3: 3.2 };

export const V14B3_SIGNATURE_STAR_PROFILE: Readonly<Record<BeastSignatureId, Readonly<Record<StarLevel, number>>>> = {
  GuardianBrace: { 1: 70, 2: 91, 3: 116 },
  AmbushStrike: { 1: 1.55, 2: 1.75, 3: 2.0 },
  FocusShot: { 1: 1.5, 2: 1.7, 3: 1.95 },
  ArcaneBloom: { 1: 0.5, 2: 0.65, 3: 0.8 },
  IronRam: { 1: 1.3, 2: 1.55, 3: 1.8 },
  TwinVolley: { 1: 0.4, 2: 0.6, 3: 0.8 },
};

export function starStatMultiplier(star: StarLevel): number { return STAR_STAT_MULTIPLIERS[star]; }
export function signatureStrengthForStar(signature: BeastSignatureId, star: StarLevel): number {
  return V14B3_SIGNATURE_STAR_PROFILE[signature][star];
}


/**
 * V15A STAR evolution changes behavior as well as magnitude.
 * These helpers intentionally keep the rules deterministic and easy to validate.
 */
export function guardianBraceActivationLimit(star: StarLevel): number {
  return star === 1 ? 1 : 2;
}
export function guardianBraceShareRatio(star: StarLevel): number {
  return star === 3 ? 0.45 : 0;
}

export function ambushActivationLimit(star: StarLevel): number {
  return star === 1 ? 1 : star === 2 ? 2 : 3;
}
export function ambushChainRatio(star: StarLevel): number {
  return star === 3 ? 0.65 : 0;
}

export function focusHoldThresholdForStar(star: StarLevel): number {
  return star === 1 ? 1.6 : star === 2 ? 1.25 : 1.0;
}
export function focusPierceTargets(star: StarLevel): number {
  return star === 3 ? 1 : 0;
}
export function focusPierceRatio(star: StarLevel): number {
  return star === 3 ? 0.55 : 0;
}

export function arcaneBloomRadiusForStar(star: StarLevel): number {
  return star === 1 ? 1.25 : star === 2 ? 1.55 : 1.85;
}
export function arcaneBloomSecondaryLimitForStar(star: StarLevel): number {
  return star === 1 ? 2 : star === 2 ? 3 : 4;
}
export function arcaneBloomEchoRatio(star: StarLevel): number {
  return star === 3 ? 0.35 : 0;
}

export function ironRamKnockbackForStar(star: StarLevel): number {
  return star === 1 ? 0.35 : star === 2 ? 0.55 : 0.7;
}
export function ironRamStaggerForStar(star: StarLevel): number {
  return star === 1 ? 0 : star === 2 ? 0.35 : 0.55;
}
export function ironRamCleaveTargets(star: StarLevel): number {
  return star === 3 ? 1 : 0;
}
export function ironRamCleaveRatio(star: StarLevel): number {
  return star === 3 ? 0.6 : 0;
}

export function twinVolleyAttackThreshold(star: StarLevel): number {
  return star === 1 ? 3 : star === 2 ? 2 : 1;
}
export function twinVolleySecondaryTargets(star: StarLevel): number {
  return star === 3 ? 2 : 1;
}


export function signatureTierLabel(signature: BeastSignatureId, star: StarLevel): string {
  const roman = star === 1 ? 'I' : star === 2 ? 'II' : 'III';
  const name = signature.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  return `${name} ${roman}`;
}

export function signatureTierSummary(signature: BeastSignatureId, star: StarLevel): string {
  switch (signature) {
    case 'GuardianBrace':
      return star === 1
        ? 'Shield the first intercept'
        : star === 2
        ? 'Can Brace a second intercept'
        : 'Shares part of Brace with an injured ally';
    case 'AmbushStrike':
      return star === 1
        ? 'Burst the first deep target'
        : star === 2
        ? 'Re-arms for a second deep target'
        : 'Ambush kill chains a follow-up strike';
    case 'FocusShot':
      return star === 1
        ? 'Hold safely to charge Focus'
        : star === 2
        ? 'Focus charges faster'
        : 'Focused shot pierces one extra target';
    case 'ArcaneBloom':
      return star === 1
        ? 'Clustered enemies trigger splash'
        : star === 2
        ? 'Bloom reaches a wider cluster'
        : 'Bloom echoes into a second impact';
    case 'IronRam':
      return star === 1
        ? 'Opening ram knocks the Frontliner back'
        : star === 2
        ? 'Ram also staggers the target'
        : 'Ram cleaves one nearby enemy';
    case 'TwinVolley':
      return star === 1
        ? 'Every third shot fires a second arrow'
        : star === 2
        ? 'Every second shot triggers Volley'
        : 'Every shot can hit two extra targets';
  }
}


/** Compact player-facing copy for Battle Setup cards; keep to one short line at 1280×720. */
export function signatureTierTagline(signature: BeastSignatureId, star: StarLevel): string {
  switch (signature) {
    case 'GuardianBrace': return star === 1 ? '1st intercept shield' : star === 2 ? '2 intercept shields' : 'share shield with ally';
    case 'AmbushStrike': return star === 1 ? 'deep-target burst' : star === 2 ? 're-arm once' : 'kill chains a strike';
    case 'FocusShot': return star === 1 ? 'hold → charge Focus' : star === 2 ? 'faster Focus charge' : 'Focus pierces +1';
    case 'ArcaneBloom': return star === 1 ? 'cluster splash' : star === 2 ? 'wider Bloom' : 'Bloom + Echo';
    case 'IronRam': return star === 1 ? 'knockback Frontliner' : star === 2 ? 'Ram + stagger' : 'Ram + cleave';
    case 'TwinVolley': return star === 1 ? 'Volley every 3rd' : star === 2 ? 'Volley every 2nd' : 'Volley every shot';
  }
}
