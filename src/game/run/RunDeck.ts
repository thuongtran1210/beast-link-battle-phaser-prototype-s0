export const DECK_UNITS = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f', 'beast-g', 'beast-h', 'beast-i', 'beast-j'] as const;
export function validDeck(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length !== 6) return undefined;
  if (new Set(value).size !== value.length || value.some(id => !DECK_UNITS.includes(id))) return undefined;
  return [...value];
}
let activeDeck: string[] = DECK_UNITS.slice(0, 6);
export function lockRunDeck(value: unknown): void {
  const deck = validDeck(value);
  if (!deck) throw new Error('Select exactly 6 unique available Beasts');
  activeDeck = deck;
}
export function runDeckPool(): string[] { return [...activeDeck]; }
