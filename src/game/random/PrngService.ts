/**
 * Deterministic Pseudo-Random Number Generator (PRNG) Service.
 * Implements the Mulberry32 algorithm:
 * - 32-bit internal state.
 * - Fast, lightweight, uniform distribution with a 2^32 period.
 * - Completely deterministic given a seed, suitable for network sync & replay.
 */
export class PrngService {
  private state: number;
  private readonly initialSeed: number;

  constructor(seed: number = 1337) {
    this.initialSeed = seed >>> 0;
    this.state = this.initialSeed;
  }

  /**
   * Resets the generator with a new seed.
   */
  setSeed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Returns the initial seed configured for this generator.
   */
  getInitialSeed(): number {
    return this.initialSeed;
  }

  /**
   * Returns current internal state integer (can be saved for replay/checkpoint).
   */
  getState(): number {
    return this.state;
  }

  /**
   * Restores generator to an earlier state integer.
   */
  restoreState(state: number): void {
    this.state = state >>> 0;
  }

  /**
   * Generates a pseudo-random floating point number in [0, 1).
   * Compatible as a drop-in replacement for Math.random.
   */
  next = (): number => {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /**
   * Generates a pseudo-random integer in [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generates a pseudo-random floating point number in [min, max).
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Picks a random element from an array.
   */
  pick<T>(array: ReadonlyArray<T>): T | undefined {
    if (array.length === 0) return undefined;
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * Shuffles an array deterministically using Fisher-Yates.
   * Returns a new array, does not mutate original.
   */
  shuffle<T>(array: ReadonlyArray<T>): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /**
   * Creates an independent child PRNG branched deterministically from current sequence.
   */
  fork(): PrngService {
    const childSeed = (this.next() * 0xffffffff) >>> 0;
    return new PrngService(childSeed);
  }
}
