import { BoardModel, type BoardPosition, type Tile } from './BoardModel';

export interface MatchResult {
  valid: boolean;
  pathPoints: BoardPosition[];
  turnCount: number;
}

/** PUZ-002 / MATCH-001: validates paths through empty cells plus a logical outer border. */
export class OnetMatcher {
  findMatch(board: BoardModel, first: BoardPosition, second: BoardPosition): MatchResult {
    const firstTile = board.getTile(first);
    const secondTile = board.getTile(second);
    if (!firstTile || !secondTile || this.samePosition(first, second) || firstTile.content.contentId !== secondTile.content.contentId) {
      return invalidMatch();
    }

    const candidates: BoardPosition[][] = [[first, second]];
    candidates.push([first, { row: first.row, col: second.col }, second]);
    candidates.push([first, { row: second.row, col: first.col }, second]);

    // The expanded coordinate range is the logical one-cell outer border (PUZ-002).
    for (let row = -1; row <= board.size; row += 1) {
      candidates.push([first, { row, col: first.col }, { row, col: second.col }, second]);
    }
    for (let col = -1; col <= board.size; col += 1) {
      candidates.push([first, { row: first.row, col }, { row: second.row, col }, second]);
    }

    for (const candidate of candidates) {
      const pathPoints = compactPath(candidate);
      const turnCount = Math.max(0, pathPoints.length - 2);
      if (turnCount <= 2 && this.isClearPath(board, pathPoints, secondTile)) {
        return { valid: true, pathPoints, turnCount };
      }
    }
    return invalidMatch();
  }

  findAnyMatch(board: BoardModel): MatchResult | null {
    const tiles = board.occupiedTiles();
    for (let first = 0; first < tiles.length; first += 1) {
      for (let second = first + 1; second < tiles.length; second += 1) {
        if (tiles[first].content.contentId !== tiles[second].content.contentId) continue;
        const result = this.findMatch(board, tiles[first], tiles[second]);
        if (result.valid) return result;
      }
    }
    return null;
  }

  private isClearPath(board: BoardModel, path: BoardPosition[], target: Tile): boolean {
    for (let segment = 0; segment < path.length - 1; segment += 1) {
      const start = path[segment];
      const end = path[segment + 1];
      if (start.row !== end.row && start.col !== end.col) return false;
      const rowStep = Math.sign(end.row - start.row);
      const colStep = Math.sign(end.col - start.col);
      let row = start.row + rowStep;
      let col = start.col + colStep;
      while (row !== end.row || col !== end.col) {
        if (board.isPlayable({ row, col }) && !board.isEmpty({ row, col })) return false;
        row += rowStep;
        col += colStep;
      }
      if (!this.samePosition(end, target) && board.isPlayable(end) && !board.isEmpty(end)) return false;
    }
    return true;
  }

  private samePosition(first: BoardPosition, second: BoardPosition): boolean {
    return first.row === second.row && first.col === second.col;
  }
}

function compactPath(points: BoardPosition[]): BoardPosition[] {
  const unique = points.filter((point, index) => index === 0 || point.row !== points[index - 1].row || point.col !== points[index - 1].col);
  return unique.filter((point, index) => {
    if (index === 0 || index === unique.length - 1) return true;
    const previous = unique[index - 1];
    const next = unique[index + 1];
    return !((previous.row === point.row && point.row === next.row) || (previous.col === point.col && point.col === next.col));
  });
}

function invalidMatch(): MatchResult {
  return { valid: false, pathPoints: [], turnCount: 0 };
}
