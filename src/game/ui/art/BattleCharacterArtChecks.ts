import { BATTLE_CHARACTER_ART, type BattlePose } from './BattleCharacterManifest';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`Battle art check failed: ${message}`);
};

export function runBattleCharacterArtChecks(): void {
  const starcaller = BATTLE_CHARACTER_ART['beast-d'];
  const required: BattlePose[] = ['idle', 'attack', 'signature', 'hit', 'ko'];

  required.forEach((pose) => {
    expect(Boolean(starcaller.poses[pose]), `Starcaller registers ${pose} pose`);
  });

  expect(
    new Set(required.map((pose) => starcaller.poses[pose])).size === required.length,
    'Starcaller required pose paths are unique',
  );

  expect(
    starcaller.poses.signature?.includes('starcaller/battle_signature.svg') ?? false,
    'Starcaller Signature uses authored celestial cast pose',
  );

  const fallbackBeasts = ['beast-a', 'beast-b', 'beast-c', 'beast-e', 'beast-f'] as const;
  fallbackBeasts.forEach((beastId) => {
    expect(
      Object.keys(BATTLE_CHARACTER_ART[beastId].poses).length === 0,
      `${beastId} remains fallback-only until its authored rollout`,
    );
  });

  expect(starcaller.effectAnchorY < 0, 'Starcaller effect anchor sits above ground origin');
  expect(starcaller.hpAnchorY < starcaller.effectAnchorY, 'Starcaller HP bar sits above effect anchor');
}
