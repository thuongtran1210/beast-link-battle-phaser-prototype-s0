/**
 * Landscape layout definitions and coordinate helpers for 16:9 viewports.
 * Primary reference: 1280×720.
 */
export class LandscapeLayout {
  readonly width: number;
  readonly height: number;
  readonly hudHeight = 70;
  readonly gutter = 18;

  // Left/Main Play Area (occupies ~70-74% horizontal)
  readonly leftX: number;
  readonly leftY: number;
  readonly leftWidth: number;
  readonly leftHeight: number;

  // Right Side Panel (occupies ~26-30% horizontal)
  readonly rightX: number;
  readonly rightY: number;
  readonly rightWidth: number;
  readonly rightHeight: number;

  constructor(sceneWidth = 1280, sceneHeight = 720) {
    this.width = sceneWidth;
    this.height = sceneHeight;

    this.leftX = this.gutter;
    this.leftY = this.hudHeight + 10;

    // Right panel target width between 320 and 360 px
    this.rightWidth = Math.min(360, Math.max(300, Math.round(sceneWidth * 0.28)));
    this.leftWidth = sceneWidth - this.rightWidth - this.gutter * 3;

    this.rightX = this.leftX + this.leftWidth + this.gutter;
    this.rightY = this.leftY;

    this.leftHeight = sceneHeight - this.leftY - this.gutter;
    this.rightHeight = this.leftHeight;
  }

  /** Center point of the main play area */
  get leftCenter(): { x: number; y: number } {
    return {
      x: this.leftX + this.leftWidth / 2,
      y: this.leftY + this.leftHeight / 2,
    };
  }

  /** Center point of the right panel */
  get rightCenter(): { x: number; y: number } {
    return {
      x: this.rightX + this.rightWidth / 2,
      y: this.rightY + this.rightHeight / 2,
    };
  }

  /** Compute cell size and start position for a puzzle board of given size (e.g. 6x6) */
  getPuzzleBoardPlacement(boardSize = 6): {
    cellSize: number;
    gap: number;
    totalSize: number;
    startX: number;
    startY: number;
  } {
    const gap = 8;
    // Calculate max cell size that fits both horizontally in leftWidth and vertically in leftHeight
    const maxAvailableH = this.leftHeight - 60; // Room for subtitle/title
    const maxAvailableW = this.leftWidth - 40;
    const maxDimension = Math.min(maxAvailableH, maxAvailableW);

    const cellSize = Math.floor((maxDimension - (boardSize - 1) * gap) / boardSize);
    const clampedCellSize = Math.max(56, Math.min(84, cellSize));
    const totalSize = boardSize * clampedCellSize + (boardSize - 1) * gap;

    const startX = Math.round(this.leftX + (this.leftWidth - totalSize) / 2);
    const startY = Math.round(this.leftY + (this.leftHeight - totalSize) / 2);

    return {
      cellSize: clampedCellSize,
      gap,
      totalSize,
      startX,
      startY,
    };
  }
}
