import type Phaser from 'phaser';

export const OWNER_ENERGY_ATLAS = 'owner-energy-icons-v1';
/** Square texture windows retain padding and never include a neighboring icon. */
export const OWNER_ENERGY_FRAMES: Readonly<Record<string, { x: number; y: number; size: number }>> = {
  'energy-a': { x: 54, y: 76, size: 540 }, // Mend: blue medical patch
  'energy-e': { x: 678, y: 69, size: 540 }, // Guard: coral paw shield
  'energy-c': { x: 64, y: 664, size: 540 }, // Break: mint mallet and cracked armor
  'energy-f': { x: 682, y: 661, size: 540 }, // Disrupt: purple stop glove
};

export function preloadOwnerEnergyArt(scene: Phaser.Scene): void {
  scene.load.image(OWNER_ENERGY_ATLAS, '/assets/ui/energy/owner-icons-v1.png');
}

export function ensureOwnerEnergyFrames(scene: Phaser.Scene): void {
  if (!scene.textures.exists(OWNER_ENERGY_ATLAS)) return;
  const texture = scene.textures.get(OWNER_ENERGY_ATLAS);
  for (const [id, frame] of Object.entries(OWNER_ENERGY_FRAMES)) {
    if (!texture.has(id)) texture.add(id, 0, frame.x, frame.y, frame.size, frame.size);
  }
}
