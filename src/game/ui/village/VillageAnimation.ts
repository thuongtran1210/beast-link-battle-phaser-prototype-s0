import boatRow from '../../../../public/assets/characters/badger-mage/village_animation_v01/boat-row-owner-v01.metadata.json';
import type { VillageResidentId } from '../../run/VillageCatalog';
import type { VillageClipId } from './VillagePresentationCatalog';
import rabbitSheet from '../../../../public/assets/characters/rabbit-archer/village_animation_v01/garden-action-owner-v01.metadata.json';
import foxPickupSheet from '../../../../public/assets/characters/fox-archer/village_animation_v01/delivery-pickup-owner-v01.metadata.json';
import foxWalk from '../../../../public/assets/characters/fox-archer/village_animation_v01/loaded-walk-owner-v01.metadata.json';
import foxFinish from '../../../../public/assets/characters/fox-archer/village_animation_v01/delivery-finish-owner-v01.metadata.json';
import foxGreetReview from '../../../../public/assets/characters/fox-archer/village_animation_v01/delivery-greet-review-owner-v01.metadata.json';
import duckPatrol from '../../../../public/assets/characters/duck-guardian/village_animation_v01/patrol-walk-owner-v01.metadata.json';
import fishingEnter from '../../../../public/assets/characters/raccoon-rogue/village_animation_v01/fishing-enter-owner-v01.metadata.json';
import fishingWork from '../../../../public/assets/characters/raccoon-rogue/village_animation_v01/fishing-work-owner-v01.metadata.json';
import fishingFinish from '../../../../public/assets/characters/raccoon-rogue/village_animation_v01/fishing-finish-owner-v01.metadata.json';

export type VillageSocketId = 'ground' | 'hand' | 'work-contact' | 'water' | 'delivery';
export interface VillageAnimationFrame {
  readonly x: number; readonly y: number; readonly width: number; readonly height: number;
  readonly pivotX: number; readonly pivotY: number;
  /** Source-relative rectangles hidden at render time, preserving owner PNG. */
  readonly excludeRects?:readonly {x:number;y:number;width:number;height:number}[];
}
export interface VillageAnimationCue {
  readonly frame: number;
  readonly socket: VillageSocketId;
  readonly x: number; readonly y: number;
}
export interface VillageAnimationClip {
  readonly assetId: string;
  readonly source: string;
  readonly referencePaths: readonly string[];
  readonly actualWidth: number; readonly actualHeight: number;
  readonly neutralBodyHeight: number;
  readonly fps: number; readonly loop: boolean;
  readonly frames: readonly VillageAnimationFrame[];
  readonly cues: readonly VillageAnimationCue[];
  readonly toolOwnership: 'sheet' | 'prototype' | 'none';
  readonly status: 'draft' | 'review' | 'owner-supplied' | 'test-only';
}
export type VillageAnimationSet = Readonly<Partial<Record<VillageClipId, VillageAnimationClip>>>;
function fishingClip(name:string,sheet:typeof fishingWork,loop:boolean):VillageAnimationClip {
 return {assetId:`shadowclaw-${name}-owner-v01`,source:`/assets/characters/raccoon-rogue/village_animation_v01/${name}-owner-v01.png`,referencePaths:['/assets/beasts/shadowclaw/base_owner_v01.png'],actualWidth:sheet.actualWidth,actualHeight:sheet.actualHeight,neutralBodyHeight:sheet.neutralBodyHeight,frames:sheet.frames,fps:8,loop,cues:[],toolOwnership:'sheet',status:'owner-supplied'};
}
function foxClip(name:string,sheet:typeof foxWalk,loop:boolean):VillageAnimationClip{
  return {assetId:`swiftwing-${name}-owner-v01`,source:`/assets/characters/fox-archer/village_animation_v01/${name}-owner-v01.png`,referencePaths:['/assets/beasts/swiftwing/base_owner_v01.png'],actualWidth:sheet.actualWidth,actualHeight:sheet.actualHeight,neutralBodyHeight:sheet.neutralBodyHeight,frames:sheet.frames,fps:8,loop,cues:[],toolOwnership:'sheet',status:'owner-supplied'};
}
/** Owner-labeled greet visually walks with a parcel; review only, not a greet binding. */
export const SWIFTWING_GREET_REVIEW_CLIP=foxClip('delivery-greet-review',foxGreetReview,true);
/** Register only real, inspected village sheets. Missing entries use owner cutouts. */
const rabbitCare: VillageAnimationClip = {
  assetId: 'windstrider-garden-care-owner-v01',
  source: '/assets/characters/rabbit-archer/village_animation_v01/garden-action-owner-v01.png',
  referencePaths: ['/assets/beasts/windstrider/base_owner_v01.png'],
  actualWidth: rabbitSheet.actualWidth, actualHeight: rabbitSheet.actualHeight,
  neutralBodyHeight: rabbitSheet.neutralBodyHeight,
  frames: rabbitSheet.frames, fps: 5, loop: false, cues: [],
  toolOwnership: 'sheet', status: 'owner-supplied',
};
export const VILLAGE_ANIMATIONS: Readonly<Partial<Record<VillageResidentId, VillageAnimationSet>>> = {
  'beast-d':{'boat-row':{assetId:'starcaller-boat-row-owner-v01',source:'/assets/characters/badger-mage/village_animation_v01/boat-row-owner-v01.png',referencePaths:['/assets/characters/badger-mage/base_v01.png'],actualWidth:boatRow.actualWidth,actualHeight:boatRow.actualHeight,neutralBodyHeight:boatRow.neutralBodyHeight,frames:boatRow.frames,fps:8,loop:true,cues:[],toolOwnership:'sheet',status:'owner-supplied'}},
  'beast-b':{enter:fishingClip('fishing-enter',fishingEnter,false),work:fishingClip('fishing-work',fishingWork,true),finish:fishingClip('fishing-finish',fishingFinish,false)},
  'beast-a':{walk:{assetId:'snowguard-patrol-walk-owner-v01',source:'/assets/characters/duck-guardian/village_animation_v01/patrol-walk-owner-v01.png',referencePaths:['/assets/beasts/snowguard/base_owner_v01.png'],actualWidth:duckPatrol.actualWidth,actualHeight:duckPatrol.actualHeight,neutralBodyHeight:duckPatrol.neutralBodyHeight,frames:duckPatrol.frames,fps:8,loop:true,cues:[],toolOwnership:'sheet',status:'owner-supplied'}},
  // Mixed owner care sequence: play once, hold neutral frame 8 until job changes.
  // No harvested crops or production completion are driven by this animation.
  'beast-c': { work: rabbitCare },
  'beast-f': { 'loaded-walk':foxClip('loaded-walk',foxWalk,true),finish:{...foxClip('delivery-finish',foxFinish,false),cues:[{frame:4,socket:'delivery',x:220,y:300}]},pickup: {
    assetId: 'swiftwing-delivery-pickup-owner-v01',
    source: '/assets/characters/fox-archer/village_animation_v01/delivery-pickup-owner-v01.png',
    referencePaths: ['/assets/beasts/swiftwing/base_owner_v01.png'],
    actualWidth: foxPickupSheet.actualWidth, actualHeight: foxPickupSheet.actualHeight,
    neutralBodyHeight: foxPickupSheet.neutralBodyHeight, frames: foxPickupSheet.frames,
    fps: 8, loop: false, toolOwnership: 'sheet', status: 'owner-supplied',
    // Parcel handoff is presentation only. Transport domain must authorize ownership.
    cues: [{frame:3,socket:'hand',x:225,y:300}],
  } },
};

export function validVillageClip(clip: VillageAnimationClip): boolean {
  return Boolean(clip.assetId && clip.source && Number.isFinite(clip.actualWidth) && clip.actualWidth > 0
    && Number.isFinite(clip.actualHeight) && clip.actualHeight > 0
    && Number.isFinite(clip.neutralBodyHeight) && clip.neutralBodyHeight > 0
    && Number.isFinite(clip.fps) && clip.fps > 0 && clip.fps <= 60 && typeof clip.loop === 'boolean'
    && Array.isArray(clip.frames) && clip.frames.length === 8
    && clip.frames.every(frame => [frame.x, frame.y, frame.width, frame.height, frame.pivotX, frame.pivotY].every(Number.isFinite)
      && frame.x >= 0 && frame.y >= 0 && frame.width > 0 && frame.height > 0
      && frame.x + frame.width <= clip.actualWidth && frame.y + frame.height <= clip.actualHeight
      && frame.pivotX >= 0 && frame.pivotX <= frame.width && frame.pivotY >= 0 && frame.pivotY <= frame.height
      && (!frame.excludeRects||frame.excludeRects.every((r:{x:number;y:number;width:number;height:number})=>[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.x>=0&&r.y>=0&&r.width>0&&r.height>0&&r.x+r.width<=frame.width&&r.y+r.height<=frame.height)))
    && Array.isArray(clip.cues) && clip.cues.every(cue => Number.isInteger(cue.frame) && cue.frame >= 0 && cue.frame < 8
      && ['ground','hand','work-contact','water','delivery'].includes(cue.socket)
      && Number.isFinite(cue.x) && Number.isFinite(cue.y)));
}

/** Presentation cues never deliver inventory or complete a production job. */
export class VillageAnimationClock {
  private clip?: VillageAnimationClip;
  private elapsed = 0;
  private finished = false;
  private firstCuePending = false;
  private disposed = false;

  play(clip?: VillageAnimationClip, restart = false): void {
    if (this.disposed || (!restart && this.clip === clip)) return;
    this.clip = clip && validVillageClip(clip) ? clip : undefined;
    this.elapsed = 0;
    this.finished = false;
    this.firstCuePending = this.clip !== undefined;
  }

  get frameIndex(): number {
    if (!this.clip) return 0;
    const frame = Math.floor(this.elapsed * this.clip.fps + 1e-8);
    return this.clip.loop ? frame % 8 : Math.min(7, frame);
  }

  get elapsedSeconds(): number { return this.elapsed; }
  /** Restore presentation after DOM rebind without replaying cues. */
  seek(seconds: number): void {
    if (this.disposed || !this.clip || !Number.isFinite(seconds) || seconds < 0) return;
    this.elapsed = seconds;
    this.finished = !this.clip.loop && seconds * this.clip.fps >= 8;
    this.firstCuePending = false;
  }

  advance(seconds: number, paused = false): { readonly frame: number; readonly completed: boolean; readonly cues: readonly VillageAnimationCue[] } {
    const clip = this.clip;
    if (!clip || this.disposed || paused || !Number.isFinite(seconds) || seconds <= 0 || this.finished)
      return { frame: this.frameIndex, completed: false, cues: [] };
    const from = Math.floor(this.elapsed * clip.fps + 1e-8);
    this.elapsed += seconds;
    const to = Math.floor(this.elapsed * clip.fps + 1e-8);
    const cues: VillageAnimationCue[] = [];
    if (this.firstCuePending) {
      cues.push(...clip.cues.filter(cue => cue.frame === 0).map(cue => ({ ...cue })));
      this.firstCuePending = false;
    }
    // Bound presentation catchup; no economy effect is tied to these cues.
    for (let tick = from + 1; tick <= Math.min(to, from + 128); tick++) {
      if (!clip.loop && tick >= 8) break;
      cues.push(...clip.cues.filter(cue => cue.frame === tick % 8).map(cue => ({ ...cue })));
    }
    const completed = !clip.loop && to >= 8;
    if (completed) this.finished = true;
    return { frame: this.frameIndex, completed, cues };
  }

  dispose(): void { this.disposed = true; this.clip = undefined; }
}
