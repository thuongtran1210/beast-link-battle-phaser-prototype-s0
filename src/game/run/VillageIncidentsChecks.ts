import { rollVillageIncident, getResidentBanter, VILLAGE_INCIDENTS, type IncidentKind } from './VillageIncidents';

export function runVillageIncidentsChecks(): void {
  // Test rollVillageIncident thresholds
  const kinds: IncidentKind[] = ['anvil', 'garden', 'fishing', 'patrol'];
  for (const kind of kinds) {
    const list = VILLAGE_INCIDENTS[kind];
    if (!list || list.length === 0) {
      throw new Error(`Incident list for ${kind} must not be empty`);
    }

    // With rngSeed 0.05, it must trigger
    const triggered = rollVillageIncident(kind, false, 0.05);
    if (!triggered) {
      throw new Error(`Incident for ${kind} should trigger on low seed 0.05`);
    }
    if (!triggered.title || !triggered.dialogue || !triggered.diaryMeme) {
      throw new Error(`Incident ${triggered.id} must have complete text metadata`);
    }

    // With rngSeed 0.20 when not hungry, it must NOT trigger (threshold 0.15)
    const missed = rollVillageIncident(kind, false, 0.20);
    if (missed !== null) {
      throw new Error(`Incident for ${kind} should not trigger when rngSeed > 0.15 for well-fed beast`);
    }

    // With rngSeed 0.20 when hungry, it MUST trigger (threshold 0.35)
    const hungryTriggered = rollVillageIncident(kind, true, 0.20);
    if (!hungryTriggered) {
      throw new Error(`Incident for ${kind} should trigger when hungry with rngSeed 0.20`);
    }
  }

  // Test banter dialogues
  const sampleA = getResidentBanter('beast-a', 0);
  if (!sampleA || typeof sampleA !== 'string') {
    throw new Error('Resident banter for beast-a must return valid text');
  }

  const sampleUnknown = getResidentBanter('unknown-beast', 0.5);
  if (!sampleUnknown || typeof sampleUnknown !== 'string') {
    throw new Error('Resident banter for unknown beast must fallback to default chats');
  }

  // All checks pass
}
