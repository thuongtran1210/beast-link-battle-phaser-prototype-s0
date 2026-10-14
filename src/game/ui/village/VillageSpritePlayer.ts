import { validVillageClip, VillageAnimationClock, type VillageAnimationClip, type VillageAnimationSet } from './VillageAnimation';
import type { VillageClipId } from './VillagePresentationCatalog';

/** DOM sheet player driven by the existing village loop; owns no timer or RAF. */
export class VillageSpritePlayer {
  private readonly clock = new VillageAnimationClock();
  private readonly layer: HTMLSpanElement;
  private readonly images = new Map<string, { image: HTMLImageElement; ready: boolean; failed: boolean }>();
  private active?: VillageAnimationClip;
  private disposed = false;
  private facing = 1;
  private readonly fallbackHidden: boolean;
  private readonly fallbackScale: string;
  private lastFrame = -1;
  private restoredSeconds?: number;

  constructor(private readonly host: HTMLElement, private readonly fallback: HTMLImageElement,
    private readonly clips: VillageAnimationSet, private readonly displayHeight = 92) {
    this.fallbackHidden = fallback.hidden;
    this.fallbackScale = fallback.style.scale;
    this.layer = document.createElement('span');
    this.layer.className = 'village-sprite-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.layer.style.cssText = 'position:absolute;left:50%;top:90%;pointer-events:none;background-repeat:no-repeat;display:none';
    host.append(this.layer);
  }

  hasClip(id: VillageClipId): boolean {
    const clip = this.clips[id];
    return Boolean(clip && validVillageClip(clip));
  }

  get elapsedSeconds(): number { return this.clock.elapsedSeconds; }
  seek(seconds: number): void {
    if (this.disposed) return;
    this.restoredSeconds = seconds;
    this.clock.seek(seconds);
    this.lastFrame = -1;
    this.paint();
  }

  play(id: VillageClipId, facing = 1, restart = false): void {
    if (this.disposed) return;
    const candidate = this.clips[id];
    const clip = candidate && validVillageClip(candidate) ? candidate : undefined;
    if (this.active !== clip || restart) { this.active = clip; this.clock.play(clip, restart); this.lastFrame = -1; this.restoredSeconds = undefined; }
    if (this.facing !== facing) this.lastFrame = -1;
    this.facing = facing < 0 ? -1 : 1;
    this.fallback.style.scale = `${this.facing} 1`;
    if (clip && !this.images.has(clip.source)) {
      const image = new Image();
      const record = { image, ready: false, failed: false };
      this.images.set(clip.source, record);
      image.onload = () => {
        if (this.disposed) return;
        record.ready = image.naturalWidth === clip.actualWidth && image.naturalHeight === clip.actualHeight;
        record.failed = !record.ready;
        if (record.ready && this.active?.source === clip.source) {
          this.clock.play(this.active, true);
          if (this.restoredSeconds !== undefined) this.clock.seek(this.restoredSeconds);
          this.lastFrame = -1;
        }
        this.paint();
      };
      image.onerror = () => { record.failed = true; if (!this.disposed) this.paint(); };
      image.src = clip.source;
    }
    this.paint();
  }

  advance(seconds: number, paused = false): ReturnType<VillageAnimationClock['advance']> {
    const result = this.clock.advance(seconds, paused);
    if (!this.disposed) this.paint();
    return result;
  }

  private paint(): void {
    const clip = this.active;
    const cached = clip ? this.images.get(clip.source) : undefined;
    const ready = clip && cached?.ready && cached.image.naturalWidth === clip.actualWidth && cached.image.naturalHeight === clip.actualHeight;
    if (!clip || !ready) {
      this.layer.style.display = 'none';
      this.fallback.hidden = this.fallbackHidden;
      this.host.dataset.animationSource = 'cutout';
      this.host.dataset.toolOwner = 'prototype';
      delete this.host.dataset.animationFrame;
      this.lastFrame = -1;
      return;
    }
    const index = this.clock.frameIndex;
    if (index === this.lastFrame) return;
    const frame = clip.frames[index];
    const scale = this.displayHeight / clip.neutralBodyHeight;
    this.layer.style.display = 'block';
    this.layer.style.width = `${frame.width * scale}px`;
    this.layer.style.height = `${frame.height * scale}px`;
    this.layer.style.clipPath=frame.excludeRects?.length?`path(evenodd, "M0 0H${frame.width*scale}V${frame.height*scale}H0Z ${frame.excludeRects.map(r=>`M${r.x*scale} ${r.y*scale}h${r.width*scale}v${r.height*scale}h${-r.width*scale}Z`).join(' ')}")`:'none';
    this.layer.style.backgroundImage = `url(${JSON.stringify(clip.source)})`;
    this.layer.style.backgroundSize = `${clip.actualWidth * scale}px ${clip.actualHeight * scale}px`;
    this.layer.style.backgroundPosition = `${-frame.x * scale}px ${-frame.y * scale}px`;
    this.layer.style.transformOrigin = `${frame.pivotX * scale}px ${frame.pivotY * scale}px`;
    this.layer.style.transform = `translate(${-frame.pivotX * scale}px,${-frame.pivotY * scale}px) scaleX(${this.facing})`;
    this.fallback.hidden = true;
    this.host.dataset.animationSource = clip.assetId;
    this.host.dataset.animationFrame = String(index);
    this.host.dataset.toolOwner = clip.toolOwnership;
    this.lastFrame = index;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clock.dispose();
    for (const { image } of this.images.values()) { image.onload = null; image.onerror = null; }
    this.images.clear();
    this.layer.remove();
    this.fallback.hidden = this.fallbackHidden;
    this.fallback.style.scale = this.fallbackScale;
    delete this.host.dataset.animationSource;
    delete this.host.dataset.animationFrame;
    delete this.host.dataset.toolOwner;
  }
}
