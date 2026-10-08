import {
  AutonomousBattleModel,
  LEGACY_BATTLE_COMBAT_RULES,
  P1V8_ROLE_POSITIONING_RULES,
  P1V9_AUTONOMOUS_MOVEMENT_RULES,
  P1V11A_TIMELINE_RULES,
  P1V11B_ENGAGEMENT_RULES,
  P1V11B1_ROLE_IDENTITY_RULES,
  P1V11C_ARCHETYPE_RULES,
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
  type BattleCombatRules,
  type EnemyArchetype,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import baseline from './golden/battle-golden-master.json';

/**
 * Refactor safety net (behavior-preserving guard).
 *
 * Runs a deterministic matrix of battles (rules x formations x enemies x Energy casts)
 * and fingerprints every observable output: snapshot after each step, metrics,
 * eligibility and cast results. Any behavioral drift changes a fingerprint.
 *
 * Regenerate ONLY when a gameplay change is intentional:
 *   $env:GOLDEN_UPDATE=1; node dist/checks.cjs   (prints JSON to paste into golden/battle-golden-master.json)
 */

type Star = 1 | 2 | 3;
interface UnitSpec { beast: string; star: Star; slot: string; }

const RULES: ReadonlyArray<[string, Readonly<BattleCombatRules>]> = [
  ['legacy', LEGACY_BATTLE_COMBAT_RULES],
  ['v8', P1V8_ROLE_POSITIONING_RULES],
  ['v9', P1V9_AUTONOMOUS_MOVEMENT_RULES],
  ['v11a', P1V11A_TIMELINE_RULES],
  ['v11b', P1V11B_ENGAGEMENT_RULES],
  ['v11b1', P1V11B1_ROLE_IDENTITY_RULES],
  ['v11c', P1V11C_ARCHETYPE_RULES],
  ['v13a', P1V13A_SIGNATURE_RULES],
];

const BEASTS = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f', 'beast-g', 'beast-h', 'beast-i', 'beast-j'];
const ENERGY_IDS = ['energy-a', 'energy-b', 'energy-c', 'energy-d', 'energy-e', 'energy-f'];

const FORMATIONS: ReadonlyArray<[string, UnitSpec[]]> = [
  ['solo-tank', [{ beast: 'beast-a', star: 1, slot: 'front-3' }]],
  ['classic-4', [
    { beast: 'beast-a', star: 2, slot: 'front-3' },
    { beast: 'beast-b', star: 1, slot: 'mid-2' },
    { beast: 'beast-c', star: 2, slot: 'back-3' },
    { beast: 'beast-d', star: 3, slot: 'back-4' },
  ]],
  ['dive-heavy', [
    { beast: 'beast-e', star: 3, slot: 'front-2' },
    { beast: 'beast-f', star: 2, slot: 'front-4' },
    { beast: 'beast-g', star: 1, slot: 'mid-3' },
    { beast: 'beast-h', star: 2, slot: 'back-2' },
  ]],
  ['backline-exposed', [
    { beast: 'beast-i', star: 3, slot: 'back-1' },
    { beast: 'beast-j', star: 2, slot: 'back-6' },
    { beast: 'beast-c', star: 1, slot: 'mid-5' },
  ]],
  // Every beast at every STAR, one at a time, to cover each Signature branch.
  ...BEASTS.flatMap((beast) => ([1, 2, 3] as Star[]).map((star): [string, UnitSpec[]] => [
    `${beast}-s${star}`,
    [{ beast: 'beast-a', star: 1, slot: 'front-3' }, { beast, star, slot: 'back-3' }],
  ])),
];

function enemies(kind: string): EnemyFixture[] {
  const make = (i: number, row: 'Front' | 'Mid' | 'Back', column: number, archetype: EnemyArchetype, maxHp: number, damage: number): EnemyFixture => ({
    enemyId: `enemy-${i}`, slotId: `enemy-${row.toLowerCase()}-${column}`, row, column, maxHp, damage, archetype,
  });
  switch (kind) {
    case 'mixed': return [make(1, 'Front', 2, 'Frontliner', 260, 9), make(2, 'Front', 4, 'Diver', 180, 12), make(3, 'Back', 3, 'Ranged', 140, 10)];
    case 'swarm': return [1, 2, 3, 4, 5].map((c) => make(c, 'Front', c, c % 2 ? 'Diver' : 'Frontliner', 90, 6));
    default: return [make(1, 'Front', 3, 'Frontliner', 600, 14), make(2, 'Mid', 2, 'Ranged', 200, 11)];
  }
}

function formation(units: UnitSpec[]): BattleFormation {
  const f = new BattleFormation(units.map((u) => ({ contentId: u.beast, star: u.star })));
  units.forEach((u, i) => {
    if (!f.place(`unit-${i + 1}`, u.slot)) throw new Error(`golden: cannot place ${u.beast} at ${u.slot}`);
  });
  return f;
}

function fnv1a(hash: number, text: string): number {
  let h = hash;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function runScenario(rules: Readonly<BattleCombatRules>, units: UnitSpec[], enemyKind: string, withEnergy: boolean, wounded: boolean): string {
  const persistentHp: Record<string, number> = wounded ? { 'unit-1': 12 } : {};
  const battle = new AutonomousBattleModel(formation(units), enemies(enemyKind), rules, persistentHp);
  const queue = new EnergyQueue();
  if (withEnergy) ENERGY_IDS.forEach((id) => queue.addCharge(id, 2));

  let h = fnv1a(0x811c9dc5, JSON.stringify(battle.snapshot));
  const maxSteps = rules.timeline ? 600 : 60;
  for (let i = 0; i < maxSteps && battle.snapshot.status === 'Running'; i++) {
    if (withEnergy && i % 25 === 7) {
      const id = ENERGY_IDS[(i / 25 | 0) % ENERGY_IDS.length];
      h = fnv1a(h, JSON.stringify(battle.tacticalEnergyEligibility(id, queue)));
      h = fnv1a(h, JSON.stringify(battle.castTacticalEnergy(id, queue)));
      h = fnv1a(h, JSON.stringify(queue.getAll()));
    }
    const snap = rules.timeline ? battle.step(SIMULATION_STEP) : battle.tick();
    h = fnv1a(h, JSON.stringify(snap));
  }
  h = fnv1a(h, JSON.stringify(battle.getConsequenceMetrics()));
  h = fnv1a(h, JSON.stringify(battle.getValidationMetrics()));
  h = fnv1a(h, JSON.stringify(battle.target() ?? null));
  h = fnv1a(h, JSON.stringify(battle.enemyTarget() ?? null));
  return `${battle.snapshot.status}:${h.toString(16).padStart(8, '0')}`;
}

export function computeBattleGoldenMaster(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [ruleName, rules] of RULES) {
    for (const [formName, units] of FORMATIONS) {
      for (const enemyKind of ['duel', 'mixed', 'swarm']) {
        for (const withEnergy of [false, true]) {
          for (const wounded of [false, true]) {
            const key = `${ruleName}|${formName}|${enemyKind}|${withEnergy ? 'E' : '-'}|${wounded ? 'W' : '-'}`;
            out[key] = runScenario(rules, units, enemyKind, withEnergy, wounded);
          }
        }
      }
    }
  }
  return out;
}

export function runBattleGoldenMasterChecks(): void {
  const actual = computeBattleGoldenMaster();
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  if (env?.GOLDEN_UPDATE) {
    console.log(JSON.stringify(actual, null, 2));
    return;
  }
  const expected = baseline as Record<string, string>;
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  const diffs = [...keys].filter((k) => expected[k] !== actual[k]);
  if (diffs.length) {
    const sample = diffs.slice(0, 10).map((k) => `  ${k}: expected ${expected[k]} got ${actual[k]}`).join('\n');
    throw new Error(`Battle golden master drift in ${diffs.length}/${keys.size} scenarios:\n${sample}`);
  }
}
