import {
  AutonomousBattleModel,
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
  type EnemyFixture,
} from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { RunLinkShardPool, evaluateLinkShardReward } from './RunLinkShardPool';
import { RunRoster, type RunUnitInstance } from './RunRoster';
import { P1V14A_WAVES, type WaveDefinition } from './WaveRunController';
import type { DeployedUnit } from '../queue/StarConverter';

export type PolicyKind = 'CONSERVE' | 'COMMIT';

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
  energyCarryIn: number;
  energyCollected: number;

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
  energySpent: number;
  energyCarryOut: number;
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
    beastMatches: { 'beast-b': 2, 'beast-c': 2, 'beast-d': 2 },
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
        // Wave 2: 2 copies of beast-b + 1 shard available in shardPool. Assisted consolidation (2 copies + 1 shard)!
        const assassinCopies = roster.deployable().filter((u) => u.beastId === 'beast-b' && u.star === 1);
        if (assassinCopies.length >= 2 && shardPool.count >= 1) {
          const res = roster.consolidate(assassinCopies[0].instanceId, new Set(), shardPool);
          if (res) linkSpent += res.shardsSpent;
        }
      }
    }
    // CONSERVE: deliberately does not consolidate; keeps all bodies separate.

    // 5. Formation & Deployment
    // Create BattleFormation from current roster units (max 4 active deployed units).
    const formationUnits = roster.formationUnits();
    const formation = new BattleFormation(formationUnits);

    const deployableUnits = roster.deployable();
    const deployedIds: string[] = [];
    const reserveIds: string[] = [];

    if (policy === 'CONSERVE') {
      // CONSERVE: Holds at least one unit in Reserve (e.g. 2 units in reserve in Wave 1).
      const sortedByHp = [...deployableUnits].sort((a, b) => b.currentHp - a.currentHp);
      const tanks = sortedByHp.filter((u) => u.beastId === 'beast-a' || u.beastId === 'beast-e');
      const assassins = sortedByHp.filter((u) => u.beastId === 'beast-b');
      const rangers = sortedByHp.filter((u) => u.beastId === 'beast-c');
      const mages = sortedByHp.filter((u) => u.beastId === 'beast-d');

      const selectedToDeploy: RunUnitInstance[] = [];
      if (tanks[0]) selectedToDeploy.push(tanks[0]);
      if (assassins[0]) selectedToDeploy.push(assassins[0]);
      if (rangers[0]) selectedToDeploy.push(rangers[0]);
      if (mages[0]) selectedToDeploy.push(mages[0]);
      else if (assassins[1]) selectedToDeploy.push(assassins[1]);
      else if (tanks[1]) selectedToDeploy.push(tanks[1]);

      // Fallback if role filter yields < 4
      for (const u of deployableUnits) {
        if (selectedToDeploy.length >= 4) break;
        if (!selectedToDeploy.some((s) => s.instanceId === u.instanceId)) {
          selectedToDeploy.push(u);
        }
      }

      // Assign role-appropriate slots with lane coverage (primary tank in column 3)
      let frontCols = [3, 2, 4, 1];
      let midCols = [3, 2, 4, 1];
      let backCols = [3, 4, 2, 1];
      let fIdx = 0;
      let mIdx = 0;
      let bIdx = 0;
      selectedToDeploy.slice(0, 4).forEach((unit) => {
        let slot = 'mid-3';
        if (unit.beastId === 'beast-a' || unit.beastId === 'beast-e') {
          slot = `front-${frontCols[fIdx++]}`;
        } else if (unit.beastId === 'beast-b') {
          slot = `mid-${midCols[mIdx++]}`;
        } else {
          slot = `back-${backCols[bIdx++]}`;
        }
        if (formation.place(unit.instanceId, slot)) {
          deployedIds.push(unit.instanceId);
        }
      });

      deployableUnits.forEach((u) => {
        if (!deployedIds.includes(u.instanceId)) {
          reserveIds.push(u.instanceId);
        }
      });
    } else {
      // COMMIT: Prioritizes higher-STAR units, then balanced damage roles.
      const sortedDeployable = [...deployableUnits].sort((a, b) => b.star - a.star);
      const tanks = sortedDeployable.filter((u) => u.beastId === 'beast-a' || u.beastId === 'beast-e');
      const assassins = sortedDeployable.filter((u) => u.beastId === 'beast-b');
      const rangers = sortedDeployable.filter((u) => u.beastId === 'beast-c');
      const mages = sortedDeployable.filter((u) => u.beastId === 'beast-d');

      const toDeploy: RunUnitInstance[] = [];
      if (tanks[0]) toDeploy.push(tanks[0]);
      if (assassins[0]) toDeploy.push(assassins[0]);
      if (rangers[0]) toDeploy.push(rangers[0]);
      if (mages[0]) toDeploy.push(mages[0]);

      for (const u of sortedDeployable) {
        if (toDeploy.length >= 4) break;
        if (!toDeploy.some((s) => s.instanceId === u.instanceId)) {
          toDeploy.push(u);
        }
      }

      let frontCol = 3;
      let midCol = 3;
      let backCol = 3;
      toDeploy.forEach((unit) => {
        let slot = 'mid-3';
        if (unit.beastId === 'beast-a' || unit.beastId === 'beast-e') {
          slot = `front-${frontCol++}`;
        } else if (unit.beastId === 'beast-b') {
          slot = `mid-${midCol++}`;
        } else {
          slot = `back-${backCol++}`;
        }
        if (formation.place(unit.instanceId, slot)) {
          deployedIds.push(unit.instanceId);
        }
      });

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
    // Step simulation: 6000 steps max (60 seconds)
    for (let step = 0; step < 6000 && battleModel.snapshot.status === 'Running'; step += 1) {
      if (energySpentInBattle < maxHealsThisBattle && energyQueue.getTotalCharges() > 0) {
        // Cast frontline heal when frontline takes damage >= 30
        const target = battleModel.target();
        if (target && target.maxHp - target.currentHp >= 30) {
          const available = energyQueue.getAll().find((e) => e.charges > 0);
          if (available) {
            const success = battleModel.castFrontlineHeal(available.energyId, energyQueue);
            if (success) {
              energySpentInBattle += 1;
            }
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
      energyCarryIn,
      energyCollected,
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
      energySpent: energySpentInBattle,
      energyCarryOut: energyQueue.getTotalCharges(),
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
      `Energy balance divergence: CONSERVE preserved ${conserve.final.energyRemaining} charges; COMMIT spent Energy and holds ${commit.final.energyRemaining} charges.`,
    );
  }

  // Divergence 4: Link Shard balance / utilization
  if (conserve.final.linkShardsRemaining !== commit.final.linkShardsRemaining) {
    divergences.push(
      `Link Shard divergence: CONSERVE ended with ${conserve.final.linkShardsRemaining} shards; COMMIT ended with ${commit.final.linkShardsRemaining} shards.`,
    );
  }

  // Divergence 5: Active squad count
  const wave1ConserveActive = conserve.waves[0]?.activeCount;
  const wave1CommitActive = commit.waves[0]?.activeCount;
  if (wave1ConserveActive !== wave1CommitActive) {
    divergences.push(
      `Active squad deployment divergence in Wave 1: CONSERVE deployed ${wave1ConserveActive} units (held reserve); COMMIT deployed ${wave1CommitActive} units.`,
    );
  }

  return { conserve, commit, divergences };
}
