import { BoardModel, type TileContent } from './BoardModel';

/** PUZ-003: creates and reshuffles matching content independently of rendering. */
export class BoardGenerator {
  generate(size: number, contentIds: ReadonlyArray<string>, random = Math.random, type: 'Beast' | 'Energy' = 'Beast'): BoardModel {
    const cellCount = size * size;
    if (cellCount % 2 !== 0) {
      throw new Error('This S1 generator requires an even playable cell count for matching pairs.');
    }
    if (contentIds.length === 0) throw new Error('At least one content ID is required.');

    const contents: TileContent[] = [];
    for (let pair = 0; pair < cellCount / 2; pair += 1) {
      const contentId = contentIds[pair % contentIds.length];
      contents.push({ type, contentId }, { type, contentId });
    }
    return new BoardModel(size, this.shuffle(contents, random));
  }

  reshuffleRemaining(board: BoardModel, random = Math.random): void {
    board.replaceOccupiedContent(this.shuffle(board.remainingContent(), random));
  }

  private shuffle<T>(values: ReadonlyArray<T>, random: () => number): T[] {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }
}
