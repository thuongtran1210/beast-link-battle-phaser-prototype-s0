import type Phaser from 'phaser';

export type EnemyVisualArchetype = 'Frontliner' | 'Diver' | 'Ranged';

const SIZE = 64;

export function createEnemyArchetypeIcon(
  scene: Phaser.Scene,
  archetype: EnemyVisualArchetype,
  x: number,
  y: number,
  displaySize = 32,
): Phaser.GameObjects.Image {
  const key = `proto-enemy-${archetype.toLowerCase()}`;
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics();
    drawEnemyArchetype(g, archetype, SIZE / 2, SIZE / 2, SIZE);
    g.generateTexture(key, SIZE, SIZE);
    g.destroy();
  }
  const image = scene.add.image(x, y, key);
  image.setDisplaySize(displaySize, displaySize);
  return image;
}

function drawEnemyArchetype(
  g: Phaser.GameObjects.Graphics,
  archetype: EnemyVisualArchetype,
  cx: number,
  cy: number,
  size: number,
): void {
  const s = size / 64;
  const ink = 0x2b1720;
  const base = archetype === 'Frontliner' ? 0xb85c68 : archetype === 'Diver' ? 0x9366c7 : 0x5f91a8;
  const accent = archetype === 'Frontliner' ? 0xffc0b5 : archetype === 'Diver' ? 0xd9c2ff : 0xbcecff;

  // Shared enemy-family medallion: desaturated and less mascot-like than player Beasts.
  g.fillStyle(0x221b2b, 0.98);
  g.fillCircle(cx, cy, 30 * s);
  g.lineStyle(2 * s, base, 0.9);
  g.strokeCircle(cx, cy, 29 * s);

  g.fillStyle(base, 1);
  if (archetype === 'Frontliner') {
    // Heavy square mass + shield plate.
    g.fillRoundedRect(cx - 18 * s, cy - 16 * s, 36 * s, 34 * s, 7 * s);
    g.fillRect(cx - 24 * s, cy - 8 * s, 8 * s, 22 * s);
    g.fillRect(cx + 16 * s, cy - 8 * s, 8 * s, 22 * s);
    g.fillStyle(accent, 0.9);
    g.fillRoundedRect(cx - 8 * s, cy - 3 * s, 16 * s, 16 * s, 4 * s);
  } else if (archetype === 'Diver') {
    // Forward triangle / pounce silhouette.
    g.beginPath();
    g.moveTo(cx - 22 * s, cy + 16 * s);
    g.lineTo(cx - 5 * s, cy - 22 * s);
    g.lineTo(cx + 22 * s, cy + 4 * s);
    g.lineTo(cx + 6 * s, cy + 18 * s);
    g.closePath();
    g.fillPath();
    g.fillStyle(accent, 0.95);
    g.beginPath();
    g.moveTo(cx + 4 * s, cy - 10 * s);
    g.lineTo(cx + 22 * s, cy - 3 * s);
    g.lineTo(cx + 7 * s, cy + 3 * s);
    g.closePath();
    g.fillPath();
  } else {
    // Tall ranged body + explicit firing line.
    g.fillRoundedRect(cx - 11 * s, cy - 21 * s, 22 * s, 39 * s, 8 * s);
    g.fillStyle(accent, 0.95);
    g.fillCircle(cx, cy - 8 * s, 5 * s);
    g.fillRect(cx + 8 * s, cy - 3 * s, 18 * s, 5 * s);
    g.beginPath();
    g.moveTo(cx + 28 * s, cy - 1 * s);
    g.lineTo(cx + 20 * s, cy - 7 * s);
    g.lineTo(cx + 20 * s, cy + 5 * s);
    g.closePath();
    g.fillPath();
  }

  // Shared hostile eye treatment.
  g.fillStyle(ink, 0.95);
  g.fillCircle(cx - 5 * s, cy - 4 * s, 2.2 * s);
  g.fillCircle(cx + 5 * s, cy - 4 * s, 2.2 * s);
}
