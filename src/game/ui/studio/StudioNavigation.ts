export function studioHref(id: string, tab: 'unit' | 'animation' = 'unit', clip?: string) { const query = new URLSearchParams({ unit: id, tab }); if (clip)
    query.set('clip', clip); return `/character-studio.html?${query}`; }
