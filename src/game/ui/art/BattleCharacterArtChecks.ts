import { BATTLE_CHARACTER_ART } from './BattleCharacterManifest';
import { BATTLE_MOTION_PROFILES } from './BattleMotionProfiles';

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
    expect(definition.effectAnchorY < 0, `${beastId} effect anchor sits above ground`);
    expect(definition.hpAnchorY < definition.effectAnchorY, `${beastId} HP anchor sits above effect anchor`);
  });

  const starcaller = BATTLE_CHARACTER_ART['beast-d'];
  const snowguard = BATTLE_CHARACTER_ART['beast-a'];

  // Snowguard is the first pure V2 production unit.
  expect(Boolean(snowguard.base), 'Snowguard registers simple V2 base art');
  expect(Boolean(snowguard.icon), 'Snowguard registers simple V2 icon art');
  expect(!snowguard.signature, 'Snowguard does not require authored Signature pose art');
  expect(!snowguard.ko, 'Snowguard does not require authored KO pose art');
  expect(Object.keys(snowguard.poses).length === 0, 'Snowguard has zero V1 pose dependencies');

  // Starcaller remains the compatibility unit until its V2 base migration.
  expect(Boolean(starcaller.base), 'Starcaller registers V2-compatible base art');
  expect(Boolean(starcaller.signature), 'Starcaller keeps optional Signature art during migration');

  const remaining = ['beast-b', 'beast-c', 'beast-e', 'beast-f'] as const;
  remaining.forEach((beastId) => {
    expect(
      !BATTLE_CHARACTER_ART[beastId].base,
      `${beastId} remains fallback-only until simple V2 base art is integrated`,
    );
  });

  // Production-cost guardrail: new V2 art must not require attack/hit images.
  remaining.forEach((beastId) => {
    expect(
      !BATTLE_CHARACTER_ART[beastId].poses.attack && !BATTLE_CHARACTER_ART[beastId].poses.hit,
      `${beastId} has no mandatory V1 attack/hit pose dependency`,
    );
  });
}
