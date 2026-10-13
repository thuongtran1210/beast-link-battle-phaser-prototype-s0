import './UnitReview.css';
import { unitOverride, unitBaseStats } from '../config/UnitOverrides';
import { SKILL_FIELDS, canonical, type CharacterId } from '../config/CharacterSchema';
import { skillValue, characterRecord, updateCharacterRecord } from '../config/CharacterProjects';
import { readCharacter } from './studio/CharacterApi';
import { studioHref } from './studio/StudioNavigation';
import { drawRasterFrame } from './art/AnimationRaster';
import { DECK_UNITS } from '../run/RunDeck';
import { roleForBeast, signatureForBeast, recommendedRows } from '../battle/BeastRoles';
import { roleBaseStats } from '../battle/AutonomousBattleModel';
import { P1V11A_ACTION_TIMING_FIXTURE } from '../battle/BattleConfig';
import * as profile from '../run/StarProfile';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import snow from './art/SnowguardFrames.json';
import iron from './art/IroncladFrames.json';
import rabbit from './art/WindstriderFrames.json';
import type { SnowguardClip } from './art/SnowguardAnimationPlayer';
import { readAnimationDraft, savedAnimationProject, frameAtTime, timeForFrame, type AnimationProject, type EditableBeast } from './art/AnimationProject';
const rigs: Record<string, {
    path: string;
    frames: typeof snow;
}> = {
    'beast-a': { path: 'duck-guardian', frames: snow }, 'beast-e': { path: 'bear-hammer', frames: iron }, 'beast-c': { path: 'rabbit-archer', frames: rabbit },
};
const clipNames: Record<SnowguardClip, string> = { idle: 'Idle · Đứng chờ', walk: 'Run · Di chuyển', attack: 'Attack · Tấn công', skill: 'Skill · Kỹ năng', hit: 'Hit · Trúng đòn', ko: 'KO · Gục ngã' };
let id = DECK_UNITS[0] as string, star: profile.StarLevel = 2, clip: SnowguardClip = 'idle';
const requested = new URLSearchParams(location.search).get('unit');
if (DECK_UNITS.includes(requested as typeof DECK_UNITS[number]))
    id = requested!;
const root = document.querySelector<HTMLDivElement>('#unit-review')!;
root.innerHTML = `<header><div><small>BEAST LINK BATTLE · TRANG REVIEW</small><h1>Nhân vật & kỹ năng</h1><p>Xem thông số, so sánh STAR và kiểm tra từng frame animation.</p></div><a href="/">Về game →</a></header><main><aside><h2>Đội hình · 10 Beast</h2><nav aria-label="Chọn nhân vật"></nav></aside><section class="review-detail"><div class="review-identity"><img alt=""><div><h2></h2><p></p></div><div class="review-stars" aria-label="Chọn STAR"></div></div><div class="review-stats"></div><section class="review-skill"><h3></h3><p class="skill-summary"></p><dl></dl><details><summary>So sánh 1★ / 2★ / 3★</summary><div class="tier-comparison"></div></details></section><section class="review-animation"><div class="animation-heading"><h3>Animation</h3><span class="animation-status"></span></div><div class="review-clips"></div><canvas width="640" height="440" aria-label="Preview animation nhân vật"></canvas><div class="animation-controls"><button class="play-pause">Tạm dừng</button><button class="replay">Phát lại</button><button class="facing" aria-pressed="false">Hướng: Phải</button><label>Tốc độ <select><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label></div><div class="review-frames" aria-label="Chọn frame"></div><p class="frame-label" role="status"></p></section><footer>Trang kiểm tra nội bộ, không thay đổi save hoặc thông số game. Preview chỉ phát sheet; projectile, khống chế, khiên và sát thương do Battle xử lý riêng.</footer></section></main>`;
const roleNames = { Tanker: 'Đỡ đòn', Assassin: 'Sát thủ', Ranger: 'Cung thủ', Mage: 'Pháp sư / hỗ trợ' };
const editLink = document.createElement('a');
editLink.className = 'review-edit-link';
editLink.textContent = 'Mở công cụ chỉnh animation →';
root.querySelector('.animation-heading')!.append(editLink);
const unitEditLink = document.createElement('a');
unitEditLink.className = 'review-edit-link';
unitEditLink.textContent = 'Chỉnh avatar & thông số →';
root.querySelector('.review-identity')!.append(unitEditLink);
const refreshButton = document.createElement('button');
refreshButton.textContent = 'Cập nhật từ dự án';
refreshButton.className = 'review-refresh';
refreshButton.onclick = () => void refreshReview(true);
root.querySelector('header')!.append(refreshButton);
const refreshStatus = document.createElement('p');
refreshStatus.className = 'review-refresh-status';
refreshStatus.setAttribute('role', 'status');
root.querySelector('header')!.append(refreshStatus);
const draftLabel = document.createElement('label');
draftLabel.className = 'review-draft-toggle';
const draftToggle = document.createElement('input');
draftToggle.type = 'checkbox';
draftLabel.append(draftToggle, document.createTextNode('Xem bản nháp đã chỉnh trên máy'));
root.querySelector('.review-animation')!.insertBefore(draftLabel, root.querySelector('.review-clips'));
let draft: AnimationProject | undefined, applied: AnimationProject | undefined;
draftToggle.onchange = () => loadClip();
function tierSummary(s: profile.StarLevel): string {
    const signature = signatureForBeast(id);
    return SKILL_FIELDS[signature].map(f => `${f.label}: ${skillValue(signature, s, f.key)} ${f.unit}`).join(' · ');
}
for (const beast of DECK_UNITS) {
    const button = document.createElement('button');
    button.dataset.id = beast;
    button.innerHTML = `<img src="${unitOverride(beast).avatar ?? BATTLE_CHARACTER_ART[beast].icon}" alt=""><span>${beastDisplayName(beast)}</span>`;
    button.onclick = () => { id = beast; render(); };
    root.querySelector('nav')!.append(button);
}
for (const value of [1, 2, 3] as const) {
    const button = document.createElement('button');
    button.textContent = `${value}★`;
    button.dataset.star = String(value);
    button.onclick = () => { star = value; renderStats(); };
    root.querySelector('.review-stars')!.append(button);
}
for (const value of Object.keys(clipNames) as SnowguardClip[]) {
    const button = document.createElement('button');
    button.dataset.clip = value;
    button.textContent = clipNames[value];
    button.onclick = () => { clip = value; loadClip(); };
    root.querySelector('.review-clips')!.append(button);
}
function skillValues(): [
    string,
    string
][] {
    const signature = signatureForBeast(id);
    return SKILL_FIELDS[signature].map(f => [f.label, `${skillValue(signature, star, f.key)} ${f.unit}`]);
}
function renderStats() {
    const role = roleForBeast(id), base = unitBaseStats(id, roleBaseStats(role)), multiply = profile.starStatMultiplier(star), timing = P1V11A_ACTION_TIMING_FIXTURE[role];
    root.querySelectorAll<HTMLButtonElement>('[data-star]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.star) === star)));
    root.querySelector('.review-stats')!.innerHTML = [['HP tối đa', base.hp * multiply], ['Sát thương cơ sở', base.damage * multiply], ['Nhịp đánh', `${timing.attackInterval}s`], ['Windup', `${timing.windup}s`]].map(([label, value]) => `<div><span>${label}</span><strong>${typeof value === 'number' ? Number(value.toFixed(3)) : value}</strong></div>`).join('');
    root.querySelector('.review-skill h3')!.textContent = signatureForBeast(id).replace(/([A-Z])/g, ' $1').trim();
    root.querySelector('.skill-summary')!.textContent = 'Thông số đang áp dụng trong dự án. Projectile và điều kiện kích hoạt do Battle xử lý.';
    root.querySelector('dl')!.innerHTML = skillValues().map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    root.querySelector('.tier-comparison')!.innerHTML = ([1, 2, 3] as const).map(s => `<p><b>${s}★</b> ${tierSummary(s)}</p>`).join('');
}
const canvas = root.querySelector('canvas')!, context = canvas.getContext('2d')!;
let image: HTMLImageElement | undefined, version = 0, position = 0, last = 0, playing = true, flip = false, speed = 1, frameIndex = 0, selectedPreviewFrame: number | undefined;
function render() {
    root.querySelectorAll<HTMLButtonElement>('[data-id]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    const art = BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART];
    root.querySelector<HTMLImageElement>('.review-identity img')!.src = unitOverride(id).avatar ?? art.icon!;
    unitEditLink.href = studioHref(id);
    root.querySelector('.review-identity h2')!.textContent = beastDisplayName(id);
    root.querySelector('.review-identity p')!.textContent = `${roleNames[roleForBeast(id)]} · ${recommendedRows(roleForBeast(id))} · ${id}`;
    renderStats();
    loadClip();
    void refreshReview();
}
let refreshing = false, refreshAgain = false;
export async function refreshReview(manual = false) {
    if (refreshing) {
        refreshAgain = true;
        return;
    }
    refreshing = true;
    const selectedId = id;
    refreshButton.disabled = true;
    try {
        const state = await readCharacter(selectedId);
        if (id !== selectedId)
            return;
        const changed = canonical(characterRecord(id)) !== canonical(state.record);
        updateCharacterRecord(id as CharacterId, state.record);
        root.querySelector<HTMLImageElement>('.review-identity img')!.src = unitOverride(id).avatar ?? BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART].icon!;
        root.querySelectorAll<HTMLButtonElement>('[data-id]').forEach(button => { const beast = button.dataset.id!; button.querySelector('img')!.src = unitOverride(beast).avatar ?? BATTLE_CHARACTER_ART[beast as keyof typeof BATTLE_CHARACTER_ART].icon!; });
        renderStats();
        if (changed || manual || draftToggle.checked)
            await loadClip();
        refreshStatus.textContent = 'Đang xem dữ liệu đã lưu trong dự án.';
    }
    catch (error) {
        if (manual)
            refreshStatus.textContent = (error as Error).message;
    }
    finally {
        refreshing = false;
        refreshButton.disabled = false;
        if (id !== selectedId || refreshAgain) {
            refreshAgain = false;
            void refreshReview();
        }
    }
}
async function loadClip() {
    const current = ++version;
    image = undefined;
    position = 0;
    frameIndex = 0;
    playing = true;
    selectedPreviewFrame = undefined;
    root.querySelector('.play-pause')!.textContent = 'Tạm dừng';
    const rig = rigs[id];
    editLink.href = rig ? studioHref(id, 'animation', clip) : '#';
    editLink.setAttribute('aria-disabled', String(!rig));
    editLink.hidden = !rig;
    draft = rig ? readAnimationDraft(id as EditableBeast) : undefined;
    applied = rig ? savedAnimationProject(id as EditableBeast) : undefined;
    draftToggle.disabled = !draft;
    if (!draft)
        draftToggle.checked = false;
    root.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b => { b.disabled = !rig; b.setAttribute('aria-pressed', String(b.dataset.clip === clip)); });
    root.querySelector('.animation-status')!.textContent = rig ? (draftToggle.checked ? 'Bản nháp trên máy · chưa áp dụng vào game' : 'Sheet 8 frame · bản đã lưu vào dự án') : 'Chưa có sheet · xem ảnh cutout';
    root.querySelector('.review-frames')!.replaceChildren();
    if (rig)
        for (let i = 0; i < 8; i++) {
            const button = document.createElement('button');
            button.textContent = String(i + 1);
            button.setAttribute('aria-label', `Xem frame ${i + 1}`);
            button.onclick = () => { playing = false; selectedPreviewFrame = i; position = timeForFrame((draftToggle.checked && draft ? draft : applied!).clips[clip], i) + 1e-8; root.querySelector('.play-pause')!.textContent = 'Phát'; };
            root.querySelector('.review-frames')!.append(button);
        }
    const next = new Image();
    next.src = rig ? `/assets/characters/${rig.path}/animation_v01/${clip}.png` : BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART].base!;
    try {
        await next.decode();
        if (current === version)
            image = next;
    }
    catch {
        if (current === version)
            root.querySelector('.animation-status')!.textContent = 'Không tải được ảnh; kiểm tra asset';
    }
}
root.querySelector<HTMLButtonElement>('.play-pause')!.onclick = () => { playing = !playing; root.querySelector('.play-pause')!.textContent = playing ? 'Tạm dừng' : 'Phát'; };
root.querySelector<HTMLButtonElement>('.replay')!.onclick = () => { position = 0; playing = true; selectedPreviewFrame = undefined; root.querySelector('.play-pause')!.textContent = 'Tạm dừng'; };
root.querySelector<HTMLButtonElement>('.facing')!.onclick = () => { flip = !flip; root.querySelector('.facing')!.textContent = `Hướng: ${flip ? 'Trái' : 'Phải'}`; root.querySelector('.facing')!.setAttribute('aria-pressed', String(flip)); };
root.querySelector<HTMLSelectElement>('select')!.onchange = e => { speed = Number((e.target as HTMLSelectElement).value); };
function draw(now: number) {
    const dt = last ? Math.max(0, Math.min(.1, (now - last) / 1000)) : 0;
    last = now;
    if (playing && !document.hidden)
        position += dt * speed;
    context.clearRect(0, 0, 640, 440);
    context.save();
    context.translate(320, 0);
    if (flip)
        context.scale(-1, 1);
    context.strokeStyle = '#acb59a';
    context.beginPath();
    context.moveTo(-280, 370);
    context.lineTo(280, 370);
    context.stroke();
    if (image) {
        const rig = rigs[id];
        if (rig) {
            const custom = (draftToggle.checked && draft ? draft : applied)!.clips[clip], loop = custom.loop;
            frameIndex = !playing && selectedPreviewFrame !== undefined ? selectedPreviewFrame : frameAtTime(custom, position).frame;
            context.save();
            context.translate(0, 370);
            drawRasterFrame(context, image, custom, frameIndex, 250);
            context.restore();
            const f = custom.frames[frameIndex];
            root.querySelector('.frame-label')!.textContent = `${clipNames[clip]} · Frame ${frameIndex + 1}/8 · ${loop ? 'Lặp' : 'Phát một lần, giữ cuối'} · Vùng nguồn ${f.x},${f.y} / ${f.width}×${f.height}px · Dịch ${Number(f.offsetX.toFixed(2))},${Number(f.offsetY.toFixed(2))}px`;
            root.querySelectorAll<HTMLButtonElement>('.review-frames button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === frameIndex)));
        }
        else {
            const scale = 250 / image.naturalHeight;
            context.drawImage(image, -image.naturalWidth * scale / 2, 370 - 250, image.naturalWidth * scale, 250);
            root.querySelector('.frame-label')!.textContent = 'Ảnh cutout tĩnh; chưa có sheet cho các clip. STAR không thay sheet nhân vật.';
        }
    }
    context.restore();
    requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange', () => { last = 0; if (!document.hidden)
    void refreshReview(); });
window.addEventListener('focus', () => void refreshReview());
window.addEventListener('storage', event => { if (event.key === 'beast-link-character-saved')
    void refreshReview(true);
else if (event.key === `beast-link-animation-draft-v1:${id}`) {
    if (draftToggle.checked)
        void loadClip();
    else {
        draft = rigs[id] ? readAnimationDraft(id as EditableBeast) : undefined;
        draftToggle.disabled = !draft;
    }
} });
render();
requestAnimationFrame(draw);
