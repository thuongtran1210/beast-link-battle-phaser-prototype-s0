import saved from './CharacterProjects.json';
import legacy from './UnitOverrides.json';
import { CHARACTER_IDS, CHARACTER_SIGNATURES, SKILL_FIELDS, validateCharacterRecord, validateCharacterStore, type CharacterId, type CharacterRecord, type CharacterStore, type Star } from './CharacterSchema';
const store = validateCharacterStore(saved);
export function characterRecord(id: string): Readonly<CharacterRecord> {
    if (!CHARACTER_IDS.includes(id as CharacterId))
        return {};
    const record = store.characters[id as CharacterId];
    return record ?? { unit: (legacy as Record<string, CharacterRecord['unit']>)[id] ?? {} };
}
export function skillValue(signature: string, star: Star, key: string, fallback?: number): number {
    const id = CHARACTER_IDS.find(id => CHARACTER_SIGNATURES[id] === signature);
    const field = SKILL_FIELDS[signature]?.find(f => f.key === key);
    return (id ? characterRecord(id).unit?.skills?.[star]?.[key] : undefined) ?? field?.defaults[star - 1] ?? fallback ?? 0;
}
/** Refresh review memory from the local API; never changes a running Battle state. */
export function updateCharacterRecord(id: CharacterId, record: CharacterRecord) { store.characters[id] = validateCharacterRecord(record, id); }
