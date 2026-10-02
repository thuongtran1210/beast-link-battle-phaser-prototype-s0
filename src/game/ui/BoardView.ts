import Phaser from 'phaser';
import { BoardModel, type BoardPosition } from '../puzzle/BoardModel';
import { type MatchResult, OnetMatcher } from '../puzzle/OnetMatcher';
import { HudTokens } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';
import { FeedbackEffects } from './feedback/FeedbackEffects';

export interface BoardViewEvents {
  onMatchRemoved: (result: MatchResult, contentId: string, midpoint?: { x: number; y: number }) => void;
  onInvalidSelection: () => void;
}

interface TileVisual {
  container: Phaser.GameObjects.Container;
  cell: Phaser.GameObjects.Rectangle;
  position: BoardPosition;
}

/** S1 presentation only: renders the model, handles interactive feedback and relays selection outcomes to the scene. */
export class BoardView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly pathGraphics: Phaser.GameObjects.Graphics;
  private selected: BoardPosition[] = [];
  private inputLocked = false;
  private inputEnabled = true;
  private pendingMatch?: Phaser.Time.TimerEvent;
  private destroyed = false;
  private readonly tileMap = new Map<string, TileVisual>();

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
    this.tileMap.clear();
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
          .rectangle(x, y, this.cellSize, this.cellSize, 0x18212b, 0.35)
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

      // Group tile visuals inside container centered at (x, y) for smooth scaling/hover
      const tileContainer = this.scene.add.container(x, y);

      const cell = this.scene.add
        .rectangle(0, 0, this.cellSize, this.cellSize, fill, 0.95)
        .setStrokeStyle(strokeWidth, stroke);

      // Top color indicator strip
      const stripH = Math.max(4, Math.round(this.cellSize * 0.08));
      const strip = this.scene.add
        .rectangle(0, -this.cellSize / 2 + stripH / 2, this.cellSize - 4, stripH, tileColor, selected ? 1 : 0.9);

      // Center Icon Badge
      const iconSize = Math.round(this.cellSize * 0.62);
      const iconImage = createIconImage(this.scene, contentId.contentId, 0, -2, iconSize);
      if (!this.inputEnabled) {
        iconImage.setAlpha(0.45);
      }

      // Top-right corner small fallback ID letter
      const idTag = this.scene.add
        .text(this.cellSize / 2 - 7, -this.cellSize / 2 + 6, letter, {
          fontFamily: HudTokens.fonts.family,
          fontSize: `${Math.max(9, Math.round(this.cellSize * 0.13))}px`,
          color: selected ? '#fbbf24' : '#94a3b8',
          fontStyle: 'bold',
        })
        .setOrigin(1, 0);

      // Subtle type subscript
      const roleText = isEnergy ? 'ENERGY' : beastSubscript(letter);
      const subLabel = this.scene.add
        .text(0, this.cellSize * 0.35, roleText, {
          fontFamily: HudTokens.fonts.family,
          fontSize: `${Math.max(8, Math.round(this.cellSize * 0.11))}px`,
          color: selected ? '#93c5fd' : '#cbd5e1',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      tileContainer.add([cell, strip, iconImage, idTag, subLabel]);
      this.container.add(tileContainer);

      const key = `${position.row},${position.col}`;
      this.tileMap.set(key, { container: tileContainer, cell, position });

      if (selected) {
        tileContainer.setScale(1.07);
      }

      // Interactivity & Hover Feedback
      if (this.inputEnabled && !this.inputLocked) {
        cell.setInteractive({ useHandCursor: true });
        iconImage.setInteractive({ useHandCursor: true });

        const onPointerOver = () => {
          if (this.inputLocked || !this.inputEnabled) return;
          const isCurrSelected = this.selected.some((item) => samePosition(item, position));
          if (!isCurrSelected) {
            this.scene.tweens.add({
              targets: tileContainer,
              scaleX: 1.05,
              scaleY: 1.05,
              duration: 80,
              ease: 'Quad.Out',
            });
            cell.setStrokeStyle(2.5, 0x38bdf8);
          }
        };

        const onPointerOut = () => {
          if (this.inputLocked || !this.inputEnabled) return;
          const isCurrSelected = this.selected.some((item) => samePosition(item, position));
          if (!isCurrSelected) {
            this.scene.tweens.add({
              targets: tileContainer,
              scaleX: 1.0,
              scaleY: 1.0,
              duration: 80,
              ease: 'Quad.Out',
            });
            cell.setStrokeStyle(strokeWidth, stroke);
          }
        };

        const onPointerUp = () => this.select(position);

        cell.on('pointerover', onPointerOver);
        cell.on('pointerout', onPointerOut);
        cell.on('pointerup', onPointerUp);

        iconImage.on('pointerover', onPointerOver);
        iconImage.on('pointerout', onPointerOut);
        iconImage.on('pointerup', onPointerUp);
      }
    });

    this.container.setSize(totalSize, totalSize);
  }

  pulseBoard(): void {
    if (this.destroyed) return;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      ease: 'Sine.InOut',
    });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.pendingMatch?.remove(false);
    this.pendingMatch = undefined;
    this.destroyed = true;
    this.container.destroy();
    this.pathGraphics.destroy();
    this.tileMap.clear();
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
      // First tile selected: play subtle punch
      const key = `${position.row},${position.col}`;
      const visual = this.tileMap.get(key);
      if (visual) {
        this.scene.tweens.add({
          targets: visual.container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
          ease: 'Back.Out',
        });
        visual.cell.setStrokeStyle(3.5, 0xfbbf24);
      }
      this.render();
      return;
    }

    const [first, second] = this.selected;
    const result = this.matcher.findMatch(this.board, first, second);

    if (!result.valid) {
      // INVALID MATCH FEEDBACK
      this.inputLocked = true;
      this.drawInvalidPath(first, second);

      const v1 = this.tileMap.get(`${first.row},${first.col}`);
      const v2 = this.tileMap.get(`${second.row},${second.col}`);

      if (v1) {
        v1.cell.setStrokeStyle(3.5, 0xef4444);
        FeedbackEffects.shake(this.scene, v1.container, 5, 180);
      }
      if (v2) {
        v2.cell.setStrokeStyle(3.5, 0xef4444);
        FeedbackEffects.shake(this.scene, v2.container, 5, 180);
      }

      this.scene.time.delayedCall(190, () => {
        this.pathGraphics.clear();
        this.selected = [];
        this.inputLocked = false;
        this.events.onInvalidSelection();
        this.render();
      });
      return;
    }

    // VALID MATCH FEEDBACK
    const matchedContent = this.board.getContent(first);
    if (!matchedContent) return;

    this.inputLocked = true;
    this.drawPath(result.pathPoints);

    const pos1 = this.pixelPosition(first);
    const pos2 = this.pixelPosition(second);
    const midpoint = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };

    // Success pulse rings on both matched tiles
    FeedbackEffects.pulseRing(this.scene, pos1.x, pos1.y, 0x22c55e, 38);
    FeedbackEffects.pulseRing(this.scene, pos2.x, pos2.y, 0x22c55e, 38);

    const v1 = this.tileMap.get(`${first.row},${first.col}`);
    const v2 = this.tileMap.get(`${second.row},${second.col}`);

    // Pop and fade matched tiles
    if (v1) {
      v1.cell.setStrokeStyle(3.5, 0x22c55e);
      this.scene.tweens.add({
        targets: v1.container,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0,
        duration: 220,
        ease: 'Sine.Out',
      });
    }
    if (v2) {
      v2.cell.setStrokeStyle(3.5, 0x22c55e);
      this.scene.tweens.add({
        targets: v2.container,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0,
        duration: 220,
        ease: 'Sine.Out',
      });
    }

    this.pendingMatch = this.scene.time.delayedCall(240, () => {
      this.pendingMatch = undefined;
      if (this.destroyed || !this.inputEnabled) return;
      this.board.remove(first);
      this.board.remove(second);
      this.selected = [];
      this.pathGraphics.clear();
      this.inputLocked = false;
      this.render();
      this.events.onMatchRemoved(result, matchedContent.contentId, midpoint);
    });
  }

  private pixelPosition(pos: BoardPosition): { x: number; y: number } {
    return {
      x: this.originX + pos.col * (this.cellSize + this.gap) + this.cellSize / 2,
      y: this.originY + pos.row * (this.cellSize + this.gap) + this.cellSize / 2,
    };
  }

  private drawPath(points: BoardPosition[]): void {
    this.pathGraphics.clear();
    // Glowing underlay
    this.pathGraphics.lineStyle(10, 0xfbbf24, 0.45);
    points.forEach((point, index) => {
      const p = this.pixelPosition(point);
      if (index === 0) this.pathGraphics.beginPath().moveTo(p.x, p.y);
      else this.pathGraphics.lineTo(p.x, p.y);
    });
    this.pathGraphics.strokePath();

    // Sharp bright core line
    this.pathGraphics.lineStyle(4, 0xffffff, 1.0);
    points.forEach((point, index) => {
      const p = this.pixelPosition(point);
      if (index === 0) this.pathGraphics.beginPath().moveTo(p.x, p.y);
      else this.pathGraphics.lineTo(p.x, p.y);
    });
    this.pathGraphics.strokePath();
  }

  private drawInvalidPath(p1: BoardPosition, p2: BoardPosition): void {
    this.pathGraphics.clear();
    const pos1 = this.pixelPosition(p1);
    const pos2 = this.pixelPosition(p2);

    this.pathGraphics.lineStyle(4, 0xef4444, 0.85);
    this.pathGraphics.beginPath().moveTo(pos1.x, pos1.y).lineTo(pos2.x, pos2.y).strokePath();

    const drawCross = (cx: number, cy: number) => {
      this.pathGraphics.beginPath();
      this.pathGraphics.moveTo(cx - 8, cy - 8).lineTo(cx + 8, cy + 8);
      this.pathGraphics.moveTo(cx + 8, cy - 8).lineTo(cx - 8, cy + 8);
      this.pathGraphics.strokePath();
    };
    drawCross(pos1.x, pos1.y);
    drawCross(pos2.x, pos2.y);
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
