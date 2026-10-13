import { animationFrameTransform, type AnimationProject, type EditableClip } from './AnimationProject';
import type { ClipId, FrameConfig } from '../../config/CharacterSchema';
const cache = new WeakMap<object, Map<string, HTMLCanvasElement>>();
/** Source-local clipping: no original image pixels are overwritten. */
export function rasterFrame(source: CanvasImageSource, frame: FrameConfig): HTMLCanvasElement {
    let frames = cache.get(source as object);
    if (!frames) {
        frames = new Map();
        cache.set(source as object, frames);
    }
    const key = JSON.stringify([frame.x, frame.y, frame.width, frame.height, frame.keepPolygon, frame.eraseRects]);
    const previous = frames.get(key);
    if (previous)
        return previous;
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d')!;
    if (frame.keepPolygon) {
        ctx.beginPath();
        frame.keepPolygon.forEach((p, i) => i ? ctx.lineTo(p.x - frame.x, p.y - frame.y) : ctx.moveTo(p.x - frame.x, p.y - frame.y));
        ctx.closePath();
        ctx.clip();
    }
    ctx.drawImage(source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    for (const r of frame.eraseRects ?? [])
        ctx.clearRect(r.x - frame.x, r.y - frame.y, r.width, r.height);
    if (frames.size >= 16)
        frames.delete(frames.keys().next().value!);
    frames.set(key, canvas);
    return canvas;
}
export function drawRasterFrame(ctx: CanvasRenderingContext2D, source: CanvasImageSource, c: EditableClip, index: number, height: number) {
    const f = c.frames[index], t = animationFrameTransform(c, index, height);
    ctx.drawImage(rasterFrame(source, f), t.x, t.y, f.width * t.scale, f.height * t.scale);
}
export function atlasBounds(c: EditableClip, index: number): {
    left: number;
    top: number;
    right: number;
    bottom: number;
} {
    const f = c.frames[index], t = animationFrameTransform(c, index, 320);
    return { left: 256 + t.x, top: 440 + t.y, right: 256 + t.x + f.width * t.scale, bottom: 440 + t.y + f.height * t.scale };
}
export function renderAtlas(source: CanvasImageSource, c: EditableClip): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    for (let index = 0; index < 8; index++) {
        const raster = rasterFrame(source, c.frames[index]), data = raster.getContext('2d')!.getImageData(0, 0, raster.width, raster.height).data, t = animationFrameTransform(c, index, 320);
        let left = raster.width, top = raster.height, right = -1, bottom = -1;
        for (let y = 0; y < raster.height; y++)
            for (let x = 0; x < raster.width; x++)
                if (data[(y * raster.width + x) * 4 + 3] >= 8) {
                    left = Math.min(left, x);
                    top = Math.min(top, y);
                    right = Math.max(right, x);
                    bottom = Math.max(bottom, y);
                }
        if (right >= 0 && (256 + t.x + left * t.scale < 0 || 440 + t.y + top * t.scale < 0 || 256 + t.x + (right + 1) * t.scale > 512 || 440 + t.y + (bottom + 1) * t.scale > 512))
            throw Error(`Frame ${index + 1}: sprite vượt khung xuất 512×512. Giảm tỷ lệ hoặc chỉnh Dịch X/Y.`);
        const x = index % 4 * 512, y = Math.floor(index / 4) * 512;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, 512, 512);
        ctx.clip();
        ctx.translate(x + 256, y + 440);
        ctx.drawImage(raster, t.x, t.y, raster.width * t.scale, raster.height * t.scale);
        ctx.restore();
    }
    return canvas;
}
export async function buildAtlasData(project: AnimationProject, slug: string): Promise<Record<ClipId, string>> {
    const result = {} as Record<ClipId, string>;
    for (const clip of Object.keys(project.clips) as ClipId[]) {
        const image = new Image();
        image.src = `/assets/characters/${slug}/animation_v01/${clip}.png`;
        await image.decode();
        if (image.naturalWidth !== project.sheetWidth || image.naturalHeight !== project.sheetHeight)
            throw Error('Kích thước nguồn không khớp.');
        result[clip] = renderAtlas(image, project.clips[clip]).toDataURL('image/png');
    }
    return result;
}
