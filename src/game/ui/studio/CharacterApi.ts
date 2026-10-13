import { canonical, type CharacterRecord } from '../../config/CharacterSchema';
export interface EditorState {
    record: CharacterRecord;
    revisions: {
        unit: string;
        animation: string;
        record: string;
    };
    history: string[];
}
export async function readCharacter(id: string): Promise<EditorState> { return request(`/__character-editor?id=${id}`); }
export async function saveCharacter(id: string, section: 'unit' | 'animation' | 'restore', value: unknown, revision: string, extra: Record<string, unknown> = {}): Promise<EditorState> { const state = await request('/__character-editor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, section, value, revision, ...extra }) }); try {
    localStorage.setItem('beast-link-character-saved', JSON.stringify({ id, at: Date.now() }));
}
catch { /* Visibility refresh remains available. */ } return state; }
async function request(url: string, init?: RequestInit): Promise<EditorState> {
    const response = await fetch(url, init);
    let result;
    try {
        result = await response.json();
    }
    catch {
        throw Error('Server local chưa hỗ trợ lưu. Chạy npm run dev rồi mở công cụ từ localhost.');
    }
    if (!response.ok)
        throw Error(result.error ?? 'Không lưu được.');
    return result;
}
export function diffSummary(before: unknown, after: unknown): string[] {
    const result: string[] = [];
    function visit(a: unknown, b: unknown, path: string) { if (canonical(a) === canonical(b))
        return; if (a && typeof a === 'object' || b && typeof b === 'object') {
        const old = a && typeof a === 'object' ? a : {}, next = b && typeof b === 'object' ? b : {};
        for (const k of new Set([...Object.keys(old), ...Object.keys(next)]))
            visit((old as Record<string, unknown>)[k], (next as Record<string, unknown>)[k], path ? `${path}.${k}` : k);
    }
    else
        result.push(`${path}: ${a ?? 'mặc định'} → ${b ?? 'mặc định'}`); }
    visit(before, after, '');
    return result;
}
