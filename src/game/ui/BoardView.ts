import Phaser from 'phaser';
import { BoardModel, type BoardPosition } from '../puzzle/BoardModel';
import { type MatchResult, OnetMatcher } from '../puzzle/OnetMatcher';
import { HudTokens } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

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
    this.pathGraphics.setDepth(10);
  }

  render(): void {
    if (this.destroyed) return;
    this.container.removeAll(true);
    const totalSize = this.board.size * this.cellSize + (this.board.size - 1) * this.gap;

    // Outer subtle board border/mat
    const boardMat = this.scene.add
      .rectangle(
        this.originX + totalSize / 2,
        this.originY + totalSize / 2,
        totalSize + 16,
        totalSize + 16,
        0x111827,
        0.8,
      )
      .setStrokeStyle(1.5, HudTokens.colors.strokeHighlight);
    this.container.add(boardMat);

    this.board.forEachPosition((position) => {
      const x = this.originX + position.col * (this.cellSize + this.gap) + this.cellSize / 2;
      const y = this.originY + position.row * (this.cellSize + this.gap) + this.cellSize / 2;
      const selected = this.selected.some((item) => item.row === position.row && item.col === position.col);
      const contentId = this.board.getContent(position);

      if (!contentId) {
        // Empty slot
        const emptyCell = this.scene.add
          .rectangle(x, y, this.cellSize, this.cellSize, 0x18212b, 0.4)
          .setStrokeStyle(1, 0x243242, 0.4);
        this.container.add(emptyCell);
        return;
      }

      const letter = displayLabel(contentId.contentId);
      const isEnergy = contentId.contentId.startsWith('energy-');
      const tileColor = isEnergy ? energyColor(letter) : beastColor(letter);

      const fill = !this.inputEnabled
        ? 0x1e293b
        : selected
        ? 0x1d4ed8
        : 0x1e293b;

      const stroke = !this.inputEnabled
        ? 0x334155
        : selected
        ? 0xfbbf24
        : tileColor;

      const strokeWidth = selected ? 3.5 : 1.5;

      const cell = this.scene.add
        .rectangle(x, y, this.cellSize, this.cellSize, fill, 0.95)
        .setStrokeStyle(strokeWidth, stroke);

      // Top color indicator strip
      const stripH = Math.max(4, Math.round(this.cellSize * 0.08));
      const strip = this.scene.add
        .rectangle(x, y - this.cellSize / 2 + stripH / 2, this.cellSize - 4, stripH, tileColor, selected ? 1 : 0.9);

      this.container.add(cell);
      this.container.add(strip);

      if (this.inputEnabled && !this.inputLocked) {
        cell.setInteractive({ useHandCursor: true }).on('pointerup', () => this.select(position));
      }

      // Center Icon Badge
      const iconSize = Math.round(this.cellSize * 0.62);
      const iconImage = createIconImage(this.scene, contentId.contentId, x, y - 2, iconSize);
      if (!this.inputEnabled) {
        iconImage.setAlpha(0.45);
      }
      this.container.add(iconImage);

      // Top-right corner small fallback ID letter
      const idTag = this.scene.add
        .text(x + this.cellSize / 2 - 7, y - this.cellSize / 2 + 6, letter, {
          fontFamily: HudTokens.fonts.family,
          fontSize: `${Math.max(9, Math.round(this.cellSize * 0.13))}px`,
          color: selected ? '#fbbf24' : '#94a3b8',
          fontStyle: 'bold',
        })
        .setOrigin(1, 0);
      this.container.add(idTag);

      if (this.inputEnabled && !this.inputLocked) {
        iconImage.setInteractive({ useHandCursor: true }).on('pointerup', () => this.select(position));
      }

      // Subtle type subscript
      const roleText = isEnergy ? 'ENERGY' : beastSubscript(letter);
      const subLabel = this.scene.add
        .text(x, y + this.cellSize * 0.35, roleText, {
          fontFamily: HudTokens.fonts.family,
          fontSize: `${Math.max(8, Math.round(this.cellSize * 0.11))}px`,
          color: selected ? '#93c5fd' : '#cbd5e1',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.container.add(subLabel);
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

  get isInputEnabled(): boolean {
    return this.inputEnabled;
  }

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
    this.pathGraphics.clear();
    // Glowing underlay
    this.pathGraphics.lineStyle(8, 0xfbbf24, 0.4);
    points.forEach((point, index) => {
      const x = this.originX + point.col * (this.cellSize + this.gap) + this.cellSize / 2;
      const y = this.originY + point.row * (this.cellSize + this.gap) + this.cellSize / 2;
      if (index === 0) this.pathGraphics.beginPath().moveTo(x, y);
      else this.pathGraphics.lineTo(x, y);
    });
    this.pathGraphics.strokePath();

    // Sharp bright core line
    this.pathGraphics.lineStyle(4, 0xffffff, 1.0);
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

function beastColor(letter: string): number {
  switch (letter) {
    case 'A': return 0xfacc15; // Tanker (Gold)
    case 'B': return 0xf97316; // Assassin (Orange)
    case 'C': return 0x22c55e; // Ranger (Green)
    case 'D': return 0xa855f7; // Mage (Purple)
    case 'E': return 0x38bdf8; // Tanker (Cyan)
    case 'F': return 0xec4899; // Ranger (Pink)
    default: return 0x94a3b8;
  }
}

function beastSubscript(letter: string): string {
  switch (letter) {
    case 'A': return 'TANK';
    case 'B': return 'ASSS';
    case 'C': return 'RNGR';
    case 'D': return 'MAGE';
    case 'E': return 'TANK';
    case 'F': return 'RNGR';
    default: return 'UNIT';
  }
}

function energyColor(letter: string): number {
  switch (letter) {
    case 'A': return 0x38bdf8;
    case 'B': return 0x818cf8;
    case 'C': return 0x34d399;
    case 'D': return 0xfbbf24;
    case 'E': return 0xf472b6;
    case 'F': return 0xa78bfa;
    default: return 0x38bdf8;
  }
}
