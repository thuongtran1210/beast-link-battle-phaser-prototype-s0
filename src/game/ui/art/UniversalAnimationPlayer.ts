import type Phaser from 'phaser';
import snowguardFrames from './SnowguardFrames.json';
import ironcladFrames from './IroncladFrames.json';
import windstriderFrames from './WindstriderFrames.json';
import { characterRecord } from '../../config/CharacterProjects';
import { AnimationClock } from './AnimationClock';

export type CharacterAnimationClip = 'idle' | 'walk' | 'attack' | 'skill' | 'hit' | 'ko';
export const ANIMATION_CLIPS: readonly CharacterAnimationClip[] = ['idle', 'walk', 'attack', 'skill', 'hit', 'ko'] as const;

export interface AnimationFrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
  groundY: number;
  bodyHeight: number;
}

export interface FrameAnimationRig {
  prefix: string;
  frames: Record<CharacterAnimationClip, AnimationFrameRect[]>;
}

export const SNOWGUARD_RIG: FrameAnimationRig = { prefix: 'snowguard', frames: snowguardFrames };
export const IRONCLAD_RIG: FrameAnimationRig = { prefix: 'ironclad', frames: ironcladFrames };
export const WINDSTRIDER_RIG: FrameAnimationRig = { prefix: 'windstrider', frames: windstriderFrames };

const beastForPrefix: Record<string, string> = {
  snowguard: 'beast-a',
  ironclad: 'beast-e',
  windstrider: 'beast-c',
};

export const CHARACTER_RIG_REGISTRY: Record<string, FrameAnimationRig> = {
  'beast-a': SNOWGUARD_RIG,
  'beast-e': IRONCLAD_RIG,
  'beast-c': WINDSTRIDER_RIG,
};

export function animationSheetPath(prefix: string, slug: string, clip: CharacterAnimationClip): string {
  const beastId = beastForPrefix[prefix];
  if (beastId) {
    const record = characterRecord(beastId);
    if (record?.atlases?.[clip]) return record.atlases[clip];
  }
  return `/assets/characters/${slug}/animation_v01/${clip}.png`;
}

/**
 * UniversalAnimationPlayer
 * Unified frame-by-frame spritesheet animation rig for any Beast or Enemy.
 * Replaces hardcoded per-character classes while maintaining full backward compatibility.
 */
export class UniversalAnimationPlayer {
  readonly sprite: Phaser.GameObjects.Sprite;
  private state: CharacterAnimationClip = 'idle';
  private locomotion: 'idle' | 'walk' = 'idle';
  private alive = true;
  private clock: AnimationClock | undefined;
  private customUpdate = (_time: number, delta: number) => {
    this.clock!.step(delta / 1000);
    this.showCustom();
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly height: number,
    groundOffset: number,
    private readonly rig: FrameAnimationRig,
  ) {
    const beastId = beastForPrefix[rig.prefix];
    const record = beastId ? characterRecord(beastId) : undefined;

    if (record?.animation && ANIMATION_CLIPS.every((c) => record.atlases?.[c])) {
      this.clock = new AnimationClock(record.animation);
      for (const clip of ANIMATION_CLIPS) {
        const texture = scene.textures.get(`${rig.prefix}-sheet-${clip}`);
        for (let i = 0; i < 8; i++) {
          if (!texture.has(String(i))) {
            texture.add(String(i), 0, (i % 4) * 512, Math.floor(i / 4) * 512, 512, 512);
          }
        }
      }
      this.sprite = scene.add
        .sprite(0, groundOffset, `${rig.prefix}-sheet-idle`, 0)
        .setOrigin(0.5, 440 / 512)
        .setScale(height / 320);
      scene.events.on('update', this.customUpdate);
      this.showCustom();
      return;
    }

    const frames = rig.frames;
    for (const clip of ANIMATION_CLIPS) {
      const texture = scene.textures.get(`${rig.prefix}-sheet-${clip}`);
      frames[clip].forEach((f, i) => {
        if (!texture.has(String(i))) texture.add(String(i), 0, f.x, f.y, f.width, f.height);
      });
      const key = `${rig.prefix}-anim-${clip}`;
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: frames[clip].map((_, i) => ({ key: `${rig.prefix}-sheet-${clip}`, frame: i })),
          frameRate: clip === 'idle' ? 7 : 10,
          repeat: clip === 'idle' || clip === 'walk' ? -1 : 0,
        });
      }
    }

    this.sprite = scene.add.sprite(0, groundOffset, `${rig.prefix}-sheet-idle`, 0);
    this.sprite.on('animationupdate', () => this.align());
    this.sprite.on('animationcomplete', () => {
      if (this.alive && this.state !== 'ko') this.loop(this.locomotion);
    });
    this.loop('idle');
  }

  private showCustom(): void {
    const clock = this.clock!;
    this.sprite.setTexture(`${this.rig.prefix}-sheet-${clock.clip}`, String(clock.frame));
  }

  private align(): void {
    const frames = this.rig.frames;
    const index = Number(this.sprite.frame.name);
    const f = frames[this.state][index] ?? frames[this.state][0];
    const reference = frames[this.state][0].bodyHeight;
    let scale = this.height / reference;
    if (this.state === 'idle') scale = (this.height / f.bodyHeight) * (1 + (f.bodyHeight / reference - 1) * 0.1);
    this.sprite.setOrigin(0.5, f.groundY / f.height).setScale(scale);
  }

  private loop(clip: 'idle' | 'walk'): void {
    this.state = clip;
    this.sprite.play(`${this.rig.prefix}-anim-${clip}`);
    this.align();
  }

  setMoving(moving: boolean): void {
    if (this.clock) {
      this.clock.move(moving);
      this.showCustom();
      return;
    }
    this.locomotion = moving ? 'walk' : 'idle';
    if (this.alive && (this.state === 'idle' || this.state === 'walk') && this.state !== this.locomotion) {
      this.loop(this.locomotion);
    }
  }

  play(clip: 'attack' | 'skill' | 'hit' | 'ko', duration: number): void {
    if (this.clock) {
      this.clock.play(clip, duration);
      this.showCustom();
      return;
    }
    if (!this.alive && clip !== 'ko') return;
    if (this.state === 'attack' && clip === 'hit') return;
    if (this.state === 'skill' && (clip === 'attack' || clip === 'hit')) return;
    if (clip === 'ko') this.alive = false;
    this.state = clip;
    this.sprite.play({
      key: `${this.rig.prefix}-anim-${clip}`,
      frameRate: (this.rig.frames[clip].length * 1000) / Math.max(1, duration),
      repeat: 0,
    });
    this.align();
  }

  revive(): void {
    if (this.clock) {
      this.clock.revive();
      this.showCustom();
      return;
    }
    this.alive = true;
    this.locomotion = 'idle';
    this.loop('idle');
  }

  dispose(): void {
    if (this.clock) this.scene.events.off('update', this.customUpdate);
    this.sprite.stop();
    this.sprite.removeAllListeners();
  }

  static available(scene: Phaser.Scene, rig: FrameAnimationRig): boolean {
    return ANIMATION_CLIPS.every((clip) => scene.textures.exists(`${rig.prefix}-sheet-${clip}`));
  }

  /**
   * Data-driven factory: checks if a rig is registered and loaded for this character id.
   */
  static tryCreate(
    scene: Phaser.Scene,
    characterId: string,
    height: number,
    groundOffset: number,
  ): UniversalAnimationPlayer | undefined {
    const rig = CHARACTER_RIG_REGISTRY[characterId];
    if (!rig) return undefined;
    if (!UniversalAnimationPlayer.available(scene, rig)) return undefined;
    return new UniversalAnimationPlayer(scene, height, groundOffset, rig);
  }
}
