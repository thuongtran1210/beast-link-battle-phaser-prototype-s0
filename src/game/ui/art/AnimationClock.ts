import { frameAtTime, type AnimationProject } from './AnimationProject';
import type { ClipId } from '../../config/CharacterSchema';
/** Action clips fit the gameplay action duration; weights only redistribute poses. */
export class AnimationClock {
    clip: ClipId = 'idle';
    locomotion: 'idle' | 'walk' = 'idle';
    elapsed = 0;
    alive = true;
    durationOverride: number | undefined;
    constructor(readonly project: AnimationProject) { }
    move(moving: boolean) { this.locomotion = moving ? 'walk' : 'idle'; if (this.alive && ['idle', 'walk'].includes(this.clip) && this.clip !== this.locomotion)
        this.begin(this.locomotion); }
    play(clip: 'attack' | 'skill' | 'hit' | 'ko', milliseconds: number) { if (!this.alive && clip !== 'ko')
        return; if (this.clip === 'attack' && clip === 'hit' || this.clip === 'skill' && (clip === 'attack' || clip === 'hit'))
        return; if (clip === 'ko')
        this.alive = false; this.begin(clip, Math.max(.001, milliseconds / 1000)); }
    private begin(clip: ClipId, duration?: number) { this.clip = clip; this.elapsed = 0; this.durationOverride = duration; }
    step(seconds: number) { this.elapsed += Math.max(0, seconds); const c = this.project.clips[this.clip], duration = this.durationOverride ?? 8 / c.fps; if (!['idle', 'walk'].includes(this.clip) && this.clip !== 'ko' && this.elapsed >= duration && this.alive)
        this.begin(this.locomotion); }
    get frame() { const c = this.project.clips[this.clip], action = !['idle', 'walk'].includes(this.clip); return frameAtTime({ ...c, loop: action ? false : c.loop }, this.durationOverride ? this.elapsed * (8 / c.fps) / this.durationOverride : this.elapsed).frame; }
    revive() { this.alive = true; this.locomotion = 'idle'; this.begin('idle'); }
}
