import type Phaser from 'phaser';
import {
  BEAST_ICON_DEFINITIONS,
  ENERGY_ICON_DEFINITIONS,
  getIconDefinition,
  type IconDefinition,
} from './UnitIconRegistry';

const TEXTURE_BASE_SIZE = 64;

/**
 * Ensures all Beast and Energy icon textures are generated into Phaser's TextureManager.
 */
export function ensureIconTextures(scene: Phaser.Scene): void {
  const allDefs = [
    ...Object.values(BEAST_ICON_DEFINITIONS),
    ...Object.values(ENERGY_ICON_DEFINITIONS),
  ];

  allDefs.forEach((def) => {
    const key = getIconTextureKey(def.id);
    if (scene.textures.exists(key)) return;

    const g = scene.make.graphics();
    drawIconBadge(g, def, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE);
    g.generateTexture(key, TEXTURE_BASE_SIZE, TEXTURE_BASE_SIZE);
    g.destroy();
  });

  const roleConfigs: Record<string, { symbol: IconDefinition['symbol']; primaryColor: number; accentColor: number }> = {
    Tanker: { symbol: 'shield', primaryColor: 0xfacc15, accentColor: 0xfef08a },
    Assassin: { symbol: 'daggers', primaryColor: 0xf97316, accentColor: 0xffedd5 },
    Ranger: { symbol: 'bow', primaryColor: 0x22c55e, accentColor: 0xbbf7d0 },
    Mage: { symbol: 'orb', primaryColor: 0xa855f7, accentColor: 0xf3e8ff },
  };

  Object.entries(roleConfigs).forEach(([role, cfg]) => {
    const key = `proto-role-${role}`;
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics();
    g.fillStyle(0x0f172a, 0.95);
    g.fillCircle(TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2 - 2);
    g.lineStyle(2, cfg.primaryColor, 0.9);
    g.strokeCircle(TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2 - 2);
    drawSymbol(g, cfg.symbol, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE / 2, TEXTURE_BASE_SIZE * 0.65, cfg.primaryColor, cfg.accentColor, 1);
    g.generateTexture(key, TEXTURE_BASE_SIZE, TEXTURE_BASE_SIZE);
    g.destroy();
  });
}

export function getIconTextureKey(id: string): string {
  const def = getIconDefinition(id);
  return `proto-icon-${def.id}`;
}

/**
 * Creates a ready-to-use Phaser Image object displaying the unit or energy icon.
 */
export function createIconImage(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  displaySize = 48,
): Phaser.GameObjects.Image {
  ensureIconTextures(scene);
  const key = getIconTextureKey(id);
  const img = scene.add.image(x, y, key);
  img.setDisplaySize(displaySize, displaySize);
  return img;
}

/**
 * Creates a ready-to-use Phaser Image object displaying a role symbol (shield, dagger, bow, orb).
 */
export function createRoleIconImage(
  scene: Phaser.Scene,
  role: string,
  x: number,
  y: number,
  displaySize = 22,
): Phaser.GameObjects.Image {
  ensureIconTextures(scene);
  const key = `proto-role-${role}`;
  const img = scene.add.image(x, y, key);
  img.setDisplaySize(displaySize, displaySize);
  return img;
}

/**
 * Draws an icon badge directly onto a Phaser Graphics instance.
 */
export function drawIconBadge(
  g: Phaser.GameObjects.Graphics,
  def: IconDefinition,
  cx: number,
  cy: number,
  size: number,
): void {
  const half = size / 2;
  const scale = size / 64;

  if (def.isEnergy) {
    // ==========================================
    // ENERGY TOKEN: Circular Medallion / Gem Style
    // ==========================================
    const radius = half - 2 * scale;

    // Outer dark rim
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(cx, cy, radius);

    // Inner elemental fill
    g.fillStyle(def.bgFill, 0.95);
    g.fillCircle(cx, cy, radius - 2 * scale);

    // Subtle outer metallic ring
    g.lineStyle(2.5 * scale, def.primaryColor, 0.9);
    g.strokeCircle(cx, cy, radius);

    // Inner glowing ring
    g.lineStyle(1 * scale, def.accentColor, 0.5);
    g.strokeCircle(cx, cy, radius - 4 * scale);

    // Center elemental symbol
    drawSymbol(g, def.symbol, cx, cy, size * 0.55, def.primaryColor, def.accentColor, scale);
  } else {
    // ==========================================
    // BEAST BADGE: Framed Portrait / Crest Style
    // ==========================================
    const pad = 2 * scale;
    const w = size - pad * 2;
    const h = size - pad * 2;
    const r = 8 * scale;

    // Main badge background
    g.fillStyle(def.bgFill, 0.95);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);

    // Distinct colored border
    g.lineStyle(2 * scale, def.borderColor, 0.95);
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, r);

    // Top role accent cap
    g.fillStyle(def.primaryColor, 1);
    g.fillRoundedRect(cx - w / 2 + 2 * scale, cy - h / 2 + 2 * scale, w - 4 * scale, 5 * scale, 2 * scale);

    // Inner subtle border
    g.lineStyle(1 * scale, 0xffffff, 0.15);
    g.strokeRoundedRect(cx - w / 2 + 3 * scale, cy - h / 2 + 8 * scale, w - 6 * scale, h - 11 * scale, 4 * scale);

    // Main heraldic beast symbol
    drawSymbol(g, def.symbol, cx, cy + 2 * scale, size * 0.62, def.primaryColor, def.accentColor, scale);
  }
}

/**
 * Draws vector glyph silhouettes for each identity.
 */
function drawSymbol(
  g: Phaser.GameObjects.Graphics,
  symbol: IconDefinition['symbol'],
  cx: number,
  cy: number,
  boxSize: number,
  primaryColor: number,
  accentColor: number,
  scale: number,
): void {
  const s = (boxSize / 40); // Base reference coordinate space: 40x40

  switch (symbol) {
    case 'shield': {
      // Tanker A: Kite / Heater Shield
      g.fillStyle(primaryColor, 1);
      g.beginPath();
      g.moveTo(cx - 14 * s, cy - 14 * s);
      g.lineTo(cx + 14 * s, cy - 14 * s);
      g.lineTo(cx + 14 * s, cy);
      g.lineTo(cx, cy + 16 * s);
      g.lineTo(cx - 14 * s, cy);
      g.closePath();
      g.fillPath();

      // Shield rim / border
      g.lineStyle(1.5 * scale, accentColor, 0.9);
      g.strokePath();

      // Center cross boss
      g.fillStyle(accentColor, 1);
      g.fillRect(cx - 2 * s, cy - 10 * s, 4 * s, 20 * s);
      g.fillRect(cx - 9 * s, cy - 5 * s, 18 * s, 4 * s);
      break;
    }

    case 'daggers': {
      // Assassin B: Crossed Twin Curved Blades
      g.lineStyle(3 * scale, primaryColor, 1);
      // Blade 1: Top-left to bottom-right
      g.beginPath();
      g.moveTo(cx - 13 * s, cy - 13 * s);
      g.lineTo(cx + 13 * s, cy + 13 * s);
      g.strokePath();

      // Blade 2: Top-right to bottom-left
      g.beginPath();
      g.moveTo(cx + 13 * s, cy - 13 * s);
      g.lineTo(cx - 13 * s, cy + 13 * s);
      g.strokePath();

      // Crossguards
      g.fillStyle(accentColor, 1);
      g.fillRect(cx - 10 * s, cy - 6 * s, 6 * s, 2.5 * s);
      g.fillRect(cx + 4 * s, cy - 6 * s, 6 * s, 2.5 * s);
      g.fillRect(cx - 6 * s, cy + 7 * s, 2.5 * s, 6 * s);
      g.fillRect(cx + 4 * s, cy + 7 * s, 2.5 * s, 6 * s);

      // Center diamond slash mark
      g.fillCircle(cx, cy, 3 * scale);
      break;
    }

    case 'bow': {
      // Ranger C: Recurve Bow & Arrow
      // Bow curved arc
      g.lineStyle(3 * scale, primaryColor, 1);
      const rad65 = (65 * Math.PI) / 180;
      g.beginPath();
      g.arc(cx - 4 * s, cy, 14 * s, -rad65, rad65, false);
      g.strokePath();

      // Bowstring
      g.lineStyle(1 * scale, accentColor, 0.8);
      g.lineBetween(cx + 2 * s, cy - 13 * s, cx + 2 * s, cy + 13 * s);

      // Arrow shaft
      g.lineStyle(2.5 * scale, accentColor, 1);
      g.lineBetween(cx - 12 * s, cy, cx + 14 * s, cy);

      // Arrowhead
      g.fillStyle(accentColor, 1);
      g.beginPath();
      g.moveTo(cx + 16 * s, cy);
      g.lineTo(cx + 9 * s, cy - 4 * s);
      g.lineTo(cx + 9 * s, cy + 4 * s);
      g.closePath();
      g.fillPath();
      break;
    }

    case 'orb': {
      // Mage D: Arcane Diamond Rune / Glowing Spark
      // Outer 4-point radiant star
      g.fillStyle(primaryColor, 1);
      g.beginPath();
      g.moveTo(cx, cy - 16 * s);
      g.lineTo(cx + 5 * s, cy - 5 * s);
      g.lineTo(cx + 16 * s, cy);
      g.lineTo(cx + 5 * s, cy + 5 * s);
      g.lineTo(cx, cy + 16 * s);
      g.lineTo(cx - 5 * s, cy + 5 * s);
      g.lineTo(cx - 16 * s, cy);
      g.lineTo(cx - 5 * s, cy - 5 * s);
      g.closePath();
      g.fillPath();

      // Inner glowing core
      g.fillStyle(accentColor, 1);
      g.fillCircle(cx, cy, 4.5 * s);

      // Orbital rune rings
      g.lineStyle(1 * scale, accentColor, 0.7);
      g.strokeCircle(cx, cy, 11 * s);
      break;
    }

    case 'bastion': {
      // Tanker E: Heavy Castle Bastion / Tower Wall
      g.fillStyle(primaryColor, 1);
      // Main tower base
      g.fillRect(cx - 13 * s, cy - 6 * s, 26 * s, 18 * s);

      // 3 Crenellations on top
      g.fillRect(cx - 13 * s, cy - 14 * s, 6 * s, 8 * s);
      g.fillRect(cx - 3 * s, cy - 14 * s, 6 * s, 8 * s);
      g.fillRect(cx + 7 * s, cy - 14 * s, 6 * s, 8 * s);

      // Center gate / shield slit
      g.fillStyle(accentColor, 1);
      g.fillRect(cx - 3 * s, cy + 1 * s, 6 * s, 10 * s);
      g.fillCircle(cx, cy + 1 * s, 3 * s);

      // Border outline
      g.lineStyle(1.5 * scale, accentColor, 0.8);
      g.strokeRect(cx - 13 * s, cy - 6 * s, 26 * s, 18 * s);
      break;
    }

    case 'winged-arrow': {
      // Ranger F: Winged Arrow / Swift Falcon Shot
      // Center arrow shaft
      g.lineStyle(2.5 * scale, primaryColor, 1);
      g.lineBetween(cx, cy - 14 * s, cx, cy + 14 * s);

      // Arrowhead pointing up
      g.fillStyle(accentColor, 1);
      g.beginPath();
      g.moveTo(cx, cy - 16 * s);
      g.lineTo(cx - 5 * s, cy - 9 * s);
      g.lineTo(cx + 5 * s, cy - 9 * s);
      g.closePath();
      g.fillPath();

      // Left wing
      g.fillStyle(primaryColor, 0.95);
      g.beginPath();
      g.moveTo(cx - 2 * s, cy - 2 * s);
      g.lineTo(cx - 15 * s, cy - 8 * s);
      g.lineTo(cx - 13 * s, cy + 3 * s);
      g.lineTo(cx - 2 * s, cy + 5 * s);
      g.closePath();
      g.fillPath();

      // Right wing
      g.beginPath();
      g.moveTo(cx + 2 * s, cy - 2 * s);
      g.lineTo(cx + 15 * s, cy - 8 * s);
      g.lineTo(cx + 13 * s, cy + 3 * s);
      g.lineTo(cx + 2 * s, cy + 5 * s);
      g.closePath();
      g.fillPath();

      // Wing highlights
      g.lineStyle(1 * scale, accentColor, 0.9);
      g.lineBetween(cx - 2 * s, cy - 2 * s, cx - 15 * s, cy - 8 * s);
      g.lineBetween(cx + 2 * s, cy - 2 * s, cx + 15 * s, cy - 8 * s);
      break;
    }
  }
}
