export type BeastRole = 'Tanker' | 'Assassin' | 'Ranger' | 'Mage';
export type BeastSignatureId = 'GuardianBrace' | 'AmbushStrike' | 'FocusShot' | 'ArcaneBloom' | 'IronRam' | 'TwinVolley';

/** V15A identity baseline. Signatures belong to individual Beasts, never only to roles. */
export const P1V13A_BEAST_SIGNATURES: Readonly<Record<string, BeastSignatureId>> = {
  'beast-a': 'GuardianBrace',
  'beast-b': 'AmbushStrike',
  'beast-c': 'FocusShot',
  'beast-d': 'ArcaneBloom',
  'beast-e': 'IronRam',
  'beast-f': 'TwinVolley',
};

export function signatureForBeast(beastId: string): BeastSignatureId {
  const signature = P1V13A_BEAST_SIGNATURES[beastId];
  if (!signature) throw new Error(`No experimental P1-V13A signature mapping for ${beastId}.`);
  return signature;
}

export function signatureNameForBeast(beastId: string): string {
  return signatureForBeast(beastId).replace(/([A-Z])/g, ' $1').trim();
}

/** Experimental / prototype-only P1-S2 placeholder-content mapping. */
const roles: Readonly<Record<string, BeastRole>> = {
  'beast-a': 'Tanker', 'beast-b': 'Assassin', 'beast-c': 'Ranger',
  'beast-d': 'Mage', 'beast-e': 'Tanker', 'beast-f': 'Ranger',
};

export function roleForBeast(beastId: string): BeastRole {
  const role = roles[beastId];
  if (!role) throw new Error(`No experimental P1-S2 role mapping for ${beastId}.`);
  return role;
}

export function recommendedRows(role: BeastRole): string { return role === 'Tanker' ? 'Front' : role === 'Assassin' ? 'Front / Mid' : 'Back'; }
