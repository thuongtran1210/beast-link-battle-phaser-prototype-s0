/** Pure schema shared by browser tools, runtime and local save server. */
export const CHARACTER_IDS = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f', 'beast-g', 'beast-h', 'beast-i', 'beast-j'] as const;
export const CLIP_IDS = ['idle', 'walk', 'attack', 'skill', 'hit', 'ko'] as const;
export type CharacterId = typeof CHARACTER_IDS[number];
export type ClipId = typeof CLIP_IDS[number];
export type Star = 1 | 2 | 3;
export interface Point {
    x: number;
    y: number;
}
export interface Rect extends Point {
    width: number;
    height: number;
}
export interface FrameConfig extends Rect {
    groundY: number;
    bodyHeight: number;
    groundX: number;
    scaleMultiplier: number;
    offsetX: number;
    offsetY: number;
    durationMs: number;
    keepPolygon?: Point[];
    eraseRects?: Rect[];
}
export interface ClipConfig {
    frames: FrameConfig[];
    order: number[];
    fps: number;
    loop: boolean;
    normalizeIdle: boolean;
    referenceHeight: number;
}
export interface AnimationConfig {
    version: 1;
    beastId: 'beast-a' | 'beast-c' | 'beast-e';
    sheetWidth: number;
    sheetHeight: number;
    clips: Record<ClipId, ClipConfig>;
}
export interface UnitConfig {
    hp?: number;
    damage?: number;
    avatar?: string;
    skills?: Partial<Record<Star, Record<string, number>>>;
}
export interface CharacterRecord {
    unit?: UnitConfig;
    animation?: AnimationConfig;
    atlases?: Partial<Record<ClipId, string>>;
}
export interface CharacterStore {
    version: 1;
    characters: Partial<Record<CharacterId, CharacterRecord>>;
}
export interface SkillField {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaults: readonly [
        number,
        number,
        number
    ];
}
const field = (key: string, label: string, unit: string, defaults: readonly [
    number,
    number,
    number
], min = 0, max = 10, step = .05): SkillField => ({ key, label, unit, defaults, min, max, step });
export const CHARACTER_SIGNATURES: Record<CharacterId, string> = { 'beast-a': 'GuardianBrace', 'beast-b': 'AmbushStrike', 'beast-c': 'FocusShot', 'beast-d': 'ArcaneBloom', 'beast-e': 'IronRam', 'beast-f': 'TwinVolley', 'beast-g': 'WoollyRescue', 'beast-h': 'BubbleTrap', 'beast-i': 'ToyWorkshop', 'beast-j': 'TickingBomb' };
export const SKILL_FIELDS: Record<string, SkillField[]> = {
    GuardianBrace: [field('strength', 'Khiên', 'HP', [70, 91, 116], 0, 100000, 1), field('duration', 'Thời gian khiên', 's', [2.4, 2.4, 2.4], .1, 60, .1), field('activationLimit', 'Giới hạn kích hoạt', 'lần', [1, 2, 2], 1, 20, 1), field('shareRatio', 'Chia sẻ khiên', 'tỷ lệ', [0, 0, .45], 0, 1, .05)],
    AmbushStrike: [field('strength', 'Hệ số phục kích', '× sát thương', [1.55, 1.75, 2]), field('activationLimit', 'Giới hạn kích hoạt', 'lần', [1, 2, 3], 1, 20, 1), field('chainRatio', 'Đánh nối tiếp', 'tỷ lệ', [0, 0, .65], 0, 5)],
    FocusShot: [field('strength', 'Hệ số Focus', '× sát thương', [1.5, 1.7, 1.95]), field('holdThreshold', 'Nạp Focus', 's', [1.6, 1.25, 1], .1, 60, .05), field('pierceTargets', 'Mục tiêu xuyên phụ', 'địch', [0, 0, 1], 0, 10, 1), field('pierceRatio', 'Sát thương xuyên', 'tỷ lệ', [0, 0, .55], 0, 5), field('carrotDuration', 'Thời gian nhử cà rốt', 's', [0, 1, 2], 0, 30, .1)],
    ArcaneBloom: [field('strength', 'Sát thương lan', '× sát thương', [.5, .65, .8]), field('radius', 'Bán kính Bloom', 'đơn vị model', [1.25, 1.55, 1.85], .1, 10), field('secondaryLimit', 'Mục tiêu phụ', 'địch', [2, 3, 4], 0, 10, 1), field('echoRatio', 'Echo', 'tỷ lệ', [0, 0, .35], 0, 5), field('duckTargets', 'Số địch vịt hóa', 'địch', [0, 1, 3], 0, 10, 1), field('duckDuration', 'Thời gian vịt hóa', 's', [0, 1, 1.5], 0, 30, .1)],
    IronRam: [field('strength', 'Hệ số Ram', '× sát thương', [1.3, 1.55, 1.8]), field('knockback', 'Đẩy lùi', 'đơn vị model', [.35, .55, .7], 0, 5), field('stagger', 'Gián đoạn', 's', [0, .35, .55], 0, 30), field('cleaveTargets', 'Mục tiêu lan', 'địch', [0, 0, 1], 0, 10, 1), field('cleaveRatio', 'Sát thương lan', 'tỷ lệ', [0, 0, .6], 0, 5)],
    TwinVolley: [field('strength', 'Sát thương phụ', '× sát thương', [.4, .6, .8]), field('attackThreshold', 'Nhịp Volley', 'đòn', [3, 2, 1], 1, 20, 1), field('secondaryTargets', 'Mục tiêu phụ', 'địch', [1, 1, 2], 0, 10, 1)],
    WoollyRescue: [field('strength', 'Hồi máu', 'HP', [14, 22, 28], 0, 100000, 1), field('targets', 'Đồng minh hồi máu', 'Beast', [1, 1, 2], 1, 10, 1), field('cooldown', 'Hồi chiêu', 's', [4, 3, 3], .1, 60, .1), field('shield', 'Khiên bông', 'HP', [0, 0, 18], 0, 100000, 1), field('shieldDuration', 'Thời gian khiên', 's', [2, 2, 2], .1, 60, .1)],
    BubbleTrap: [field('targets', 'Mục tiêu bong bóng', 'địch', [1, 1, 2], 1, 10, 1), field('duration', 'Thời gian bong bóng', 's', [.8, 1.2, 1.2], .1, 30, .1), field('cooldown', 'Hồi chiêu', 's', [5, 5, 5], .1, 60, .1)],
    ToyWorkshop: [field('shield', 'Khiên đồ chơi', 'HP', [20, 32, 44], 0, 100000, 1), field('targets', 'Đồng minh nhận khiên', 'Beast', [1, 1, 2], 1, 10, 1), field('duration', 'Thời gian khiên', 's', [3, 3, 3], .1, 60, .1), field('cooldown', 'Hồi chiêu', 's', [5, 5, 5], .1, 60, .1)],
    TickingBomb: [field('strength', 'Sát thương bom', '× sát thương', [1.5, 1.5, 1.5]), field('fuse', 'Ngòi bom', 's', [1.2, 1.2, 1.2], .1, 30, .1), field('targets', 'Mục tiêu bom', 'địch', [1, 2, 3], 1, 10, 1), field('radius', 'Bán kính bom', 'đơn vị model', [1.5, 1.5, 1.5], .1, 10), field('cooldown', 'Hồi chiêu', 's', [5, 5, 5], .1, 60, .1)],
};
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Cấu hình phải là object.'); return value as Record<string, unknown>; }
function keys(value: Record<string, unknown>, allowed: string[]) { if (Object.keys(value).some(k => !allowed.includes(k)))
    throw Error('Cấu hình chứa trường không hỗ trợ.'); }
function number(value: unknown, min: number, max: number, integer = false): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value)))
    throw Error(`Thông số phải ${integer ? 'là số nguyên ' : ''}từ ${min} đến ${max}.`); return value; }
export function validateUnitConfig(value: unknown, id: CharacterId): UnitConfig {
    const u = object(value);
    keys(u, ['hp', 'damage', 'avatar', 'skills']);
    for (const k of ['hp', 'damage'])
        if (u[k] !== undefined)
            number(u[k], 1, 100000);
    if (u.avatar !== undefined && (typeof u.avatar !== 'string' || !new RegExp(`^/assets/unit-custom/${id}-[a-f0-9]{16}\\.png$`).test(u.avatar)))
        throw Error('Đường dẫn avatar không hợp lệ.');
    if (u.skills !== undefined) {
        const stars = object(u.skills);
        keys(stars, ['1', '2', '3']);
        for (const [star, values] of Object.entries(stars)) {
            const params = object(values), fields = SKILL_FIELDS[CHARACTER_SIGNATURES[id]];
            keys(params, fields.map(f => f.key));
            for (const [key, val] of Object.entries(params)) {
                const f = fields.find(f => f.key === key)!;
                number(val, f.min, f.max, f.step === 1);
                if (star === '1' && ['carrotDuration', 'duckTargets', 'duckDuration'].includes(key) && val !== 0)
                    throw Error('Nhử cà rốt / vịt hóa bắt đầu từ 2★.');
            }
        }
    }
    return JSON.parse(JSON.stringify(u));
}
export function validateAnimationConfig(value: unknown): AnimationConfig {
    const p = object(value);
    keys(p, ['version', 'beastId', 'sheetWidth', 'sheetHeight', 'clips']);
    if (p.version !== 1 || !['beast-a', 'beast-c', 'beast-e'].includes(String(p.beastId)) || p.sheetWidth !== 1774 || p.sheetHeight !== 887)
        throw Error('Sai phiên bản, rig hoặc kích thước sheet.');
    const clips = object(p.clips);
    keys(clips, [...CLIP_IDS]);
    for (const key of CLIP_IDS) {
        const c = object(clips[key]);
        keys(c, ['frames', 'order', 'fps', 'loop', 'normalizeIdle', 'referenceHeight']);
        number(c.fps, 1, 60);
        number(c.referenceHeight, 1, 887);
        if (typeof c.loop !== 'boolean' || typeof c.normalizeIdle !== 'boolean' || !Array.isArray(c.frames) || c.frames.length !== 8 || !Array.isArray(c.order) || c.order.length !== 8 || new Set(c.order).size !== 8)
            throw Error(`${key}: cần 8 frame và thứ tự hợp lệ.`);
        c.order.forEach(i => number(i, 0, 7, true));
        for (const raw of c.frames) {
            const f = object(raw);
            keys(f, ['x', 'y', 'width', 'height', 'groundX', 'groundY', 'bodyHeight', 'scaleMultiplier', 'offsetX', 'offsetY', 'durationMs', 'keepPolygon', 'eraseRects']);
            const x = number(f.x, 0, 1773, true), y = number(f.y, 0, 886, true), w = number(f.width, 1, 1774, true), h = number(f.height, 1, 887, true);
            if (x + w > 1774 || y + h > 887)
                throw Error('Vùng cắt vượt sheet.');
            number(f.groundX, 0, w);
            number(f.groundY, 0, h);
            number(f.bodyHeight, 1, 887);
            number(f.scaleMultiplier, .1, 5);
            number(f.offsetX, -887, 887);
            number(f.offsetY, -887, 887);
            number(f.durationMs, 10, 5000);
            if (f.keepPolygon !== undefined) {
                if (!Array.isArray(f.keepPolygon) || f.keepPolygon.length < 3 || f.keepPolygon.length > 100)
                    throw Error('Mask cần 3–100 điểm.');
                for (const point of f.keepPolygon) {
                    const p = object(point);
                    keys(p, ['x', 'y']);
                    number(p.x, 0, 1774);
                    number(p.y, 0, 887);
                }
            }
            if (f.eraseRects !== undefined) {
                if (!Array.isArray(f.eraseRects) || f.eraseRects.length > 100)
                    throw Error('Tối đa 100 vùng loại bỏ.');
                for (const raw of f.eraseRects) {
                    const r = object(raw);
                    keys(r, ['x', 'y', 'width', 'height']);
                    const x = number(r.x, 0, 1774), y = number(r.y, 0, 887), w = number(r.width, 1, 1774), h = number(r.height, 1, 887);
                    if (x + w > 1774 || y + h > 887)
                        throw Error('Mask vượt sheet.');
                }
            }
        }
    }
    return JSON.parse(JSON.stringify(p));
}
export function validateCharacterRecord(value: unknown, id: CharacterId): CharacterRecord {
    const r = object(value);
    keys(r, ['unit', 'animation', 'atlases']);
    if (r.unit !== undefined)
        validateUnitConfig(r.unit, id);
    if (r.animation !== undefined && validateAnimationConfig(r.animation).beastId !== id)
        throw Error('Animation thuộc Beast khác.');
    if (r.atlases !== undefined) {
        const a = object(r.atlases);
        keys(a, [...CLIP_IDS]);
        for (const [clip, path] of Object.entries(a))
            if (typeof path !== 'string' || !new RegExp(`^/assets/character-custom/${id}-${clip}-[a-f0-9]{16}\\.png$`).test(path))
                throw Error('Atlas không hợp lệ.');
    }
    return JSON.parse(JSON.stringify(r));
}
export function canonical(value: unknown): string {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(',')}]`;
    if (value && typeof value === 'object')
        return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${JSON.stringify(key)}:${canonical(val)}`).join(',')}}`;
    return JSON.stringify(value) ?? 'null';
}
export function validateCharacterStore(value:unknown):CharacterStore{
    const store=object(value);keys(store,['version','characters']);
    if(store.version!==1)throw Error('Phiên bản Character Studio không hỗ trợ.');
    const characters=object(store.characters);keys(characters,[...CHARACTER_IDS]);
    for(const [id,record] of Object.entries(characters))validateCharacterRecord(record,id as CharacterId);
    return value as CharacterStore;
}
