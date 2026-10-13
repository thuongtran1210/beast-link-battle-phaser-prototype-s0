import { PrngService } from './PrngService';
import { BoardGenerator } from '../puzzle/BoardGenerator';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`PRNG Check Failed: ${message}`);
}

export function runPrngChecks(): void {
  // Check 1: Deterministic output from same seed
  const prngA = new PrngService(424242);
  const prngB = new PrngService(424242);

  for (let i = 0; i < 50; i++) {
    expect(prngA.next() === prngB.next(), `Step ${i}: prngA and prngB must yield identical next() values`);
  }

  for (let i = 0; i < 50; i++) {
    const valA = prngA.nextInt(10, 500);
    const valB = prngB.nextInt(10, 500);
    expect(valA === valB, `Step ${i}: prngA and prngB must yield identical nextInt() values`);
    expect(valA >= 10 && valA <= 500, `valA (${valA}) must be within [10, 500]`);
  }

  // Check 2: Save and Restore state
  const prngC = new PrngService(99999);
  for (let i = 0; i < 15; i++) prngC.next();
  const savedState = prngC.getState();

  const generatedAfterSave: number[] = [];
  for (let i = 0; i < 20; i++) {
    generatedAfterSave.push(prngC.next());
  }

  prngC.restoreState(savedState);
  const regeneratedAfterRestore: number[] = [];
  for (let i = 0; i < 20; i++) {
    regeneratedAfterRestore.push(prngC.next());
  }

  for (let i = 0; i < 20; i++) {
    expect(
      generatedAfterSave[i] === regeneratedAfterRestore[i],
      `State restoration must replay identical values at index ${i}`,
    );
  }

  // Check 3: Deterministic array shuffle
  const items = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f'];
  const p1 = new PrngService(12345);
  const p2 = new PrngService(12345);
  const shuffled1 = p1.shuffle(items);
  const shuffled2 = p2.shuffle(items);

  expect(JSON.stringify(shuffled1) === JSON.stringify(shuffled2), 'Shuffling with same seed must match exactly');

  // Check 4: BoardGenerator produces 100% identical boards with same seed
  const generator = new BoardGenerator();
  const boardRng1 = new PrngService(777);
  const boardRng2 = new PrngService(777);
  const testIds = ['beast-a', 'beast-b', 'beast-c'];

  const board1 = generator.generate(6, testIds, boardRng1);
  const board2 = generator.generate(6, testIds, boardRng2);

  const tiles1 = board1.occupiedTiles().map((t) => t.content?.contentId ?? null);
  const tiles2 = board2.occupiedTiles().map((t) => t.content?.contentId ?? null);

  expect(JSON.stringify(tiles1) === JSON.stringify(tiles2), 'BoardGenerator with identical seed must produce identical boards');

  // Check 5: Different seeds produce different boards
  const boardRngDiff = new PrngService(888);
  const boardDiff = generator.generate(6, testIds, boardRngDiff);
  const tilesDiff = boardDiff.occupiedTiles().map((t) => t.content?.contentId ?? null);
  expect(JSON.stringify(tiles1) !== JSON.stringify(tilesDiff), 'Different seeds must produce different board layouts');

  // Check 6: PRNG Fork produces repeatable deterministic branches
  const parent1 = new PrngService(55555);
  const parent2 = new PrngService(55555);
  const child1 = parent1.fork();
  const child2 = parent2.fork();

  for (let i = 0; i < 20; i++) {
    expect(child1.next() === child2.next(), `Forked child generators must match at index ${i}`);
  }
}
