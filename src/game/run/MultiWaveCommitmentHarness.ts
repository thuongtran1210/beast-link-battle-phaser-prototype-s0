import {
  AutonomousBattleModel,
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
  type EnemyFixture,
} from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { RunLinkShardPool, evaluateLinkShardReward } from './RunLinkShardPool';
import { P1V14B_ACTIVE_SQUAD_LIMIT, RunRoster, type RunUnitInstance } from './RunRoster';
import { P1V14A_WAVES, type WaveDefinition } from './WaveRunController';
import type { DeployedUnit } from '../queue/StarConverter';

export type PolicyKind = 'CONSERVE' | 'COMMIT';

/**
 * Simulation timing constants:
 * SIMULATION_STEP = 0.1 seconds = 100 ms per step.
 * MAX_BATTLE_SIM_SECONDS = 600 seconds (10 minutes) maximum horizon.
 * MAX_BATTLE_STEPS = 600 / 0.1 = 6000 steps.
 */
export const MAX_BATTLE_SIM_SECONDS = 600;
export const MAX_BATTLE_STEPS = Math.round(MAX_BATTLE_SIM_SECONDS / SIMULATION_STEP);

export interface WavePreparationFixture {
  beastMatchesById: Record<string, number>;
  bestComboStreak: number;
  energyMatchesById: Record<string, number>;
}

export interface WaveIntegrationSnapshot {
  waveIndex: number;
  waveId: string;
  threatLabel: string;

  // Preparation:
  beastMatchesById: Record<string, number>;
  beastMatchTotal: number;
  bestComboStreak: number;
  linkCarryIn: number;
  linkEarned: number;
  linkSpent: number;
  linkCarryOut: number;
  energyCarryIn: number;
  energyCollected: number;
  energySpent: number;
  energyCarryOut: number;

  // Roster before Battle:
  rosterTotal: number;
  livingCount: number;
  koCount: number;
  star1Count: number;
  star2Count: number;
  star3Count: number;
  activeCount: number;
  reserveLivingCount: number;
  totalLivingHp: number;
  deployedInstanceIds: string[];
  reserveInstanceIds: string[];

  // Battle result:
  status: 'Running' | 'Win' | 'Lose';
  battleLivingCount: number;
  battleKoCount: number;
  totalRunHp: number;
  hpByInstanceId: Record<string, number>;

  // Wave transition:
  deploymentCleared: boolean;
  energyPreserved: boolean;
  linkPreserved: boolean;
  nextWaveIndex: number | null;
}

export interface FinalTraceSummary {
  runStatus: 'Running' | 'Win' | 'Lose';
  waveReached: number;
  livingCount: number;
  koCount: number;
  energyRemaining: number;
  linkShardsRemaining: number;
  totalLinkEarned: number;
  totalLinkSpent: number;
  starDistribution: { star1: number; star2: number; star3: number };
  totalRunHp: number;
  totalRosterBodies: number;
}

export interface PolicyTraceResult {
  policy: PolicyKind;
  waves: WaveIntegrationSnapshot[];
  final: FinalTraceSummary;
}

export interface MultiWaveComparisonResult {
  conserve: PolicyTraceResult;
  commit: PolicyTraceResult;
  divergences: string[];
}

/** Standard 3-wave preparation fixtures with identical match quantities between policies. */
export const EQUIVALENT_WAVE_PREPARATIONS: Readonly<Record<number, {
  beastMatches: Record<string, number>;
  energyMatches: Record<string, number>;
  conserveStreak: number;
  commitStreak: number;
}>> = {
  0: {
    // Wave 1: 8 Beasts total, 4 Energy total
    beastMatches: { 'beast-a': 3, 'beast-b': 2, 'beast-c': 2, 'beast-d': 1 },
    energyMatches: { 'energy-a': 2, 'energy-c': 2 },
    conserveStreak: 2, // 0 Link Shards
    commitStreak: 6,   // 1 Link Shard
  },
  1: {
    // Wave 2: 6 Beasts total, 3 Energy total
    beastMatches: { 'beast-a': 1, 'beast-b': 0, 'beast-c': 2, 'beast-d': 3 },
    energyMatches: { 'energy-b': 2, 'energy-a': 1 },
    conserveStreak: 3, // 0 Link Shards
    commitStreak: 4,   // 1 Link Shard
  },
  2: {
    // Wave 3: 5 Beasts total, 3 Energy total
    beastMatches: { 'beast-a': 2, 'beast-c': 1, 'beast-d': 2 },
    energyMatches: { 'energy-a': 1, 'energy-b': 1, 'energy-c': 1 },
    conserveStreak: 2, // 0 Link Shards
    commitStreak: 5,   // 1 Link Shard
  },
};

export interface EnergyCastDecisionContext {
  policy: PolicyKind;
  waveIndex: number;
  energyQueue: EnergyQueue;
  energySpentInBattle: number;
  maxHealsThisBattle: number;
  targetMissingHp: number;
}

/**
 * Explicit policy-owned Energy cast decision.
 * CONSERVE: deliberately saves Energy across all waves (spends 0 in Waves 1 & 2).
 * COMMIT: spends Energy when frontline unit is damaged >= 30 HP.
 */
export function shouldCastEnergy(context: EnergyCastDecisionContext): boolean {
  if (context.energySpentInBattle >= context.maxHealsThisBattle) return false;
  if (context.energyQueue.getTotalCharges() <= 0) return false;

  if (context.policy === 'CONSERVE') {
    // Explicit CONSERVE policy: saves all Energy in Waves 1 & 2 for future horizon
    if (context.waveIndex === 0 || context.waveIndex === 1) {
      return false;
    }
    // In Wave 3, CONSERVE continues saving to preserve maximum run reserves
    return false;
  }

  if (context.policy === 'COMMIT') {
    // Explicit COMMIT policy: spends Energy to preserve veteran units when damaged >= 30 HP
    return context.targetMissingHp >= 30;
  }

  return false;
}

function countStars(units: RunUnitInstance[]): { star1: number; star2: number; star3: number } {
  return {
    star1: units.filter((u) => u.star === 1).length,
    star2: units.filter((u) => u.star === 2).length,
    star3: units.filter((u) => u.star === 3).length,
  };
}

/** Runs a single controlled policy across all 3 waves of the P1-V14A run. */
export function runMultiWavePolicyTrace(policy: PolicyKind): PolicyTraceResult {
  const roster = new RunRoster();
  const shardPool = new RunLinkShardPool();
  const energyQueue = new EnergyQueue();

  const waveSnapshots: WaveIntegrationSnapshot[] = [];
  let currentRunStatus: 'Running' | 'Win' | 'Lose' = 'Running';
  let waveReached = 0;
  let totalLinkEarnedAcrossRun = 0;
  let totalLinkSpentAcrossRun = 0;

  for (let waveIdx = 0; waveIdx < P1V14A_WAVES.length; waveIdx += 1) {
    waveReached = waveIdx + 1;
    const waveDef: WaveDefinition = P1V14A_WAVES[waveIdx];
    const prepConfig = EQUIVALENT_WAVE_PREPARATIONS[waveIdx];

    // 1. Preparation: Energy carry-in and collection
    const energyCarryIn = energyQueue.getTotalCharges();
    let energyCollected = 0;
    for (const [id, count] of Object.entries(prepConfig.energyMatches)) {
      energyQueue.addCharge(id, count);
      energyCollected += count;
    }

    // 2. Preparation: Link Shard carry-in and evaluation from streak
    const linkCarryIn = shardPool.count;
    const streak = policy === 'CONSERVE' ? prepConfig.conserveStreak : prepConfig.commitStreak;
    const linkEarned = evaluateLinkShardReward(streak);
    shardPool.award(linkEarned);
    totalLinkEarnedAcrossRun += linkEarned;

    // 3. Preparation: Beast matches -> separate 1★ recruitment (quantity = match count)
    const recruits: DeployedUnit[] = [];
    let beastMatchTotal = 0;
    for (const [beastId, count] of Object.entries(prepConfig.beastMatches)) {
      beastMatchTotal += count;
      for (let i = 0; i < count; i += 1) {
        recruits.push({ contentId: beastId, star: 1 });
      }
    }
    roster.recruit(recruits);

    // 4. Strategic Choice: Consolidation
    let linkSpent = 0;
    if (policy === 'COMMIT') {
      if (waveIdx === 0) {
        // Wave 1: 3 copies of beast-a available in reserve. Consolidate to 2★ (normal 3-copy, 0 shards).
        const tankCopies = roster.deployable().filter((u) => u.beastId === 'beast-a' && u.star === 1);
        if (tankCopies.length >= 3) {
          const res = roster.consolidate(tankCopies[0].instanceId, new Set(), shardPool);
          if (res) linkSpent += res.shardsSpent;
        }
      } else if (waveIdx === 1) {
        // Wave 2: exactly 2 copies of beast-b + 1 shard available in shardPool. Assisted consolidation (2 copies + 1 shard)!
        const assassinCopies = roster.deployable().filter((u) => u.beastId === 'beast-b' && u.star === 1);
        if (assassinCopies.length === 2 && shardPool.count >= 1) {
          const res = roster.consolidate(assassinCopies[0].instanceId, new Set(), shardPool);
          if (res) linkSpent += res.shardsSpent;
        }
      }
    }
    // CONSERVE: deliberately does not consolidate; keeps all bodies separate.
    totalLinkSpentAcrossRun += linkSpent;
    const linkCarryOut = shardPool.count;

    // 5. Formation & Deployment using production P1V14B_ACTIVE_SQUAD_LIMIT
    const formationUnits = roster.formationUnits();
    const formation = new BattleFormation(formationUnits);

    const deployableUnits = roster.deployable();
    const deployedIds: string[] = [];
    const reserveIds: string[] = [];

    if (policy === 'CONSERVE') {
      if (waveIdx === 0) {
        // Wave 1 Frontline Pressure: deploy dual tanks on outer lanes (front-2, front-4) + 2 assassins (mid-3, back-3)
        const tanks = deployableUnits.filter((u) => u.beastId === 'beast-a');
        const assassins = deployableUnits.filter((u) => u.beastId === 'beast-b');
        formation.place(tanks[0].instanceId, 'front-2');
        formation.place(tanks[1].instanceId, 'front-4');
        formation.place(assassins[0].instanceId, 'mid-3');
        formation.place(assassins[1].instanceId, 'back-3');
        deployedIds.push(tanks[0].instanceId, tanks[1].instanceId, assassins[0].instanceId, assassins[1].instanceId);
      } else if (waveIdx === 1) {
        // Wave 2 Backline Dive: deploy Tank at front-3, Assassins/Rangers at mid-2 & mid-4, Tank in reserve back-3
        const tanks = deployableUnits.filter((u) => u.beastId === 'beast-a');
        const assassins = deployableUnits.filter((u) => u.beastId === 'beast-b');
        const rangers = deployableUnits.filter((u) => u.beastId === 'beast-c');
        formation.place(tanks[0].instanceId, 'front-3');
        formation.place(assassins[0].instanceId, 'mid-2');
        formation.place(rangers[0].instanceId, 'mid-4');
        formation.place(tanks[1].instanceId, 'back-3');
        deployedIds.push(tanks[0].instanceId, assassins[0].instanceId, rangers[0].instanceId, tanks[1].instanceId);
      } else {
        // Wave 3 Protected Ranged: deploy 4 surviving living units
        const sorted = [...deployableUnits].sort((a, b) => b.currentHp - a.currentHp);
        const slots = ['front-3', 'mid-3', 'back-3', 'back-4'];
        sorted.slice(0, P1V14B_ACTIVE_SQUAD_LIMIT).forEach((u, i) => {
          formation.place(u.instanceId, slots[i]);
          deployedIds.push(u.instanceId);
        });
      }

      deployableUnits.forEach((u) => {
        if (!deployedIds.includes(u.instanceId)) {
          reserveIds.push(u.instanceId);
        }
      });
    } else {
      // COMMIT: Prioritizes higher-STAR units, then balanced damage roles.
      if (waveIdx === 0) {
        const sorted = [...deployableUnits].sort((a, b) => b.star - a.star);
        const slots = ['front-3', 'mid-3', 'back-3', 'back-4'];
        sorted.slice(0, P1V14B_ACTIVE_SQUAD_LIMIT).forEach((u, i) => {
          formation.place(u.instanceId, slots[i]);
          deployedIds.push(u.instanceId);
        });
      } else if (waveIdx === 1) {
        // Wave 2: Deploy 2★ Assassin (mid-3), Tank (front-3), Mages (back-3, back-4)
        const star2 = deployableUnits.filter((u) => u.star === 2);
        const tanks = deployableUnits.filter((u) => u.beastId === 'beast-a');
        const mages = deployableUnits.filter((u) => u.beastId === 'beast-d');
        const toDeploy = [...star2, ...tanks, ...mages].slice(0, P1V14B_ACTIVE_SQUAD_LIMIT);
        const slots = ['mid-3', 'front-3', 'back-3', 'back-4'];
        toDeploy.forEach((u, i) => {
          formation.place(u.instanceId, slots[i]);
          deployedIds.push(u.instanceId);
        });
      } else {
        const sorted = [...deployableUnits].sort((a, b) => b.star - a.star);
        const slots = ['front-3', 'mid-3', 'back-3', 'back-4'];
        sorted.slice(0, P1V14B_ACTIVE_SQUAD_LIMIT).forEach((u, i) => {
          formation.place(u.instanceId, slots[i]);
          deployedIds.push(u.instanceId);
        });
      }

      deployableUnits.forEach((u) => {
        if (!deployedIds.includes(u.instanceId)) {
          reserveIds.push(u.instanceId);
        }
      });
    }

    // Capture Roster State Before Battle
    const allRosterUnits = roster.units;
    const livingBefore = allRosterUnits.filter((u) => u.status === 'ready');
    const koBefore = allRosterUnits.filter((u) => u.status === 'ko');
    const starsBefore = countStars(allRosterUnits);
    const totalLivingHpBefore = livingBefore.reduce((sum, u) => sum + u.currentHp, 0);

    // 6. Battle Execution
    const battleModel = new AutonomousBattleModel(
      formation,
      waveDef.enemyFixtures,
      P1V13A_SIGNATURE_RULES,
      Object.fromEntries(allRosterUnits.map((u) => [u.instanceId, u.currentHp])),
    );

    let energySpentInBattle = 0;
    const maxHealsThisBattle = 4;
    // Step simulation: 6000 steps max (600 seconds at 0.1s/100ms per step)
    for (let step = 0; step < MAX_BATTLE_STEPS && battleModel.snapshot.status === 'Running'; step += 1) {
      const target = battleModel.target();
      const targetMissingHp = target ? target.maxHp - target.currentHp : 0;
      if (
        shouldCastEnergy({
          policy,
          waveIndex: waveIdx,
          energyQueue,
          energySpentInBattle,
          maxHealsThisBattle,
          targetMissingHp,
        })
      ) {
        const available = energyQueue.getAll().find((e) => e.charges > 0);
        if (available) {
          const success = battleModel.castFrontlineHeal(available.energyId, energyQueue);
          if (success) {
            energySpentInBattle += 1;
          }
        }
      }
      battleModel.step(SIMULATION_STEP);
    }

    const battleSnapshot = battleModel.snapshot;
    currentRunStatus = battleSnapshot.status;

    // 7. Reconcile Battle results back to RunRoster
    roster.reconcile(battleSnapshot.units);

    const allRosterUnitsAfter = roster.units;
    const livingAfter = allRosterUnitsAfter.filter((u) => u.status === 'ready');
    const koAfter = allRosterUnitsAfter.filter((u) => u.status === 'ko');
    const totalRunHpAfter = livingAfter.reduce((sum, u) => sum + u.currentHp, 0);
    const hpMap: Record<string, number> = {};
    allRosterUnitsAfter.forEach((u) => {
      hpMap[u.instanceId] = u.currentHp;
    });

    // 8. Wave Transition
    // Deployment state clears: next wave begins ACTIVE 0 / 4
    const isLastWave = waveIdx === P1V14A_WAVES.length - 1;
    const nextWaveIndex = isLastWave ? null : waveIdx + 1;

    waveSnapshots.push({
      waveIndex: waveIdx,
      waveId: waveDef.id,
      threatLabel: waveDef.threatLabel,
      beastMatchesById: { ...prepConfig.beastMatches },
      beastMatchTotal,
      bestComboStreak: streak,
      linkCarryIn,
      linkEarned,
      linkSpent,
      linkCarryOut,
      energyCarryIn,
      energyCollected,
      energySpent: energySpentInBattle,
      energyCarryOut: energyQueue.getTotalCharges(),
      rosterTotal: allRosterUnits.length,
      livingCount: livingBefore.length,
      koCount: koBefore.length,
      star1Count: starsBefore.star1,
      star2Count: starsBefore.star2,
      star3Count: starsBefore.star3,
      activeCount: deployedIds.length,
      reserveLivingCount: reserveIds.length,
      totalLivingHp: totalLivingHpBefore,
      deployedInstanceIds: [...deployedIds],
      reserveInstanceIds: [...reserveIds],
      status: battleSnapshot.status,
      battleLivingCount: livingAfter.length,
      battleKoCount: koAfter.length,
      totalRunHp: totalRunHpAfter,
      hpByInstanceId: hpMap,
      deploymentCleared: true,
      energyPreserved: true,
      linkPreserved: true,
      nextWaveIndex,
    });

    if (battleSnapshot.status === 'Lose') {
      break;
    }
  }

  const finalUnits = roster.units;
  const finalLiving = finalUnits.filter((u) => u.status === 'ready');
  const finalKo = finalUnits.filter((u) => u.status === 'ko');
  const finalStars = countStars(finalUnits);
  const finalTotalHp = finalLiving.reduce((sum, u) => sum + u.currentHp, 0);

  return {
    policy,
    waves: waveSnapshots,
    final: {
      runStatus: currentRunStatus,
      waveReached,
      livingCount: finalLiving.length,
      koCount: finalKo.length,
      energyRemaining: energyQueue.getTotalCharges(),
      linkShardsRemaining: shardPool.count,
      totalLinkEarned: totalLinkEarnedAcrossRun,
      totalLinkSpent: totalLinkSpentAcrossRun,
      starDistribution: finalStars,
      totalRunHp: finalTotalHp,
      totalRosterBodies: finalUnits.length,
    },
  };
}

/** Evaluates factual divergences between CONSERVE and COMMIT traces. */
export function compareMultiWavePolicies(): MultiWaveComparisonResult {
  const conserve = runMultiWavePolicyTrace('CONSERVE');
  const commit = runMultiWavePolicyTrace('COMMIT');

  const divergences: string[] = [];

  // Divergence 1: STAR distribution
  if (conserve.final.starDistribution.star2 !== commit.final.starDistribution.star2) {
    divergences.push(
      `STAR distribution divergence: CONSERVE has ${conserve.final.starDistribution.star2} 2★ units; COMMIT has ${commit.final.starDistribution.star2} 2★ units.`,
    );
  }

  // Divergence 2: Total RunRoster bodies (consolidation reduces body count)
  if (conserve.final.totalRosterBodies !== commit.final.totalRosterBodies) {
    divergences.push(
      `Roster body count divergence: CONSERVE retained ${conserve.final.totalRosterBodies} bodies; COMMIT consolidated into ${commit.final.totalRosterBodies} bodies.`,
    );
  }

  // Divergence 3: Energy balance
  if (conserve.final.energyRemaining !== commit.final.energyRemaining) {
    divergences.push(
      `Energy balance divergence: CONSERVE holds ${conserve.final.energyRemaining} charges; COMMIT holds ${commit.final.energyRemaining} charges.`,
    );
  }

  // Divergence 4: Link Shard balance / utilization
  if (conserve.final.linkShardsRemaining !== commit.final.linkShardsRemaining) {
    divergences.push(
      `Link Shard divergence: CONSERVE holds ${conserve.final.linkShardsRemaining} shards; COMMIT holds ${commit.final.linkShardsRemaining} shards.`,
    );
  }

  // Divergence 5: Run status (factual divergence when statuses differ)
  if (conserve.final.runStatus !== commit.final.runStatus) {
    divergences.push(
      `Run status divergence: CONSERVE ended in ${conserve.final.runStatus}; COMMIT ended in ${commit.final.runStatus}.`,
    );
  }

  return { conserve, commit, divergences };
}
