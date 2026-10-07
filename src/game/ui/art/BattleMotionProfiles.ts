export type BattleMotionProfileId =
  | 'TANK'
  | 'BRUISER'
  | 'MAGE'
  | 'RANGER_FAST'
  | 'RANGER_FOCUS'
  | 'ASSASSIN';

export interface BattleMotionProfile {
  idleBob: number;
  idleScale: number;
  idleDuration: number;
  attackX: number;
  attackScaleX: number;
  attackScaleY: number;
  attackAngle: number;
  attackDuration: number;
  hitX: number;
  hitScale: number;
  hitAngle: number;
  hitDuration: number;
  signatureScale: number;
  signatureLift: number;
  signatureDuration: number;
  koAngle: number;
  koDropY: number;
  koScaleY: number;
  koDuration: number;
}

export const BATTLE_MOTION_PROFILES: Readonly<Record<BattleMotionProfileId, BattleMotionProfile>> = {
  TANK: {
    idleBob: 2,
    idleScale: 0.018,
    idleDuration: 920,
    attackX: 9,
    attackScaleX: 1.06,
    attackScaleY: 0.97,
    attackAngle: 2,
    attackDuration: 220,
    hitX: 5,
    hitScale: 0.96,
    hitAngle: 1,
    hitDuration: 170,
    signatureScale: 1.08,
    signatureLift: 2,
    signatureDuration: 520,
    koAngle: 72,
    koDropY: 10,
    koScaleY: 0.88,
    koDuration: 420,
  },
  BRUISER: {
    idleBob: 1,
    idleScale: 0.012,
    idleDuration: 1100,
    attackX: 15,
    attackScaleX: 1.09,
    attackScaleY: 0.95,
    attackAngle: 5,
    attackDuration: 260,
    hitX: 4,
    hitScale: 0.95,
    hitAngle: 2,
    hitDuration: 180,
    signatureScale: 1.1,
    signatureLift: 1,
    signatureDuration: 500,
    koAngle: 68,
    koDropY: 12,
    koScaleY: 0.86,
    koDuration: 460,
  },
  MAGE: {
    idleBob: 4,
    idleScale: 0.025,
    idleDuration: 1250,
    attackX: 5,
    attackScaleX: 1.04,
    attackScaleY: 1.04,
    attackAngle: 2,
    attackDuration: 260,
    hitX: 7,
    hitScale: 0.95,
    hitAngle: 5,
    hitDuration: 190,
    signatureScale: 1.12,
    signatureLift: 6,
    signatureDuration: 700,
    koAngle: 82,
    koDropY: 12,
    koScaleY: 0.86,
    koDuration: 520,
  },
  RANGER_FAST: {
    idleBob: 3,
    idleScale: 0.022,
    idleDuration: 640,
    attackX: 8,
    attackScaleX: 1.08,
    attackScaleY: 0.95,
    attackAngle: 4,
    attackDuration: 150,
    hitX: 8,
    hitScale: 0.93,
    hitAngle: 7,
    hitDuration: 140,
    signatureScale: 1.08,
    signatureLift: 3,
    signatureDuration: 380,
    koAngle: 88,
    koDropY: 9,
    koScaleY: 0.84,
    koDuration: 360,
  },
  RANGER_FOCUS: {
    idleBob: 1.5,
    idleScale: 0.012,
    idleDuration: 1050,
    attackX: 5,
    attackScaleX: 1.04,
    attackScaleY: 0.98,
    attackAngle: 1,
    attackDuration: 250,
    hitX: 6,
    hitScale: 0.95,
    hitAngle: 3,
    hitDuration: 180,
    signatureScale: 1.07,
    signatureLift: 2,
    signatureDuration: 560,
    koAngle: 78,
    koDropY: 10,
    koScaleY: 0.87,
    koDuration: 420,
  },
  ASSASSIN: {
    idleBob: 2.5,
    idleScale: 0.018,
    idleDuration: 760,
    attackX: 16,
    attackScaleX: 1.1,
    attackScaleY: 0.92,
    attackAngle: 8,
    attackDuration: 150,
    hitX: 9,
    hitScale: 0.92,
    hitAngle: 8,
    hitDuration: 130,
    signatureScale: 1.1,
    signatureLift: 4,
    signatureDuration: 320,
    koAngle: 94,
    koDropY: 10,
    koScaleY: 0.82,
    koDuration: 340,
  },
};

export function battleMotionProfile(id: BattleMotionProfileId): BattleMotionProfile {
  return BATTLE_MOTION_PROFILES[id];
}
