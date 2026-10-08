import { DECK_UNITS, lockRunDeck, runDeckPool, validDeck } from './RunDeck';
export function runDeckChecks(): void {
  const expect = (value: boolean) => { if (!value) throw new Error('Run deck check failed'); };
  expect(!validDeck(null) && !validDeck(['beast-a']) && !validDeck(['beast-a', 'beast-a', 'beast-b', 'beast-c']));
  expect(!validDeck(['beast-a', 'beast-b', 'beast-c', 'unknown']));
  lockRunDeck(DECK_UNITS.slice(0, 6));
  const pool = runDeckPool(); pool.pop();
  expect(runDeckPool().length === 6 && runDeckPool().every(id => DECK_UNITS.slice(0, 6).includes(id as typeof DECK_UNITS[number])));
  lockRunDeck(DECK_UNITS.slice(0, 6));
  expect(runDeckPool().length === 6);
}
