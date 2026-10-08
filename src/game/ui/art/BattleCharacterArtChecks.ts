import { BATTLE_CHARACTER_ART } from './BattleCharacterManifest';
import { BATTLE_MOTION_PROFILES } from './BattleMotionProfiles';
import { ENEMY_CHARACTER_ART } from './EnemyCharacterManifest';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`Battle art check failed: ${message}`);
};

export function runBattleCharacterArtChecks(): void {
  const expectedProfiles = {
    'beast-a': 'TANK',
    'beast-b': 'ASSASSIN',
    'beast-c': 'RANGER_FOCUS',
    'beast-d': 'MAGE',
    'beast-e': 'BRUISER',
    'beast-f': 'RANGER_FAST',
  } as const;

  Object.entries(expectedProfiles).forEach(([beastId, profile]) => {
    const definition = BATTLE_CHARACTER_ART[beastId as keyof typeof BATTLE_CHARACTER_ART];

    expect(Boolean(definition), `${beastId} has art definition`);
    expect(definition.motionProfile === profile, `${beastId} uses ${profile} motion profile`);
    expect(Boolean(BATTLE_MOTION_PROFILES[profile]), `${profile} motion profile exists`);
    expect(Boolean(definition.base), `${beastId} registers V2 base cutout`);
    expect(Boolean(definition.icon), `${beastId} registers V2 icon art`);
    expect(definition.effectAnchorY < 0, `${beastId} effect anchor sits above ground`);
    expect(definition.hpAnchorY < definition.effectAnchorY, `${beastId} HP anchor sits above effect anchor`);

    // Production guardrail: player Battle art must never depend on the old
    // rectangular-card fallback or five-pose authored pipeline again.
    expect(Object.keys(definition.poses).length === 0, `${beastId} has zero V1 pose dependencies`);
    expect(!definition.signature, `${beastId} uses transform + VFX for Signature by default`);
    expect(!definition.ko, `${beastId} uses transform-driven KO by default`);
  });

  (['Frontliner', 'Diver', 'Ranged'] as const).forEach((archetype) => {
    const definition = ENEMY_CHARACTER_ART[archetype];
    expect(Boolean(definition.base), `${archetype} registers V2 enemy base cutout`);
    expect(definition.displayHeight > 0, `${archetype} has positive display height`);
    expect(definition.hpAnchorY < 0, `${archetype} HP anchor sits above ground`);
  });

}
