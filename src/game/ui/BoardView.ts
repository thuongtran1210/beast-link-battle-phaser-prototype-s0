import Phaser from 'phaser';
import { BoardModel, type BoardPosition } from '../puzzle/BoardModel';
import { type MatchResult, OnetMatcher } from '../puzzle/OnetMatcher';

export interface BoardViewEvents {
  onMatchRemoved: (result: MatchResult, contentId: string) => void;
  onInvalidSelection: () => void;
}

/** S1 presentation only: renders the model and relays selection outcomes to the scene. */
export class BoardView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly pathGraphics: Phaser.GameObjects.Graphics;
  private selected: BoardPosition[] = [];
  private inputLocked = false;
  private inputEnabled = true;
  private pendingMatch?: Phaser.Time.TimerEvent;
  private destroyed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly board: BoardModel,
    private readonly matcher: OnetMatcher,
    private readonly originX: number,
    private readonly originY: number,
    private readonly cellSize: number,
    private readonly gap: number,
    private readonly events: BoardViewEvents,
  ) {
    this.container = scene.add.container();
    this.pathGraphics = scene.add.graphics();
  }

  render(): void {
    if (this.destroyed) return;
    this.container.removeAll(true);
    const totalSize = this.board.size * this.cellSize + (this.board.size - 1) * this.gap;
    this.board.forEachPosition((position) => {
      const x = this.originX + position.col * (this.cellSize + this.gap) + this.cellSize / 2;
      const y = this.originY + position.row * (this.cellSize + this.gap) + this.cellSize / 2;
      const selected = this.selected.some((item) => item.row === position.row && item.col === position.col);
      const contentId = this.board.getContent(position);
      const fill = !contentId ? 0xe4e1da : !this.inputEnabled ? 0xc8c5be : selected ? 0xdbeafe : 0xffffff;
      const stroke = !this.inputEnabled ? 0x9a9489 : selected ? 0x2563eb : 0x8c8273;
      const cell = this.scene.add.rectangle(x, y, this.cellSize, this.cellSize, fill, contentId ? 1 : 0.45)
        .setStrokeStyle(selected ? 5 : 2, stroke, 1);
      this.container.add(cell);
      if (!contentId) return;
      if (this.inputEnabled && !this.inputLocked) {
        cell.setInteractive({ useHandCursor: true }).on('pointerup', () => this.select(position));
      }
      const label = this.scene.add.text(x, y, displayLabel(contentId.contentId), {
        fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(this.cellSize * 0.46)}px`, color: this.inputEnabled ? '#18212b' : '#6b675f', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.container.add(label);
    });
    this.container.setSize(totalSize, totalSize);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.pendingMatch?.remove(false);
    this.pendingMatch = undefined;
    this.destroyed = true;
    this.container.destroy();
    this.pathGraphics.destroy();
  }

  setInputEnabled(enabled: boolean): void {
    if (this.destroyed) return;
    this.inputEnabled = enabled;
    this.selected = [];
    if (!enabled) {
      this.inputLocked = true;
      this.pendingMatch?.remove(false);
      this.pendingMatch = undefined;
      this.pathGraphics.clear();
    } else {
      this.inputLocked = false;
    }
    this.render();
  }

  get isInputEnabled(): boolean { return this.inputEnabled; }

  private select(position: BoardPosition): void {
    if (this.inputLocked || !this.inputEnabled) return;
    if (this.selected.length === 1 && samePosition(this.selected[0], position)) {
      this.selected = [];
      this.render();
      return;
    }
    this.selected.push(position);
    if (this.selected.length < 2) {
      this.render();
      return;
    }

    const [first, second] = this.selected;
    const result = this.matcher.findMatch(this.board, first, second);
    if (!result.valid) {
      this.selected = [];
      this.events.onInvalidSelection();
      this.render();
      return;
    }

    const matchedContent = this.board.getContent(first);
    if (!matchedContent) return;
    this.inputLocked = true;
    this.drawPath(result.pathPoints);
    this.pendingMatch = this.scene.time.delayedCall(260, () => {
      this.pendingMatch = undefined;
      if (this.destroyed || !this.inputEnabled) return;
      this.board.remove(first);
      this.board.remove(second);
      this.selected = [];
      this.pathGraphics.clear();
      this.inputLocked = false;
      this.render();
      this.events.onMatchRemoved(result, matchedContent.contentId);
    });
  }

  private drawPath(points: BoardPosition[]): void {
    this.pathGraphics.clear().lineStyle(4, 0xef4444, 0.9);
    points.forEach((point, index) => {
      const x = this.originX + point.col * (this.cellSize + this.gap) + this.cellSize / 2;
      const y = this.originY + point.row * (this.cellSize + this.gap) + this.cellSize / 2;
      if (index === 0) this.pathGraphics.beginPath().moveTo(x, y);
      else this.pathGraphics.lineTo(x, y);
    });
    this.pathGraphics.strokePath();
  }
}

function displayLabel(contentId: string): string {
  const suffix = contentId.split('-').at(-1) ?? contentId;
  return suffix.slice(0, 1).toUpperCase();
}

function samePosition(first: BoardPosition, second: BoardPosition): boolean {
  return first.row === second.row && first.col === second.col;
}
