import snow from './SnowguardFrames.json';
import iron from './IroncladFrames.json';
import rabbit from './WindstriderFrames.json';
import type { SnowguardClip } from './SnowguardAnimationPlayer';
import { characterRecord } from '../../config/CharacterProjects';
import { validateAnimationConfig, type AnimationConfig, type FrameConfig, type ClipConfig } from '../../config/CharacterSchema';
export const EDITABLE_RIGS = {
    'beast-a': { name: 'Snowguard', prefix: 'snowguard', slug: 'duck-guardian', frames: snow },
    'beast-e': { name: 'Ironclad', prefix: 'ironclad', slug: 'bear-hammer', frames: iron },
    'beast-c': { name: 'Windstrider', prefix: 'windstrider', slug: 'rabbit-archer', frames: rabbit },
} as const;
export type EditableBeast = keyof typeof EDITABLE_RIGS;
export const ANIMATION_CLIPS: SnowguardClip[] = ['idle', 'walk', 'attack', 'skill', 'hit', 'ko'];
export type EditableFrame = FrameConfig;
export type EditableClip = ClipConfig;
export type AnimationProject = AnimationConfig;
export function savedAnimationProject(id: EditableBeast): AnimationProject { return JSON.parse(JSON.stringify(characterRecord(id).animation ?? createAnimationProject(id))); }
export function createAnimationProject(id: EditableBeast): AnimationProject {
    const clips = {} as AnimationProject['clips'];
    for (const clip of ANIMATION_CLIPS) {
        const cells = EDITABLE_RIGS[id].frames[clip];
        clips[clip] = { frames: cells.map(f => ({ ...f, groundX: f.width / 2, scaleMultiplier: 1, offsetX: 0, offsetY: 0, durationMs: 100 })), order: cells.map((_, i) => i), fps: clip === 'idle' ? 7 : 10, loop: clip === 'idle' || clip === 'walk', normalizeIdle: clip === 'idle', referenceHeight: cells[0].bodyHeight };
    }
    return { version: 1, beastId: id, sheetWidth: 1774, sheetHeight: 887, clips };
}
export function validateAnimationProject(value: unknown): AnimationProject {
    return validateAnimationConfig(value);
}
export function frameAtTime(c: EditableClip, seconds: number): {
    frame: number;
    slot: number;
} {
    const weights = c.order.map(i => c.frames[i].durationMs), total = weights.reduce((a, b) => a + b, 0);
    const duration = c.order.length / c.fps;
    let t = Math.max(0, seconds);
    if (c.loop)
        t %= duration;
    else if (t >= duration)
        return { frame: c.order[7], slot: 7 };
    const weighted = t / duration * total;
    let sum = 0;
    for (let slot = 0; slot < weights.length; slot++) {
        sum += weights[slot];
        if (weighted < sum)
            return { frame: c.order[slot], slot };
    }
    return { frame: c.order[7], slot: 7 };
}
export function timeForFrame(c: EditableClip, index: number): number {
    const slot = c.order.indexOf(index), total = c.frames.reduce((sum, f) => sum + f.durationMs, 0);
    return c.order.slice(0, slot).reduce((sum, i) => sum + c.frames[i].durationMs, 0) / total * (8 / c.fps);
}
export function animationFrameTransform(c: EditableClip, index: number, height = 250) {
    const f = c.frames[index], base = c.normalizeIdle ? height / f.bodyHeight * (1 + (f.bodyHeight / c.referenceHeight - 1) * .1) : height / c.referenceHeight;
    const scale = base * f.scaleMultiplier;
    return { scale, x: -f.groundX * scale + f.offsetX * scale, y: -f.groundY * scale + f.offsetY * scale };
}
export const animationDraftKey = (id: EditableBeast) => `beast-link-animation-draft-v1:${id}`;
export function readAnimationDraft(id: EditableBeast): AnimationProject | undefined {
    try {
        const raw = localStorage.getItem(animationDraftKey(id));
        if (!raw)
            return;
        const p = validateAnimationProject(JSON.parse(raw));
        if (p.beastId === id)
            return p;
    }
    catch { /* Editor surfaces invalid draft instead of silently adopting it. */ }
}
