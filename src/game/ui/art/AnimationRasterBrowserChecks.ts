import { createAnimationProject, EDITABLE_RIGS } from './AnimationProject';
import { rasterFrame, renderAtlas, buildAtlasData } from './AnimationRaster';
const output = document.querySelector('#results')!, lines: string[] = [];
function expect(ok: boolean, label: string) { if (!ok)
    throw Error(label); lines.push(`PASS ${label}`); output.textContent = lines.join('\n'); }
try {
    const source = document.createElement('canvas');
    source.width = 1774;
    source.height = 887;
    const ctx = source.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(430, 470, 30, 30);
    ctx.fillStyle = 'blue';
    ctx.fillRect(480, 470, 30, 30);
    const p = createAnimationProject('beast-a'), f = p.clips.attack.frames[4];
    Object.assign(f, { x: 420, y: 450, width: 100, height: 80, groundX: 30, groundY: 50, bodyHeight: 320, keepPolygon: [{ x: 420, y: 450 }, { x: 470, y: 450 }, { x: 470, y: 520 }, { x: 420, y: 520 }] });
    let frame = rasterFrame(source, f), pixels = frame.getContext('2d')!;
    expect(pixels.getImageData(20, 30, 1, 1).data[3] === 255, 'mask giữ sprite vượt ranh giới ô lưới');
    expect(pixels.getImageData(70, 30, 1, 1).data[3] === 0, 'mask loại sprite bên cạnh');
    f.eraseRects = [{ x: 440, y: 470, width: 10, height: 30 }];
    frame = rasterFrame(source, f);
    expect(frame.getContext('2d')!.getImageData(25, 30, 1, 1).data[3] === 0, 'vùng loại bỏ trong mask');
    expect(ctx.getImageData(445, 480, 1, 1).data[3] === 255, 'sheet nguồn không bị sửa');
    delete f.eraseRects;
    f.offsetX = 10;
    f.offsetY = -10;
    p.clips.attack.referenceHeight = 320;
    const atlas = renderAtlas(source, p.clips.attack);
    expect(atlas.width === 2048 && atlas.height === 1024, 'atlas chuẩn 4×2 ô 512px');
    expect(atlas.getContext('2d')!.getImageData(256, 512 + 405, 1, 1).data[3] === 255, 'offset + điểm chân được bake đúng vào atlas');
    const decoded = new Image();
    decoded.src = atlas.toDataURL('image/png');
    await decoded.decode();
    expect(decoded.naturalWidth === 2048, 'PNG atlas decode lại được');
    f.offsetX = 800;
    let rejected = false;
    try {
        renderAtlas(source, p.clips.attack);
    }
    catch {
        rejected = true;
    }
    expect(rejected, 'chặn sprite bị cắt bởi khung xuất');
    for (const id of Object.keys(EDITABLE_RIGS) as (keyof typeof EDITABLE_RIGS)[]) {
        const data = await buildAtlasData(createAnimationProject(id), EDITABLE_RIGS[id].slug);
        expect(Object.keys(data).length === 6, `${id}: đủ sáu sheet nguồn xuất atlas không cắt sprite`);
    }
    lines.push('DONE · không ghi cấu hình dự án.');
    output.textContent = lines.join('\n');
}
catch (error) {
    output.textContent = lines.join('\n') + '\nFAIL ' + (error as Error).message;
}
