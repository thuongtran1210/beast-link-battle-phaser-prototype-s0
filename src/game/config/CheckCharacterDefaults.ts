/** Check runner only: validate saved records, then test original balance/art fixtures.
 * Mutates imported in-memory JSON objects in this process; never writes project files.
 */
import saved from './CharacterProjects.json';
import legacy from './UnitOverrides.json';
import { CHARACTER_IDS, validateCharacterRecord, validateUnitConfig, validateCharacterStore, type CharacterStore } from './CharacterSchema';
const store = validateCharacterStore(saved);
for (const id of CHARACTER_IDS) {
    if (store.characters[id])
        validateCharacterRecord(store.characters[id], id);
    const old = (legacy as Record<string, unknown>)[id];
    if (old)
        validateUnitConfig(old, id);
}
for (const id of Object.keys(store.characters))
    delete store.characters[id as keyof typeof store.characters];
for (const id of Object.keys(legacy))
    delete (legacy as Record<string, unknown>)[id];
