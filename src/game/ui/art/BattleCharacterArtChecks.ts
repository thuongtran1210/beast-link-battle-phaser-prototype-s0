import { BATTLE_CHARACTER_ART, type BattlePose } from './BattleCharacterManifest';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`Battle art check failed: ${message}`);
};

export function runBattleCharacterArtChecks(): void {
  const starcaller = BATTLE_CHARACTER_ART['beast-d'];
  const snowguard = BATTLE_CHARACTER_ART['beast-a'];
  const required: BattlePose[] = ['idle', 'attack', 'signature', 'hit', 'ko'];

  required.forEach((pose) => {
    expect(Boolean(starcaller.poses[pose]), `Starcaller registers ${pose} pose`);
    expect(Boolean(snowguard.poses[pose]), `Snowguard registers ${pose} pose`);
  });

  expect(
    new Set(required.map((pose) => starcaller.poses[pose])).size === required.length,
    'Starcaller required pose paths are unique',
  );
  expect(
    new Set(required.map((pose) => snowguard.poses[pose])).size === required.length,
    'Snowguard required pose paths are unique',
  );

  expect(
    starcaller.poses.signature?.includes('starcaller/battle_signature.svg') ?? false,
    'Starcaller Signature uses authored celestial cast pose',
  );
  expect(
    snowguard.poses.signature?.includes('snowguard/battle_signature.svg') ?? false,
    'Snowguard Signature uses authored Guardian Brace pose',
  );

  const fallbackBeasts = ['beast-b', 'beast-c', 'beast-e', 'beast-f'] as const;
  fallbackBeasts.forEach((beastId) => {
    expect(
      Object.keys(BATTLE_CHARACTER_ART[beastId].poses).length === 0,
      `${beastId} remains fallback-only until its authored rollout`,
    );
  });

  expect(starcaller.effectAnchorY < 0, 'Starcaller effect anchor sits above ground origin');
  expect(starcaller.hpAnchorY < starcaller.effectAnchorY, 'Starcaller HP bar sits above effect anchor');
  expect(snowguard.effectAnchorY < 0, 'Snowguard Guardian Brace anchor sits above ground origin');
  expect(snowguard.hpAnchorY < snowguard.effectAnchorY, 'Snowguard HP bar sits above shield/effect anchor');
}
