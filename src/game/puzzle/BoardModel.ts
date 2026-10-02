export interface BoardPosition {
  row: number;
  col: number;
}

/** PHASE-001: S2 uses Beast-only content without a full BeastDefinition system. */
export interface TileContent {
  type: 'Beast' | 'Energy';
  contentId: string;
}

export interface Tile extends BoardPosition {
  content: TileContent;
}

/** PUZ-001 / PUZ-003: framework-independent playable board state. */
export class BoardModel {
  private readonly cells: Array<TileContent | null>;

  constructor(
    readonly size: number,
    content?: ReadonlyArray<TileContent | string | null>,
  ) {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error('Board size must be a positive integer.');
    }

    const cellCount = size * size;
    if (content && content.length !== cellCount) {
      throw new Error(`Expected ${cellCount} board cells, received ${content.length}.`);
    }
    this.cells = content ? content.map(normalizeContent) : Array<TileContent | null>(cellCount).fill(null);
  }

  isPlayable(position: BoardPosition): boolean {
    return position.row >= 0 && position.row < this.size && position.col >= 0 && position.col < this.size;
  }

  getContent(position: BoardPosition): TileContent | null {
    return this.isPlayable(position) ? this.cells[this.index(position)] : null;
  }

  isEmpty(position: BoardPosition): boolean {
    return this.getContent(position) === null;
  }

  setContent(position: BoardPosition, content: TileContent | null): void {
    if (!this.isPlayable(position)) throw new Error('Cannot write outside the playable board.');
    this.cells[this.index(position)] = content;
  }

  remove(position: BoardPosition): void {
    this.setContent(position, null);
  }

  getTile(position: BoardPosition): Tile | null {
    const content = this.getContent(position);
    return content === null ? null : { ...position, content };
  }

  occupiedTiles(): Tile[] {
    const tiles: Tile[] = [];
    this.forEachPosition((position) => {
      const tile = this.getTile(position);
      if (tile) tiles.push(tile);
    });
    return tiles;
  }

  remainingContent(): TileContent[] {
    return this.cells.filter((content): content is TileContent => content !== null);
  }

  replaceOccupiedContent(content: ReadonlyArray<TileContent>): void {
    const positions = this.occupiedTiles().map(({ row, col }) => ({ row, col }));
    if (positions.length !== content.length) {
      throw new Error('Reshuffle content count must match occupied cell count.');
    }
    positions.forEach((position, index) => this.setContent(position, content[index]));
  }

  forEachPosition(visitor: (position: BoardPosition) => void): void {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) visitor({ row, col });
    }
  }

  private index(position: BoardPosition): number {
    return position.row * this.size + position.col;
  }
}

function normalizeContent(content: TileContent | string | null): TileContent | null {
  return typeof content === 'string' ? { type: 'Beast', contentId: content } : content;
}
