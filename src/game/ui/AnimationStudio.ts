import './AnimationStudio.css';
import { studioHref } from './studio/StudioNavigation';
import './studio/StudioShared.css';
import { StudioSavePanel } from './studio/StudioSavePanel';
import { canonical, type Point, type Rect } from '../config/CharacterSchema';
import { drawRasterFrame, rasterFrame, buildAtlasData, renderAtlas } from './art/AnimationRaster';
import { ANIMATION_CLIPS, EDITABLE_RIGS, createAnimationProject, savedAnimationProject, validateAnimationProject, frameAtTime, timeForFrame, animationFrameTransform, animationDraftKey, readAnimationDraft, type AnimationProject, type EditableBeast, type EditableFrame } from './art/AnimationProject';
import type { SnowguardClip } from './art/SnowguardAnimationPlayer';
const params = new URLSearchParams(location.search), requested = params.get('unit');
let id: EditableBeast = requested && requested in EDITABLE_RIGS ? requested as EditableBeast : 'beast-c';
let clip: SnowguardClip = ANIMATION_CLIPS.includes(params.get('clip') as SnowguardClip) ? params.get('clip') as SnowguardClip : 'idle';
let project = readAnimationDraft(id) ?? savedAnimationProject(id), selected = 0, playing = false, elapsed = 0, last = 0, zoom = .5, flip = false;
let image: HTMLImageElement | undefined, loadVersion = 0, drag: undefined | {
    kind: 'move' | 'resize' | 'anchor' | 'new' | 'erase' | 'sprite';
    startX: number;
    startY: number;
    frame: EditableFrame;
    before: string;
};
let mode: 'crop' | 'anchor' | 'new' | 'polygon' | 'erase' | 'sprite' = 'crop', saved = true, showOnion = false, polygon: Point[] = [], erasePreview: Rect | undefined, saving = false, pendingFields = false;
type NumericFrameKey = Exclude<keyof EditableFrame, 'keepPolygon' | 'eraseRects'>;
const undo: string[] = [], redo: string[] = [];
const root = document.querySelector<HTMLDivElement>('#animation-studio')!;
root.innerHTML = `<header><div><small>BEAST LINK BATTLE · CHARACTER STUDIO</small><h1>Chỉnh animation</h1></div><div class="studio-header-actions"><a class="studio-review">← Review nhân vật</a><button data-action="import">Nhập JSON</button><button data-action="export">Xuất cấu hình</button><input class="studio-file" type="file" accept="application/json,.json" hidden></div></header><div class="studio-toolbar"><label>Nhân vật <select class="unit-select"></select></label><label>Clip <select class="clip-select"></select></label><button data-action="undo" title="Ctrl/Cmd + Z">Hoàn tác</button><button data-action="redo" title="Ctrl/Cmd + Shift + Z">Làm lại</button><button data-action="restore">Khôi phục clip gốc</button><span class="studio-save" role="status"></span></div><main><section class="studio-sheet-panel"><div class="panel-heading"><h2>Sheet gốc & khung cắt</h2><span class="sheet-size"></span></div><div class="sheet-tools"><button data-mode="crop" aria-pressed="true">Di chuyển / đổi cỡ khung</button><button data-mode="new">Vẽ lại khung</button><button data-mode="anchor">Đặt điểm chân</button><button data-action="fit">Vừa khung</button><label>Zoom <select class="zoom-select"><option value="fit">Vừa khung</option><option value="0.25">25%</option><option value="0.5">50%</option><option value="1">100%</option><option value="2">200%</option></select></label></div><div class="sheet-viewport"><canvas class="sheet-canvas" tabindex="0" aria-label="Sheet gốc: kéo khung cắt hoặc điểm chân, dùng phím mũi tên để tinh chỉnh"></canvas></div><p class="studio-hint">Khung xanh là frame đang chọn · dấu + vàng là điểm chân. Kéo góc dưới phải để đổi cỡ. Khung cắt phải loại phần hình của frame bên cạnh.</p></section><aside><section class="studio-preview-panel"><div class="panel-heading"><h2>Preview</h2><button data-action="flip">Hướng: Phải</button></div><canvas class="studio-preview" width="500" height="390"></canvas><div class="preview-actions"><button data-action="play">Phát</button><button data-action="replay">Phát lại</button><label><input type="checkbox" class="onion"> Pose trước</label></div><p class="preview-info"></p></section><section class="studio-inspector"><h2>Frame <span class="selected-frame"></span></h2><div class="frame-fields"></div><button data-action="trim">Thu gọn vùng alpha trong khung</button><p class="field-hint">Neo X/Y tính từ góc trên trái vùng cắt. Dịch X/Y theo pixel nguồn. Tỷ lệ 1 = giữ nguyên.</p><h3>Thiết lập clip</h3><div class="clip-fields"><label>FPS <input class="fps" type="number" min="1" max="60" step="0.5"></label><label>Chiều cao chuẩn <input class="reference-height" type="number" min="1" max="887"></label></div><label class="check-row"><input type="checkbox" class="loop"> Lặp clip</label><label class="check-row"><input type="checkbox" class="normalize"> Ổn định kích thước như Idle runtime</label></section></aside></main><section class="studio-timeline"><div class="panel-heading"><h2>Timeline · 8 frame</h2><div><button data-action="earlier">← Đưa trước</button><button data-action="later">Đưa sau →</button></div></div><div class="timeline-frames"></div></section><footer><p class="studio-message" role="status" aria-live="polite"></p><details><summary>Hướng dẫn & quy tắc bàn giao</summary><p>Chọn frame → chỉnh khung cắt → đặt điểm chân → chỉnh tỷ lệ/dịch chuyển → phát thử → xuất JSON. Ctrl/Cmd+Z hoàn tác; Shift+mũi tên dịch 10px. Bản nháp lưu trên trình duyệt này, không ghi đè ảnh hoặc cấu hình game.</p><p>Thời lượng frame là trọng số tương đối; FPS quyết định tổng thời gian clip. Trang review có thể xem nháp. Muốn dùng trong Battle, xuất cấu hình và gửi bản đã chốt để tích hợp; clip Attack/Skill vẫn cần đồng bộ với thời điểm gameplay.</p></details></footer>`;
const q = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
const tabs = document.createElement('div');
tabs.className = 'character-studio-tabs';
q('.studio-sheet-panel').prepend(tabs);
for (const [value, label] of [['sprite', 'Dịch sprite'], ['polygon', 'Khoanh giữ sprite'], ['erase', 'Loại vùng thừa']]) {
    const button = document.createElement('button');
    button.dataset.mode = value;
    button.textContent = label;
    q('.sheet-tools').prepend(button);
}
const maskTools = document.createElement('div');
maskTools.className = 'mask-actions';
maskTools.innerHTML = '<button data-action="apply-mask">Áp dụng vùng giữ</button><button data-action="clear-mask">Xóa mask frame</button><button data-action="atlas">Xuất atlas clip PNG</button>';
q('.studio-sheet-panel').append(maskTools);
q('.studio-hint').textContent = 'Khung nguồn được vượt ô lưới. Khoanh các điểm quanh sprite → Áp dụng vùng giữ; kéo Loại vùng thừa để bỏ hình bên cạnh. Dịch sprite chỉ đổi vị trí trong khung xuất.';
q('details').innerHTML = '<summary>Hướng dẫn & lưu dự án</summary><p>Chọn frame → chỉnh vùng nguồn → khoanh giữ sprite / loại vùng thừa → đặt điểm chân → dịch sprite → phát thử → Xem thay đổi & lưu. Mask không phục hồi phần đã bị pose khác che trong ảnh gốc.</p><p>Khung xuất 512×512, neo chân (256,440), chiều cao chuẩn 320px. Sprite vượt khung xuất sẽ bị chặn lưu; giảm tỷ lệ hoặc chỉnh vị trí. Battle giữ thời lượng hành động, phân phối pose theo trọng số frame. Bản nháp tự lưu trên máy; lưu dự án ghi JSON và atlas PNG, giữ nguyên ảnh nguồn.</p>';
const saveHost = document.createElement('div');
q('.studio-toolbar').after(saveHost);
const names: Record<SnowguardClip, string> = { idle: 'Idle · Đứng chờ', walk: 'Run · Di chuyển', attack: 'Attack · Tấn công', skill: 'Skill · Kỹ năng', hit: 'Hit · Trúng đòn', ko: 'KO · Gục ngã' };
for (const [key, rig] of Object.entries(EDITABLE_RIGS)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = rig.name;
    q('.unit-select').append(option);
}
for (const c of ANIMATION_CLIPS) {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = names[c];
    q('.clip-select').append(option);
}
const fields: [
    NumericFrameKey,
    string,
    number,
    number,
    number
][] = [['x', 'Cắt X', 0, 1773, 1], ['y', 'Cắt Y', 0, 886, 1], ['width', 'Rộng', 1, 1774, 1], ['height', 'Cao', 1, 887, 1], ['groundX', 'Neo chân X', 0, 1774, .5], ['groundY', 'Neo chân Y', 0, 887, .5], ['bodyHeight', 'Chiều cao cơ thể', 1, 887, 1], ['scaleMultiplier', 'Tỷ lệ', .1, 5, .01], ['offsetX', 'Dịch X', -887, 887, .5], ['offsetY', 'Dịch Y', -887, 887, .5], ['durationMs', 'Thời lượng tương đối (ms)', 10, 5000, 10]];
for (const [key, label, min, max, step] of fields) {
    const wrap = document.createElement('label');
    wrap.textContent = label;
    const input = document.createElement('input');
    input.type = 'number';
    input.dataset.field = key;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.oninput = () => { pendingFields = true; applyFieldsButton.disabled = false; message('Thông số đã nhập chưa áp dụng. Bấm Áp dụng thông số để xem preview.'); };
    wrap.append(input);
    q('.frame-fields').append(wrap);
}
const applyFieldsButton = document.createElement('button');
applyFieldsButton.textContent = 'Áp dụng thông số';
applyFieldsButton.disabled = true;
applyFieldsButton.onclick = () => applyFields();
q('.frame-fields').after(applyFieldsButton);
function applyFields(): boolean {
    try {
        const next = JSON.parse(JSON.stringify(project)) as AnimationProject, c = next.clips[clip];
        root.querySelectorAll<HTMLInputElement>('[data-field]').forEach(input => { c.frames[selected][input.dataset.field as NumericFrameKey] = input.valueAsNumber; });
        c.fps = q<HTMLInputElement>('.fps').valueAsNumber;
        c.referenceHeight = q<HTMLInputElement>('.reference-height').valueAsNumber;
        validateAnimationProject(next);
        const before = JSON.stringify(project);
        project = next;
        pendingFields = false;
        commit(before, 'Đã áp dụng thông số vào preview và bản nháp.');
        return true;
    }
    catch (error) {
        message((error as Error).message, true);
        return false;
    }
}
const sheet = q<HTMLCanvasElement>('.sheet-canvas'), sheetCtx = sheet.getContext('2d')!, preview = q<HTMLCanvasElement>('.studio-preview'), previewCtx = preview.getContext('2d')!;
preview.tabIndex = 0;
preview.setAttribute('aria-label', 'Khung xuất frame: chọn Dịch sprite rồi kéo nhân vật hoặc dùng phím mũi tên');
let previewDrag: undefined | {
    before: string;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    scale: number;
};
function previewPoint(event: PointerEvent) { const r = preview.getBoundingClientRect(), s = Math.min(r.width / preview.width, r.height / preview.height); return { x: (event.clientX - r.left - (r.width - preview.width * s) / 2) / s, y: (event.clientY - r.top - (r.height - preview.height * s) / 2) / s }; }
preview.onpointerdown = e => { if (pendingFields && !applyFields())
    return; if (mode !== 'sprite' || !image || e.button !== 0)
    return; const p = previewPoint(e), f = project.clips[clip].frames[selected]; playing = false; previewDrag = { before: JSON.stringify(project), x: p.x, y: p.y, offsetX: f.offsetX, offsetY: f.offsetY, scale: animationFrameTransform(project.clips[clip], selected, 220).scale }; preview.setPointerCapture(e.pointerId); preview.focus(); q('[data-action="play"]').textContent = 'Phát'; };
preview.onpointermove = e => { if (!previewDrag)
    return; const p = previewPoint(e), f = project.clips[clip].frames[selected], d = previewDrag; f.offsetX = Math.max(-887, Math.min(887, d.offsetX + (p.x - d.x) / d.scale * (flip ? -1 : 1))); f.offsetY = Math.max(-887, Math.min(887, d.offsetY + (p.y - d.y) / d.scale)); };
preview.onpointerup = () => { if (!previewDrag)
    return; const before = previewDrag.before; previewDrag = undefined; commit(before, 'Đã dịch sprite trong khung xuất.'); };
preview.onpointercancel = () => { if (previewDrag) {
    project = JSON.parse(previewDrag.before);
    previewDrag = undefined;
    sync();
    drawSheet();
} };
function message(text: string, error = false) { q('.studio-message').textContent = text; q('.studio-message').classList.toggle('is-error', error); }
function persist() { try {
    localStorage.setItem(animationDraftKey(id), JSON.stringify(project));
    saved = true;
    q('.studio-save').textContent = 'Nháp trên máy · chưa lưu vào dự án';
}
catch {
    saved = false;
    q('.studio-save').textContent = 'Chưa lưu được · hãy xuất JSON';
} }
function remember(before: string) { undo.push(before); if (undo.length > 100)
    undo.shift(); redo.length = 0; }
function commit(before: string, text = 'Đã chỉnh frame') {
    try {
        project = validateAnimationProject(project);
        if (JSON.stringify(project) !== before) {
            remember(before);
            persist();
        }
        message(text);
        sync();
        drawSheet();
    }
    catch (error) {
        project = JSON.parse(before);
        message((error as Error).message, true);
        sync();
        drawSheet();
    }
}
function edit(change: () => void, text?: string) { const before = JSON.stringify(project); change(); commit(before, text); }
function sync() {
    pendingFields = false;
    applyFieldsButton.disabled = true;
    q<HTMLSelectElement>('.unit-select').value = id;
    q<HTMLSelectElement>('.clip-select').value = clip;
    q<HTMLAnchorElement>('.studio-review').href = `/unit-review.html?unit=${id}`;
    q('.selected-frame').textContent = String(selected + 1);
    const c = project.clips[clip], f = c.frames[selected];
    root.querySelectorAll<HTMLInputElement>('[data-field]').forEach(input => input.value = String(f[input.dataset.field as NumericFrameKey]));
    tabs.innerHTML = `<a href="${studioHref(id)}">Avatar / thông số / kỹ năng</a><a aria-current="page" href="${studioHref(id, 'animation', clip)}">Animation / mask</a>`;
    q<HTMLInputElement>('.fps').value = String(c.fps);
    q<HTMLInputElement>('.reference-height').value = String(c.referenceHeight);
    q<HTMLInputElement>('.loop').checked = c.loop;
    q<HTMLInputElement>('.loop').parentElement!.lastChild!.textContent = ['idle','walk'].includes(clip)?' Lặp clip (Review/Battle)':' Lặp preview (Battle phát một lần)';
    q<HTMLInputElement>('.normalize').checked = c.normalizeIdle;
    q<HTMLButtonElement>('[data-action="undo"]').disabled = !undo.length;
    q<HTMLButtonElement>('[data-action="redo"]').disabled = !redo.length;
    q('.timeline-frames').replaceChildren();
    c.order.forEach((index, slot) => { const button = document.createElement('button'); button.setAttribute('aria-pressed', String(index === selected)); button.setAttribute('aria-label', `Chọn frame ${index + 1}, vị trí ${slot + 1}`); const thumb = document.createElement('canvas'); thumb.width = 100; thumb.height = 90; const label = document.createElement('span'); label.textContent = `${slot + 1} · Frame ${index + 1}`; button.append(thumb, label); button.onclick = () => selectFrame(index); q('.timeline-frames').append(button); if (image) {
        const cell = c.frames[index], scale = Math.min(90 / cell.width, 80 / cell.height);
        thumb.getContext('2d')!.drawImage(rasterFrame(image, cell), (100 - cell.width * scale) / 2, (90 - cell.height * scale) / 2, cell.width * scale, cell.height * scale);
    } });
}
function selectFrame(index: number) { if (pendingFields && !applyFields())
    return; polygon = []; erasePreview = undefined; selected = index; playing = false; elapsed = timeForFrame(project.clips[clip], index); q('[data-action="play"]').textContent = 'Phát'; sync(); drawSheet(); }
function zoomTo(value: number) { zoom = Math.max(.1, Math.min(3, value)); sheet.style.width = `${project.sheetWidth * zoom}px`; sheet.style.height = `${project.sheetHeight * zoom}px`; }
function fit() { zoomTo((q('.sheet-viewport').clientWidth - 20) / project.sheetWidth); q<HTMLSelectElement>('.zoom-select').value = 'fit'; q<HTMLOptionElement>('.zoom-select option[value="fit"]').textContent = `Vừa khung (${Math.round(zoom * 100)}%)`; }
async function load() {
    polygon = [];
    erasePreview = undefined;
    const version = ++loadVersion;
    image = undefined;
    playing = false;
    elapsed = 0;
    selected = 0;
    q('[data-action="play"]').textContent = 'Phát';
    const next = new Image();
    next.src = `/assets/characters/${EDITABLE_RIGS[id].slug}/animation_v01/${clip}.png`;
    try {
        await next.decode();
        if (version !== loadVersion)
            return;
        if (next.naturalWidth !== project.sheetWidth || next.naturalHeight !== project.sheetHeight)
            throw Error('Sheet không khớp kích thước dự án.');
        image = next;
        sheet.width = next.naturalWidth;
        sheet.height = next.naturalHeight;
        q('.sheet-size').textContent = `${next.naturalWidth}×${next.naturalHeight} · ${names[clip]}`;
        sync();
        fit();
        drawSheet();
    }
    catch (error) {
        if (version === loadVersion)
            message(`Không tải được sheet: ${(error as Error).message}`, true);
    }
}
function drawSheet() {
    sheetCtx.clearRect(0, 0, sheet.width, sheet.height);
    if (!image)
        return;
    sheetCtx.drawImage(image, 0, 0);
    project.clips[clip].frames.forEach((f, index) => { sheetCtx.strokeStyle = index === selected ? '#a7e867' : '#9cacb866'; sheetCtx.lineWidth = (index === selected ? 2 : 1) / zoom; sheetCtx.strokeRect(f.x, f.y, f.width, f.height); sheetCtx.fillStyle = index === selected ? '#b2f47a' : '#c2cbd6'; sheetCtx.font = `${13 / zoom}px system-ui`; sheetCtx.fillText(String(index + 1), f.x + 8 / zoom, f.y + 20 / zoom); });
    const f = project.clips[clip].frames[selected], ax = f.x + f.groundX, ay = f.y + f.groundY;
    sheetCtx.strokeStyle = '#ffcc66';
    sheetCtx.lineWidth = 2 / zoom;
    sheetCtx.beginPath();
    sheetCtx.moveTo(ax - 10 / zoom, ay);
    sheetCtx.lineTo(ax + 10 / zoom, ay);
    sheetCtx.moveTo(ax, ay - 10 / zoom);
    sheetCtx.lineTo(ax, ay + 10 / zoom);
    sheetCtx.stroke();
    sheetCtx.fillStyle = '#b2f47a';
    sheetCtx.fillRect(f.x + f.width - 6 / zoom, f.y + f.height - 6 / zoom, 12 / zoom, 12 / zoom);
    const points = polygon.length ? polygon : f.keepPolygon;
    if (points?.length) {
        sheetCtx.beginPath();
        points.forEach((p, i) => i ? sheetCtx.lineTo(p.x, p.y) : sheetCtx.moveTo(p.x, p.y));
        if (!polygon.length)
            sheetCtx.closePath();
        sheetCtx.strokeStyle = '#5be3e0';
        sheetCtx.lineWidth = 2 / zoom;
        sheetCtx.stroke();
        for (const p of points) {
            sheetCtx.fillStyle = '#5be3e0';
            sheetCtx.fillRect(p.x - 3 / zoom, p.y - 3 / zoom, 6 / zoom, 6 / zoom);
        }
    }
    sheetCtx.fillStyle = '#ff635d55';
    for (const r of [...(f.eraseRects ?? []), ...(erasePreview ? [erasePreview] : [])])
        sheetCtx.fillRect(r.x, r.y, r.width, r.height);
}
function point(event: PointerEvent) { const rect = sheet.getBoundingClientRect(); return { x: (event.clientX - rect.left) * sheet.width / rect.width, y: (event.clientY - rect.top) * sheet.height / rect.height }; }
sheet.onpointerdown = event => {
    if (pendingFields && !applyFields())
        return;
    if (!image || event.button !== 0)
        return;
    const p = point(event), before = JSON.stringify(project);
    if (mode === 'polygon') {
        if (polygon.length < 100) {
            polygon.push({ x: Math.max(0, Math.min(sheet.width, p.x)), y: Math.max(0, Math.min(sheet.height, p.y)) });
            drawSheet();
            message(`${polygon.length} điểm mask · cần ít nhất 3 điểm rồi Áp dụng vùng giữ.`);
        }
        return;
    }
    if (mode === 'crop') {
        const hits = project.clips[clip].frames.map((f, i) => ({ f, i })).filter(({ f }) => p.x >= f.x && p.x <= f.x + f.width && p.y >= f.y && p.y <= f.y + f.height);
        if (hits.length && !hits.some(h => h.i === selected))
            selectFrame(hits[0].i);
    }
    const f = { ...project.clips[clip].frames[selected] }, nearCorner = Math.abs(p.x - f.x - f.width) < 14 / zoom && Math.abs(p.y - f.y - f.height) < 14 / zoom;
    if (mode === 'crop' && !nearCorner && !(p.x >= f.x && p.x <= f.x + f.width && p.y >= f.y && p.y <= f.y + f.height))
        return;
    drag = { kind: mode === 'erase' ? 'erase' : mode === 'sprite' ? 'sprite' : mode === 'anchor' ? 'anchor' : mode === 'new' ? 'new' : nearCorner ? 'resize' : 'move', startX: p.x, startY: p.y, frame: f, before };
    sheet.setPointerCapture(event.pointerId);
    sheet.focus();
    playing = false;
    q('[data-action="play"]').textContent = 'Phát';
};
sheet.onpointermove = event => {
    if (!drag)
        return;
    const p = point(event), f = project.clips[clip].frames[selected], old = drag.frame;
    if (drag.kind === 'erase') {
        const x = Math.max(0, Math.min(sheet.width - 1, Math.min(p.x, drag.startX))), y = Math.max(0, Math.min(sheet.height - 1, Math.min(p.y, drag.startY)));
        erasePreview = { x, y, width: Math.max(1, Math.min(sheet.width - x, Math.abs(p.x - drag.startX))), height: Math.max(1, Math.min(sheet.height - y, Math.abs(p.y - drag.startY))) };
    }
    else if (drag.kind === 'sprite') {
        f.offsetX = Math.max(-887, Math.min(887, old.offsetX + p.x - drag.startX));
        f.offsetY = Math.max(-887, Math.min(887, old.offsetY + p.y - drag.startY));
    }
    else if (drag.kind === 'anchor') {
        f.groundX = Math.max(0, Math.min(f.width, p.x - f.x));
        f.groundY = Math.max(0, Math.min(f.height, p.y - f.y));
    }
    else if (drag.kind === 'move') {
        f.x = Math.round(Math.max(0, Math.min(project.sheetWidth - f.width, old.x + p.x - drag.startX)));
        f.y = Math.round(Math.max(0, Math.min(project.sheetHeight - f.height, old.y + p.y - drag.startY)));
    }
    else if (drag.kind === 'resize') {
        f.width = Math.round(Math.max(1, Math.min(project.sheetWidth - f.x, p.x - f.x)));
        f.height = Math.round(Math.max(1, Math.min(project.sheetHeight - f.y, p.y - f.y)));
        f.groundX = Math.min(f.groundX, f.width);
        f.groundY = Math.min(f.groundY, f.height);
    }
    else {
        f.x = Math.round(Math.max(0, Math.min(project.sheetWidth - 1, Math.min(p.x, drag.startX))));
        f.y = Math.round(Math.max(0, Math.min(project.sheetHeight - 1, Math.min(p.y, drag.startY))));
        f.width = Math.round(Math.max(1, Math.min(project.sheetWidth - f.x, Math.abs(p.x - drag.startX))));
        f.height = Math.round(Math.max(1, Math.min(project.sheetHeight - f.y, Math.abs(p.y - drag.startY))));
        f.groundX = Math.max(0, Math.min(f.width, old.x + old.groundX - f.x));
        f.groundY = Math.max(0, Math.min(f.height, old.y + old.groundY - f.y));
    }
    drawSheet();
};
sheet.onpointerup = () => { if (!drag)
    return; const before = drag.before; if (drag.kind === 'erase' && erasePreview) {
    const f = project.clips[clip].frames[selected];
    f.eraseRects ??= [];
    f.eraseRects.push(erasePreview);
} erasePreview = undefined; drag = undefined; commit(before); };
sheet.onpointercancel = () => { if (drag) {
    project = JSON.parse(drag.before);
    drag = undefined;
    sync();
    drawSheet();
} };
root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.onclick = () => { mode = button.dataset.mode as typeof mode; root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); });
q<HTMLSelectElement>('.unit-select').onchange = e => { if (pendingFields && !applyFields()) {
    q<HTMLSelectElement>('.unit-select').value = id;
    return;
} id = (e.target as HTMLSelectElement).value as EditableBeast; project = readAnimationDraft(id) ?? savedAnimationProject(id); undo.length = 0; redo.length = 0; saved = true; message('Đã mở nhân vật; dùng bản nháp nếu có.'); void savePanel.load(true); load(); };
q<HTMLSelectElement>('.clip-select').onchange = e => { if (pendingFields && !applyFields()) {
    q<HTMLSelectElement>('.clip-select').value = clip;
    return;
} clip = (e.target as HTMLSelectElement).value as SnowguardClip; load(); };
q<HTMLSelectElement>('.zoom-select').onchange = e => { const value = (e.target as HTMLSelectElement).value; if (value === 'fit')
    fit();
else
    zoomTo(Number(value)); };
for (const selector of ['.fps', '.reference-height'])
    q<HTMLInputElement>(selector).oninput = () => { pendingFields = true; applyFieldsButton.disabled = false; message('Nhập thiết lập clip xong → Áp dụng thông số.'); };
q<HTMLInputElement>('.loop').onchange = e => { const checked = (e.target as HTMLInputElement).checked; if (pendingFields && !applyFields()) {
    q<HTMLInputElement>('.loop').checked = project.clips[clip].loop;
    return;
} edit(() => { project.clips[clip].loop = checked; }); };
q<HTMLInputElement>('.normalize').onchange = e => { const checked = (e.target as HTMLInputElement).checked; if (pendingFields && !applyFields()) {
    q<HTMLInputElement>('.normalize').checked = project.clips[clip].normalizeIdle;
    return;
} edit(() => { project.clips[clip].normalizeIdle = checked; }); };
q<HTMLInputElement>('.onion').onchange = e => { showOnion = (e.target as HTMLInputElement).checked; };
function history(back: boolean) { const from = back ? undo : redo, to = back ? redo : undo; if (!from.length)
    return; to.push(JSON.stringify(project)); project = JSON.parse(from.pop()!); persist(); elapsed = timeForFrame(project.clips[clip], selected); sync(); drawSheet(); message(back ? 'Đã hoàn tác' : 'Đã làm lại'); }
function download() { try {
    const valid = validateAnimationProject(project), blob = new Blob([JSON.stringify(valid, null, 2) + '\n'], { type: 'application/json' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url;
    link.download = `${EDITABLE_RIGS[id].prefix}-animation-project-v1.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('Đã xuất cấu hình đầy đủ, gồm frame và nhịp phát của 6 clip.');
}
catch (error) {
    message((error as Error).message, true);
} }
const actions: Record<string, () => void> = { fit, undo: () => history(true), redo: () => history(false), export: download, import: () => q<HTMLInputElement>('.studio-file').click(), play: () => { if (playing) {
        selected = frameAtTime(project.clips[clip], elapsed).frame;
        sync();
        drawSheet();
    } playing = !playing; q('[data-action="play"]').textContent = playing ? 'Tạm dừng' : 'Phát'; }, replay: () => { elapsed = 0; playing = true; q('[data-action="play"]').textContent = 'Tạm dừng'; }, flip: () => { flip = !flip; q('[data-action="flip"]').textContent = `Hướng: ${flip ? 'Trái' : 'Phải'}`; }, restore: () => { if (confirm(`Khôi phục ${names[clip]} về cấu hình gốc? Bạn có thể hoàn tác.`))
        edit(() => { project.clips[clip] = createAnimationProject(id).clips[clip]; }, 'Đã khôi phục clip gốc.'); }, earlier: () => reorder(-1), later: () => reorder(1), trim: trim,
    'apply-mask': () => { if (polygon.length < 3) {
        message('Cần ít nhất 3 điểm quanh sprite.', true);
        return;
    } edit(() => { project.clips[clip].frames[selected].keepPolygon = polygon.map(p => ({ ...p })); polygon = []; }, 'Đã áp dụng vùng giữ sprite.'); },
    'clear-mask': () => edit(() => { delete project.clips[clip].frames[selected].keepPolygon; delete project.clips[clip].frames[selected].eraseRects; polygon = []; }, 'Đã xóa mask frame.'),
    atlas: () => { try {
        if (!image)
            return;
        const url = renderAtlas(image, project.clips[clip]).toDataURL('image/png'), a = document.createElement('a');
        a.href = url;
        a.download = `${EDITABLE_RIGS[id].prefix}-${clip}-atlas.png`;
        a.click();
        message('Đã xuất atlas clip PNG.');
    }
    catch (error) {
        message((error as Error).message, true);
    } }
};
root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.onclick = () => { if (pendingFields && !applyFields())
    return; actions[button.dataset.action!](); });
function reorder(direction: number) { edit(() => { const order = project.clips[clip].order, index = order.indexOf(selected), next = index + direction; if (next < 0 || next >= 8)
    return; [order[index], order[next]] = [order[next], order[index]]; }, 'Đã đổi thứ tự timeline.'); }
function trim() {
    if (!image)
        return;
    const before = JSON.stringify(project), f = project.clips[clip].frames[selected], off = document.createElement('canvas');
    off.width = f.width;
    off.height = f.height;
    const ctx = off.getContext('2d')!;
    ctx.drawImage(image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
    const data = ctx.getImageData(0, 0, f.width, f.height).data;
    let left = f.width, top = f.height, right = -1, bottom = -1;
    for (let y = 0; y < f.height; y++)
        for (let x = 0; x < f.width; x++)
            if (data[(y * f.width + x) * 4 + 3] >= 32) {
                left = Math.min(left, x);
                top = Math.min(top, y);
                right = Math.max(right, x);
                bottom = Math.max(bottom, y);
            }
    if (right < 0) {
        message('Khung hiện tại không có nội dung alpha.', true);
        return;
    }
    left = Math.max(0, left - 3);
    top = Math.max(0, top - 3);
    right = Math.min(f.width - 1, right + 3);
    bottom = Math.min(f.height - 1, bottom + 3);
    f.x += left;
    f.y += top;
    f.width = right - left + 1;
    f.height = bottom - top + 1;
    f.groundX = Math.max(0, Math.min(f.width, f.groundX - left));
    f.groundY = Math.max(0, Math.min(f.height, f.groundY - top));
    commit(before, 'Đã thu gọn alpha trong khung. Nếu còn hình bên cạnh, hãy cắt thủ công trước.');
}
q<HTMLInputElement>('.studio-file').onchange = async (event) => { const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file)
    return; try {
    if (file.size > 250000)
        throw Error('JSON quá lớn (tối đa 250 KB).');
    const parsed = validateAnimationProject(JSON.parse(await file.text()));
    if (parsed.beastId !== id)
        throw Error('JSON thuộc nhân vật khác. Chọn đúng nhân vật rồi nhập lại.');
    const before = JSON.stringify(project);
    project = parsed;
    commit(before, 'Đã nhập JSON và lưu nháp.');
}
catch (error) {
    message((error as Error).message, true);
}
finally {
    input.value = '';
} };
document.addEventListener('keydown', event => {
    const field = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement;
    if (field)
        return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        history(!event.shiftKey);
        return;
    }
    if (event.key === 'Escape' && previewDrag) {
        project = JSON.parse(previewDrag.before);
        previewDrag = undefined;
        sync();
        drawSheet();
        return;
    }
    if (event.key === 'Escape' && polygon.length) {
        polygon = [];
        drawSheet();
        return;
    }
    if (event.key === 'Escape' && drag) {
        project = JSON.parse(drag.before);
        drag = undefined;
        erasePreview = undefined;
        sync();
        drawSheet();
        return;
    }
    if (document.activeElement === preview && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        edit(() => { const f = project.clips[clip].frames[selected], horizontal = ['ArrowLeft', 'ArrowRight'].includes(event.key), delta = (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) * (event.shiftKey ? 10 : 1); f[horizontal ? 'offsetX' : 'offsetY'] += delta * (horizontal && flip ? -1 : 1); }, 'Đã dịch sprite trong khung xuất.');
        return;
    }
    if (document.activeElement === sheet && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        edit(() => { const f = project.clips[clip].frames[selected], horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight', delta = (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) * step; const key = mode === 'sprite' ? (horizontal ? 'offsetX' : 'offsetY') : mode === 'anchor' ? (horizontal ? 'groundX' : 'groundY') : (horizontal ? 'x' : 'y'); f[key] += delta; });
    }
});
window.addEventListener('beforeunload', event => { if (!saved || saving || pendingFields) {
    event.preventDefault();
    event.returnValue = "";
} });
function drawPreviewFrame(index: number, alpha = 1) { if (!image)
    return; const c = project.clips[clip]; previewCtx.save(); previewCtx.globalAlpha = alpha; previewCtx.translate(250, 330); if (flip)
    previewCtx.scale(-1, 1); drawRasterFrame(previewCtx, image, c, index, 220); previewCtx.restore(); }
function animate(now: number) {
    const dt = last ? Math.max(0, Math.min(.1, (now - last) / 1000)) : 0;
    last = now;
    const c = project.clips[clip];
    if (playing && !document.hidden)
        elapsed += dt;
    const at = playing ? frameAtTime(c, elapsed) : { frame: selected, slot: c.order.indexOf(selected) };
    previewCtx.clearRect(0, 0, 500, 390);
    previewCtx.strokeStyle = '#597669';
    previewCtx.beginPath();
    previewCtx.moveTo(30, 330);
    previewCtx.lineTo(470, 330);
    previewCtx.moveTo(250, 315);
    previewCtx.lineTo(250, 345);
    previewCtx.stroke();
    previewCtx.strokeStyle = '#5be3e0';
    previewCtx.strokeRect(74, 27.5, 352, 352);
    previewCtx.fillStyle = '#b5cbd3';
    previewCtx.font = '13px system-ui';
    previewCtx.fillText('Khung xuất 512 × 512 · neo chân cố định', 74, 19);
    if (showOnion && at.slot > 0)
        drawPreviewFrame(c.order[at.slot - 1], .22);
    drawPreviewFrame(at.frame);
    q('.preview-info').textContent = `Frame ${at.frame + 1}/8 · vị trí ${at.slot + 1} · ${c.fps} FPS · ${c.loop ? 'Lặp' : 'Một lần, giữ cuối'}`;
    requestAnimationFrame(animate);
}
document.addEventListener('visibilitychange', () => { last = 0; });
const savePanel = new StudioSavePanel(saveHost, { id: () => id, section: 'animation', value: () => { if (pendingFields && !applyFields())
        throw Error('Thông số frame chưa hợp lệ.'); return validateAnimationProject(project); }, assets: async (value, beast) => ({ atlasData: await buildAtlasData(validateAnimationProject(value), EDITABLE_RIGS[beast as EditableBeast].slug) }), assetSummary: () => 'Xuất atlas PNG của đủ 6 clip và lưu cùng cấu hình; ảnh nguồn giữ nguyên.', loaded: state => { if (!readAnimationDraft(id)) {
        project = state.record.animation ?? createAnimationProject(id);
        q('.studio-save').textContent = 'Đã mở cấu hình dự án';
        void load();
    }
    else if (state.record.animation && canonical(state.record.animation) !== canonical(project))
        message('Nháp khác bản dự án. Xem thay đổi trước khi lưu.'); }, restored: state => { project = state.record.animation ?? createAnimationProject(id); persist(); undo.length = redo.length = 0; void load(); }, saved: () => { q('.studio-save').textContent = 'Đã lưu vào dự án'; }, notify: message, working: busy => { saving = busy; root.inert = busy; } });
sync();
q('.studio-save').textContent = readAnimationDraft(id) ? 'Nháp trên máy · xem thay đổi để lưu dự án' : 'Cấu hình dự án';
load();
requestAnimationFrame(animate);
