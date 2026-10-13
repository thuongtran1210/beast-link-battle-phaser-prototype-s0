import './UnitEditor.css';
import { studioHref } from './studio/StudioNavigation';
import './studio/StudioShared.css';
import { StudioSavePanel } from './studio/StudioSavePanel';
import { CHARACTER_SIGNATURES, SKILL_FIELDS, type CharacterId, type Star } from '../config/CharacterSchema';
import { DECK_UNITS } from '../run/RunDeck';
import { roleForBeast } from '../battle/BeastRoles';
import { roleBaseStats } from '../battle/AutonomousBattleModel';
import { starStatMultiplier } from '../run/StarProfile';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { unitOverride, validateUnitOverride, type UnitOverride } from '../config/UnitOverrides';
const requested = new URLSearchParams(location.search).get('unit');
const id = DECK_UNITS.includes(requested as typeof DECK_UNITS[number]) ? requested! : DECK_UNITS[0];
const original = JSON.parse(JSON.stringify(unitOverride(id))) as UnitOverride;
let avatarData: string | undefined, dirty = false, saving = false;
let skills: NonNullable<UnitOverride['skills']> = JSON.parse(JSON.stringify(original.skills ?? {})), skillStar: Star = 1;
const root = document.querySelector<HTMLDivElement>('#unit-editor')!;
root.innerHTML = `<header><div><small>BEAST LINK BATTLE · CHARACTER STUDIO</small><h1>Avatar & thông số</h1><p>Chỉnh từng Beast, xem thử và lưu vào dự án.</p></div><a href="/unit-review.html?unit=${id}">← Review nhân vật</a></header><main><nav aria-label="Nhân vật"></nav><article><h2>${beastDisplayName(id)}</h2><section><h3>Avatar Grid Board</h3><div class="avatar-tools"><label class="upload">Chọn ảnh mới<input type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button class="original-avatar">Dùng avatar gốc</button></div><p>PNG / JPEG / WebP · tối đa 5 MB. Ảnh được căn giữa, giữ tỷ lệ trên canvas trong suốt 256×256.</p><div class="avatar-previews"><div><img class="large-avatar" alt="Avatar đang chỉnh"><span>Ảnh 128px</span></div><div><div class="grid-sample" aria-label="Mẫu avatar ở kích thước ô Grid"></div><span>Ô Grid 44 / 56 / 72px</span></div></div></section><section><h3>Thông số cơ sở · 1★</h3><p>Thay đổi riêng nhân vật này. 2★ và 3★ dùng hệ số STAR hiện có.</p><div class="stat-fields"><label>HP tối đa<input class="hp" type="number" min="1" max="100000" step="1"></label><label>Sát thương cơ sở<input class="damage" type="number" min="1" max="100000" step="0.1"></label></div><table><thead><tr><th>STAR</th><th>HP</th><th>Sát thương</th></tr></thead><tbody></tbody></table><p>Kỹ năng đặc trưng, nhịp đánh và thời gian khống chế vẫn theo cấu hình hiện tại.</p></section><div class="save-actions"><button class="save">Lưu vào dự án</button><button class="reset">Khôi phục mặc định</button><a class="animation">Chỉnh animation →</a></div><p class="status" role="status" aria-live="polite">Chưa thay đổi.</p><footer>Lưu trực tiếp cần server phát triển local. Cấu hình cũ được sao lưu trước mỗi lần ghi. Tải lại game để dùng avatar/thông số mới; trận đang chạy giữ nguyên trạng thái.</footer></article></main>`;
const q = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
const tabs = document.createElement('div');
tabs.className = 'character-studio-tabs';
tabs.innerHTML = `<a aria-current="page" href="${studioHref(id)}">Avatar / thông số / kỹ năng</a>${['beast-a', 'beast-c', 'beast-e'].includes(id) ? `<a href="${studioHref(id, 'animation')}">Animation / mask</a>` : ''}`;
q('article').prepend(tabs);
q('.upload').tabIndex = 0;
q('.upload').setAttribute('role', 'button');
q('.upload').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    q<HTMLInputElement>('input[type=file]').click();
} };
const base = roleBaseStats(roleForBeast(id));
q<HTMLInputElement>('.hp').value = String(original.hp ?? base.hp);
q<HTMLInputElement>('.damage').value = String(original.damage ?? base.damage);
const art = BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART];
let avatar = original.avatar;
function status(text: string, error = false) { q('.status').textContent = text; q('.status').classList.toggle('error', error); }
function preview() {
    const source = avatarData ?? avatar ?? art.icon!;
    q<HTMLImageElement>('.large-avatar').src = source;
    q('.grid-sample').replaceChildren();
    for (const size of [44, 56, 72]) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.width = cell.style.height = `${size}px`;
        const image = new Image();
        image.src = source;
        image.alt = beastDisplayName(id);
        cell.append(image);
        q('.grid-sample').append(cell);
    }
    const hp = q<HTMLInputElement>('.hp').valueAsNumber, damage = q<HTMLInputElement>('.damage').valueAsNumber;
    q('tbody').innerHTML = [1, 2, 3].map(star => { const m = starStatMultiplier(star as 1 | 2 | 3); return `<tr><td>${star}★</td><td>${Number.isFinite(hp) ? Number((hp * m).toFixed(3)) : '—'}</td><td>${Number.isFinite(damage) ? Number((damage * m).toFixed(3)) : '—'}</td></tr>`; }).join('');
}
for (const beast of DECK_UNITS) {
    const a = document.createElement('a');
    a.href = studioHref(beast);
    a.textContent = beastDisplayName(beast);
    if (beast === id)
        a.setAttribute('aria-current', 'page');
    q('nav').append(a);
}
q<HTMLAnchorElement>('.animation').href = studioHref(id, 'animation');
q<HTMLAnchorElement>('.animation').hidden = !['beast-a', 'beast-c', 'beast-e'].includes(id);
for (const key of ['hp', 'damage'])
    q<HTMLInputElement>(`.${key}`).oninput = () => { dirty = true; preview(); status('Có thay đổi chưa lưu.'); };
q<HTMLInputElement>('input[type=file]').onchange = async (event) => {
    const input = event.target as HTMLInputElement, file = input.files?.[0];
    if (!file)
        return;
    try {
        if (file.size > 5 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
            throw Error('Chọn PNG/JPEG/WebP tối đa 5 MB.');
        const bitmap = await createImageBitmap(file);
        try {
            if (bitmap.width > 8192 || bitmap.height > 8192)
                throw Error('Ảnh tối đa 8192px mỗi chiều.');
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 256;
            const ctx = canvas.getContext('2d')!, s = 256 / Math.max(bitmap.width, bitmap.height), w = bitmap.width * s, h = bitmap.height * s;
            ctx.drawImage(bitmap, (256 - w) / 2, (256 - h) / 2, w, h);
            avatarData = canvas.toDataURL('image/png');
        }
        finally {
            bitmap.close();
        }
        dirty = true;
        preview();
        status('Avatar mới chưa lưu.');
    }
    catch (error) {
        status((error as Error).message, true);
    }
    finally {
        input.value = '';
    }
};
q<HTMLButtonElement>('.original-avatar').onclick = () => { avatarData = undefined; avatar = undefined; dirty = true; preview(); status('Đã chọn avatar gốc; cần lưu để áp dụng.'); };
const skillSection = document.createElement('section');
skillSection.innerHTML = '<h3>Kỹ năng theo STAR</h3><p class="skill-rule"></p><div class="skill-stars"></div><div class="skill-editor-fields"></div>';
q('.save-actions').before(skillSection);
const signature = CHARACTER_SIGNATURES[id as CharacterId], fields = SKILL_FIELDS[signature];
skillSection.querySelector('.skill-rule')!.textContent = `${signature} · giá trị số được dùng trong Battle; điều kiện kích hoạt và chọn mục tiêu vẫn theo cơ chế hiện tại.`;
for (const star of [1, 2, 3] as Star[]) {
    const button = document.createElement('button');
    button.textContent = `${star}★`;
    button.onclick = () => { skillStar = star; renderSkills(); };
    button.dataset.skillStar = String(star);
    skillSection.querySelector('.skill-stars')!.append(button);
}
function renderSkills() {
    skillSection.querySelectorAll<HTMLButtonElement>('[data-skill-star]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.skillStar) === skillStar)));
    const host = skillSection.querySelector('.skill-editor-fields')!;
    host.replaceChildren();
    for (const f of fields) {
        const label = document.createElement('label');
        label.textContent = `${f.label} (${f.unit})`;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = String(f.min);
        input.max = String(f.max);
        input.step = String(f.step);
        input.value = String(skills[skillStar]?.[f.key] ?? f.defaults[skillStar - 1]);
        input.disabled = skillStar === 1 && ['carrotDuration', 'duckTargets', 'duckDuration'].includes(f.key);
        input.oninput = () => { skills[skillStar] ??= {}; skills[skillStar]![f.key] = input.valueAsNumber; dirty = true; status('Có thay đổi kỹ năng chưa lưu.'); };
        label.append(input);
        host.append(label);
    }
}
const saveHost = document.createElement('div');
q('.save-actions').after(saveHost);
q('.save').remove();
function adopt(unit: UnitOverride) { avatar = unit.avatar; avatarData = undefined; skills = JSON.parse(JSON.stringify(unit.skills ?? {})); q<HTMLInputElement>('.hp').value = String(unit.hp ?? base.hp); q<HTMLInputElement>('.damage').value = String(unit.damage ?? base.damage); renderSkills(); preview(); dirty = false; }
function candidate(): UnitOverride {
    const hp = q<HTMLInputElement>('.hp').valueAsNumber, damage = q<HTMLInputElement>('.damage').valueAsNumber, custom: NonNullable<UnitOverride['skills']> = {};
    for (const star of [1, 2, 3] as Star[])
        for (const [key, value] of Object.entries(skills[star] ?? {})) {
            if (value !== fields.find(f => f.key === key)!.defaults[star - 1]) {
                custom[star] ??= {};
                custom[star]![key] = value;
            }
        }
    return validateUnitOverride({ ...(hp !== base.hp ? { hp } : {}), ...(damage !== base.damage ? { damage } : {}), ...(avatar ? { avatar } : {}), ...(Object.keys(custom).length ? { skills: custom } : {}) }, id as CharacterId);
}
new StudioSavePanel(saveHost, { id: () => id, section: 'unit', value: candidate, assets: async () => avatarData ? { avatarData } : {}, assetSummary: () => avatarData ? 'Avatar mới sẽ được lưu dưới tên riêng; giữ ảnh cũ.' : undefined, loaded: state => { if (!dirty)
        adopt(state.record.unit ?? {}); }, restored: state => adopt(state.record.unit ?? {}), saved: state => adopt(state.record.unit ?? {}), notify: status, working: busy => { saving = busy; root.inert = busy; } });
q<HTMLButtonElement>('.reset').textContent = 'Đặt lại thông số mặc định';
q<HTMLButtonElement>('.reset').onclick = () => { adopt({}); dirty = true; status('Đã đặt lại avatar/thông số/kỹ năng mặc định trên form. Xem thay đổi & lưu để áp dụng.'); };
const notes = root.querySelectorAll('section p');
notes.forEach(p => { if (p.textContent?.startsWith('Kỹ năng đặc trưng'))
    p.textContent = 'Nhịp đánh giữ theo vai trò; tham số kỹ năng chỉnh riêng bên dưới.'; });
addEventListener('beforeunload', event => { if (dirty || saving) {
    event.preventDefault();
    event.returnValue = '';
} });
renderSkills();
preview();
