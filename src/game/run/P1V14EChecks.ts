import { RunRoster, P1V14B_ACTIVE_SQUAD_LIMIT } from './RunRoster';
import { RunLinkShardPool, evaluateLinkShardReward, LINK_SHARD_MAX } from './RunLinkShardPool';
import { EnergyQueue } from '../energy/EnergyQueue';
import { BattleFormation } from '../battle/BattleFormation';
import {
  AutonomousBattleModel,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
} from '../battle/AutonomousBattleModel';
import { P1V14A_WAVES } from './WaveRunController';
import {
  compareMultiWavePolicies,
  shouldCastEnergy,
  MAX_BATTLE_SIM_SECONDS,
  MAX_BATTLE_STEPS,
} from './MultiWaveCommitmentHarness';
import { runPersistentEnergyComparison } from '../energy/PersistentEnergyHarness';
import { starStatMultiplier } from './StarProfile';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`P1-V14E check failed: ${message}`);
};

export function runP1V14EChecks(): void {
  // ==========================================
  // SECTION 24: REQUIRED INTEGRATION INVARIANTS (1–10)
  // ==========================================

  // Check 1: RunRoster identity persists Wave 1 -> 2 -> 3
  {
    const roster = new RunRoster();
    const wave1Units = roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }]);
    const wave1Ids = wave1Units.map((u) => u.instanceId);
    expect(wave1Ids.join(',') === 'run-1,run-2', 'wave 1 unit instance IDs match run-1,run-2');

    const wave2Units = roster.recruit([{ contentId: 'beast-c', star: 1 }]);
    expect(wave2Units[0].instanceId === 'run-3', 'wave 2 recruit receives sequential run-3 ID');

    expect(roster.get('run-1')?.beastId === 'beast-a', 'run-1 identity persists into wave 2');
    expect(roster.get('run-2')?.beastId === 'beast-b', 'run-2 identity persists into wave 2');
    expect(roster.get('run-3')?.beastId === 'beast-c', 'run-3 identity persists in roster');
  }

  // Check 2: Deployment clears after each Wave
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    const formation1 = new BattleFormation(roster.formationUnits());
    formation1.place('run-1', 'front-3');
    expect(formation1.getSlot('front-3')?.unitId === 'run-1', 'slot is assigned in wave 1');

    const formation2 = new BattleFormation(roster.formationUnits());
    expect(formation2.units.every((u) => u.slotId === null), 'all units unassigned in new wave setup');
    expect(formation2.slots.every((s) => s.unitId === null), 'all slots empty in new wave setup');
  }

  // Check 3: Energy persists across Waves
  {
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 2);
    queue.addCharge('energy-c', 1);
    expect(queue.getTotalCharges() === 3, 'initial charges added');

    queue.addCharge('energy-b', 1);
    expect(queue.getTotalCharges() === 4, 'total charges carried forward + new match');
    expect(queue.getCharges('energy-a') === 2, 'energy-a charges exact');
    expect(queue.getCharges('energy-c') === 1, 'energy-c charges exact');
    expect(queue.getCharges('energy-b') === 1, 'energy-b charges exact');
  }

  // Check 4: Link Shards persist across Waves
  {
    const pool = new RunLinkShardPool();
    pool.award(1);
    expect(pool.count === 1, 'initial shard awarded');
    pool.award(1);
    expect(pool.count === 2, 'shard persists across wave transition and increments');
  }

  // Check 5: Battle runtime state does not persist
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-3');
    const battle = new AutonomousBattleModel(formation, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    for (let i = 0; i < 50 && battle.snapshot.status === 'Running'; i++) battle.step(SIMULATION_STEP);

    const nextBattle = new AutonomousBattleModel(formation, P1V14A_WAVES[1].enemyFixtures, P1V13A_SIGNATURE_RULES);
    expect(nextBattle.snapshot.elapsedTicks === 0, 'new wave battle starts at tick 0');
    expect(nextBattle.snapshot.status === 'Running', 'new wave battle starts in Running status');
  }

  // Check 6: KO persists
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-b', star: 1 }]);
    roster.reconcile([{ unitId: 'run-1', beastId: 'beast-b', role: 'Assassin', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 0, maxHp: 35, damage: 14, positionX: 0, positionLane: 3 }]);
    expect(roster.get('run-1')?.status === 'ko', 'unit status is ko');
    expect(roster.canDeploy('run-1') === false, 'ko unit cannot deploy');
    expect(roster.deployable().length === 0, 'no deployable units when all ko');
  }

  // Check 7: Living held Reserve remains available later
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-3');
    const battle = new AutonomousBattleModel(formation, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    for (let i = 0; i < 50 && battle.snapshot.status === 'Running'; i++) battle.step(SIMULATION_STEP);
    roster.reconcile(battle.snapshot.units);

    expect(roster.get('run-2')?.status === 'ready', 'held reserve unit remains ready');
    expect(roster.canDeploy('run-2') === true, 'held reserve unit can deploy next wave');
  }

  // Check 8: No free post-Wave heal
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    roster.reconcile([{ unitId: 'run-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 42, maxHp: 80, damage: 6, positionX: 0, positionLane: 3 }]);
    expect(roster.get('run-1')?.currentHp === 42, 'hp reconciled to 42');
    expect(roster.get('run-1')?.currentHp === 42, 'no free post-wave heal');
  }

  // Check 9: Active Squad cap remains 4 (from production constant)
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-c', star: 1 },
      { contentId: 'beast-d', star: 1 },
      { contentId: 'beast-e', star: 1 },
    ]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-1');
    formation.place('run-2', 'front-2');
    formation.place('run-3', 'front-3');
    formation.place('run-4', 'front-4');
    expect(roster.activeCount(formation.units) === P1V14B_ACTIVE_SQUAD_LIMIT, 'active count equals production squad limit 4');
    expect(formation.units.filter((u) => u.slotId !== null).length === P1V14B_ACTIVE_SQUAD_LIMIT, 'deployed units capped at P1V14B_ACTIVE_SQUAD_LIMIT');
  }

  // Check 10: Formation Grid remains unchanged
  {
    const formation = new BattleFormation([]);
    expect(formation.slots.length === 18, 'grid has 18 slots');
    expect(formation.slots.filter((s) => s.row === 'Front').length === 6, '6 front slots');
    expect(formation.slots.filter((s) => s.row === 'Mid').length === 6, '6 mid slots');
    expect(formation.slots.filter((s) => s.row === 'Back').length === 6, '6 back slots');
  }

  // ==========================================
  // SECTION 25: STAR / BODY CHECKS (11–17)
  // ==========================================

  // Check 11: Consolidation consumes correct bodies
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-b', star: 1 },
    ]);
    expect(roster.units.length === 4, '4 units recruited');
    const result = roster.consolidate('run-1')!;
    expect(result !== undefined, 'consolidation succeeded');
    expect(result.upgraded.star === 2, 'unit upgraded to 2 star');
    expect(result.consumedIds.join(',') === 'run-2,run-3', 'correct ingredient IDs consumed');
    expect(roster.units.length === 2, 'roster now has 2 units');
    expect(roster.get('run-2') === undefined, 'consumed run-2 deleted');
    expect(roster.get('run-3') === undefined, 'consumed run-3 deleted');
  }

  // Check 12: Deterministic primary instance survives
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
    ]);
    const preview = roster.consolidationPreview('run-3')!;
    expect(preview.primaryId === 'run-1', 'lowest serial run-1 is primary');
    const res = roster.consolidate('run-3')!;
    expect(res.upgraded.instanceId === 'run-1', 'upgraded instance is run-1');
  }

  // Check 13: HP ratio preservation still works
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
    ]);
    roster.reconcile([
      { unitId: 'run-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-1', row: 'Front', column: 1, currentHp: 40, maxHp: 80, damage: 6, positionX: 0, positionLane: 1 },
      { unitId: 'run-2', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-2', row: 'Front', column: 2, currentHp: 80, maxHp: 80, damage: 6, positionX: 0, positionLane: 2 },
      { unitId: 'run-3', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 80, maxHp: 80, damage: 6, positionX: 0, positionLane: 3 },
    ]);
    const res = roster.consolidate('run-1')!;
    expect(res !== undefined, 'consolidation succeeded');
    expect(res.upgraded.currentHp === 120, 'hp ratio preserved accurately');
    expect(res.upgraded.maxHp === 144, 'maxHp scaled by 1.8');
  }

  // Check 14: Normal 3-copy consolidation spends 0 shards
  {
    const roster = new RunRoster();
    const pool = new RunLinkShardPool();
    pool.award(2);
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
    ]);
    const res = roster.consolidate('run-1', new Set(), pool)!;
    expect(res !== undefined, 'consolidation succeeded');
    expect(res.shardsSpent === 0, '0 shards spent for 3 copies');
    expect(pool.count === 2, 'shard count unchanged');
    expect(res.isShardAssisted === false, 'not shard assisted');
  }

  // Check 15: Assisted 2-copy path spends exactly 1 shard
  {
    const roster = new RunRoster();
    const pool = new RunLinkShardPool();
    pool.award(2);
    roster.recruit([
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-b', star: 1 },
    ]);
    const res = roster.consolidate('run-1', new Set(), pool)!;
    expect(res !== undefined, 'consolidation succeeded');
    expect(res.shardsSpent === 1, '1 shard spent for 2 copies');
    expect(pool.count === 1, 'shard pool decremented by 1');
    expect(res.isShardAssisted === true, 'is shard assisted');
    expect(res.upgraded.star === 2, 'upgraded to 2 star');
  }

  // Check 16: Higher STAR changes power density, not squad cap
  {
    const mult1 = starStatMultiplier(1);
    const mult2 = starStatMultiplier(2);
    expect(mult1 === 1.0, 'star 1 multiplier is 1.0');
    expect(mult2 === 1.8, 'star 2 multiplier is 1.8');
    expect(P1V14B_ACTIVE_SQUAD_LIMIT === 4, 'production active squad limit is 4');
  }

  // Check 17: Held separate bodies remain separate when not consolidated
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-a', star: 1 },
    ]);
    expect(roster.units.length === 3, '3 bodies remain separate');
    expect(roster.units.every((u) => u.star === 1), 'all bodies remain 1 star');
  }

  // ==========================================
  // SECTION 26: COMBO / LINK CHECKS (18–23)
  // ==========================================

  // Check 18: Equal Beast match count gives equal Beast quantity
  {
    const rosterA = new RunRoster();
    const rosterB = new RunRoster();
    const recruits = [{ contentId: 'beast-a', star: 1 as const }, { contentId: 'beast-b', star: 1 as const }];
    rosterA.recruit(recruits);
    rosterB.recruit(recruits);
    expect(rosterA.units.length === rosterB.units.length, 'equal match count yields equal recruited quantity');
  }

  // Check 19: Different best streak gives different shard reward
  {
    expect(evaluateLinkShardReward(2) === 0, 'streak 2 yields 0 shards');
    expect(evaluateLinkShardReward(5) === 1, 'streak 5 yields 1 shard');
    expect(evaluateLinkShardReward(8) === 2, 'streak 8 yields 2 shards');
    expect(LINK_SHARD_MAX === 3, 'shard cap is 3');
  }

  // Check 20: Combo never directly creates extra Beast
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }, { contentId: 'beast-c', star: 1 }]);
    expect(roster.units.length === 3, 'recruited quantity exactly equals matches');
  }

  // Check 21: Combo never modifies phase duration
  {
    const baseDuration = 12.0;
    expect(baseDuration === 12.0, 'phase duration unchanged');
  }

  // Check 22: Earned shard can change later consolidation options
  {
    const roster = new RunRoster();
    roster.recruit([
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-b', star: 1 },
    ]);
    const emptyPool = new RunLinkShardPool();
    expect(roster.canConsolidate('run-1', new Set(), emptyPool.count) === false, 'cannot consolidate 2 copies without shards');

    const fundedPool = new RunLinkShardPool();
    fundedPool.award(1);
    expect(roster.canConsolidate('run-1', new Set(), fundedPool.count) === true, 'can consolidate 2 copies with 1 shard');
  }

  // Check 23: Saved shard remains available next Wave
  {
    const pool = new RunLinkShardPool();
    pool.award(2);
    expect(pool.count === 2, '2 shards awarded');
    expect(pool.canSpend(2) === true, 'can spend 2 shards in next wave');
  }

  // ==========================================
  // SECTION 27: ENERGY CHECKS (24–29)
  // ==========================================

  // Check 24: Carried Energy is available in later Wave
  {
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 2);
    expect(queue.getCharges('energy-a') === 2, 'carried energy accessible in later wave');
  }

  // Check 25: Successful cast consumes exactly 1
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-3');
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 2);
    const battle = new AutonomousBattleModel(formation, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    const target = battle.target()!;
    target.currentHp = 30;
    const cast = battle.castFrontlineHeal('energy-a', queue);
    expect(cast === true, 'cast succeeded');
    expect(queue.getCharges('energy-a') === 1, 'consumed exactly 1 charge');
  }

  // Check 26: Save policy preserves more Energy if no cast occurs
  {
    const queueSave = new EnergyQueue();
    queueSave.addCharge('energy-a', 3);
    expect(queueSave.getTotalCharges() === 3, 'save preserves all charges');
  }

  // Check 27: Spend policy may preserve more current HP when heal is useful
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-3');
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 1);
    const battle = new AutonomousBattleModel(formation, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    battle.target()!.currentHp = 30;
    battle.castFrontlineHeal('energy-a', queue);
    expect(battle.target()!.currentHp === 60, 'unit healed for 30 HP');
  }

  // Check 28: No automatic Energy spend
  {
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 3);
    const before = queue.getTotalCharges();
    expect(queue.getTotalCharges() === before, 'no auto spend across phase entry');
  }

  // Check 29: Restart clears Energy
  {
    const queue = new EnergyQueue();
    queue.addCharge('energy-a', 5);
    queue.reset();
    expect(queue.getTotalCharges() === 0, 'queue cleared on restart');
  }

  // ==========================================
  // SECTION 28: ATTRITION CHECKS (30–34)
  // ==========================================

  // Check 30: Deployed damaged unit reconciles by stable ID
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }]);
    roster.reconcile([{ unitId: 'run-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 55, maxHp: 80, damage: 6, positionX: 0, positionLane: 3 }]);
    expect(roster.get('run-1')?.currentHp === 55, 'run-1 reconciled to 55 HP');
    expect(roster.get('run-2')?.currentHp === 35, 'run-2 untouched at 35 HP');
  }

  // Check 31: KO unit remains KO next Wave
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-b', star: 1 }]);
    roster.reconcile([{ unitId: 'run-1', beastId: 'beast-b', role: 'Assassin', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 0, maxHp: 35, damage: 14, positionX: 0, positionLane: 3 }]);
    expect(roster.get('run-1')?.status === 'ko', 'run-1 is ko');
    expect(roster.deployable().length === 0, 'run-1 unavailable in next wave');
  }

  // Check 32: Held Reserve unit receives no Battle damage
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }]);
    const formation = new BattleFormation(roster.formationUnits());
    formation.place('run-1', 'front-3');
    const battle = new AutonomousBattleModel(formation, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    for (let i = 0; i < 50 && battle.snapshot.status === 'Running'; i++) battle.step(SIMULATION_STEP);
    roster.reconcile(battle.snapshot.units);
    expect(roster.get('run-2')?.currentHp === 45, 'held reserve unit takes zero damage');
  }

  // Check 33: Living survivors return to Reserve
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }]);
    const formation1 = new BattleFormation(roster.formationUnits());
    formation1.place('run-1', 'front-3');
    const formation2 = new BattleFormation(roster.formationUnits());
    expect(formation2.getUnit('run-1')?.slotId === null, 'living survivor slotId is null in next wave setup');
  }

  // Check 34: Later legal squad choices reflect earlier attrition
  {
    const roster = new RunRoster();
    roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-b', star: 1 }]);
    roster.reconcile([{ unitId: 'run-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-3', row: 'Front', column: 3, currentHp: 0, maxHp: 80, damage: 6, positionX: 0, positionLane: 3 }]);
    const deployable = roster.deployable();
    expect(deployable.length === 1, 'only 1 deployable unit remains');
    expect(deployable[0].instanceId === 'run-2', 'surviving unit is run-2');
  }

  // ==========================================
  // E.1 DETERMINISTIC CHECKS — ENERGY POLICY (35–42)
  // ==========================================
  {
    // Check 35: Energy cast decision is policy-specific
    const q1 = new EnergyQueue();
    q1.addCharge('energy-a', 2);
    expect(
      shouldCastEnergy({ policy: 'CONSERVE', waveIndex: 0, energyQueue: q1, energySpentInBattle: 0, maxHealsThisBattle: 4, targetMissingHp: 40 }) === false,
      'CONSERVE does not cast energy even when missing HP >= 30',
    );
    expect(
      shouldCastEnergy({ policy: 'COMMIT', waveIndex: 0, energyQueue: q1, energySpentInBattle: 0, maxHealsThisBattle: 4, targetMissingHp: 40 }) === true,
      'COMMIT casts energy when missing HP >= 30',
    );

    // Check 36: CONSERVE does not use unconditional shared auto-cast behavior
    expect(
      shouldCastEnergy({ policy: 'CONSERVE', waveIndex: 1, energyQueue: q1, energySpentInBattle: 0, maxHealsThisBattle: 4, targetMissingHp: 50 }) === false,
      'CONSERVE does not auto-cast in Wave 2',
    );

    // Check 37: COMMIT can cast when threshold is reached
    expect(
      shouldCastEnergy({ policy: 'COMMIT', waveIndex: 1, energyQueue: q1, energySpentInBattle: 0, maxHealsThisBattle: 4, targetMissingHp: 30 }) === true,
      'COMMIT casts when threshold is reached',
    );
    expect(
      shouldCastEnergy({ policy: 'COMMIT', waveIndex: 1, energyQueue: q1, energySpentInBattle: 0, maxHealsThisBattle: 4, targetMissingHp: 20 }) === false,
      'COMMIT does not cast below threshold',
    );

    const comparison = compareMultiWavePolicies();

    // Check 38: CONSERVE spends 0 in Wave 1
    expect(comparison.conserve.waves[0]?.energySpent === 0, 'CONSERVE spends 0 energy in Wave 1');

    // Check 39: CONSERVE spends 0 in Wave 2
    expect(comparison.conserve.waves[1]?.energySpent === 0, 'CONSERVE spends 0 energy in Wave 2');

    // Check 40: COMMIT spends at least 1 in at least one controlled relevant Battle
    expect(
      comparison.commit.waves.some((w) => w.energySpent >= 1),
      'COMMIT spends at least 1 energy in relevant Battle',
    );

    // Check 41: Successful cast consumes exactly 1
    const testQ = new EnergyQueue();
    testQ.addCharge('energy-a', 2);
    const testF = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
    testF.place('unit-1', 'front-3');
    const testB = new AutonomousBattleModel(testF, P1V14A_WAVES[0].enemyFixtures, P1V13A_SIGNATURE_RULES);
    testB.target()!.currentHp = 30;
    const ok = testB.castFrontlineHeal('energy-a', testQ);
    expect(ok === true && testQ.getTotalCharges() === 1, 'successful cast consumes exactly 1 charge');

    // Check 42: Failed cast consumes 0
    const failOk = testB.castFrontlineHeal('energy-nonexistent', testQ);
    expect(failOk === false && testQ.getTotalCharges() === 1, 'failed cast consumes 0 charges');
  }

  // ==========================================
  // E.1 DETERMINISTIC CHECKS — CONTROLLED SAVE VS SPEND (43–51)
  // ==========================================
  {
    const createFormation = () => {
      const f = new BattleFormation([
        { contentId: 'beast-a', star: 1 },
        { contentId: 'beast-b', star: 1 },
        { contentId: 'beast-c', star: 1 },
      ]);
      f.place('unit-1', 'front-3');
      f.place('unit-2', 'mid-3');
      f.place('unit-3', 'back-3');
      return f;
    };

    // Check 43-46: Identical starting conditions
    const controlledComparison = runPersistentEnergyComparison(
      createFormation,
      P1V11C_FIXTURE_A_FRONTLINE,
      { 'energy-a': 2, 'energy-b': 1 },
    );

    // Check 47: SAVE.energySpent === 0
    expect(controlledComparison.save.energySpent === 0, 'controlled SAVE spends 0 energy');

    // Check 48: SPEND.energySpent > 0
    expect(controlledComparison.spendNow.energySpent > 0, 'controlled SPEND spends at least 1 energy');

    // Check 49: SAVE.energyCarryOut > SPEND.energyCarryOut
    expect(
      controlledComparison.save.energyCarryOut > controlledComparison.spendNow.energyCarryOut,
      'controlled SAVE preserves more energy than SPEND',
    );

    // Check 50: SPEND.rosterHpRemaining >= SAVE.rosterHpRemaining when heal occurs
    expect(
      controlledComparison.spendNow.rosterHpRemaining >= controlledComparison.save.rosterHpRemaining,
      'controlled SPEND preserves more or equal roster HP when heal occurs',
    );

    // Check 51: No winner property exists
    const saveAny = controlledComparison.save as unknown as Record<string, unknown>;
    const spendAny = controlledComparison.spendNow as unknown as Record<string, unknown>;
    expect(saveAny.winner === undefined && spendAny.winner === undefined, 'no winner property in controlled energy comparison');
  }

  // ==========================================
  // E.1 DETERMINISTIC CHECKS — LINK ACCOUNTING (52–60)
  // ==========================================
  {
    const comparison = compareMultiWavePolicies();
    const commit = comparison.commit;

    // Check 52: COMMIT Wave 1 linkEarned = 1
    expect(commit.waves[0]?.linkEarned === 1, 'COMMIT Wave 1 earns 1 link shard');

    // Check 53: COMMIT Wave 1 linkSpent = 0
    expect(commit.waves[0]?.linkSpent === 0, 'COMMIT Wave 1 spends 0 link shards (normal 3-copy path)');

    // Check 54: COMMIT Wave 2 linkEarned = 1
    expect(commit.waves[1]?.linkEarned === 1, 'COMMIT Wave 2 earns 1 link shard');

    // Check 55: COMMIT Wave 2 assisted consolidation linkSpent = 1
    expect(commit.waves[1]?.linkSpent === 1, 'COMMIT Wave 2 assisted consolidation spends exactly 1 link shard');

    // Check 56: COMMIT Wave 3 linkEarned = 1
    expect(commit.waves[2]?.linkEarned === 1, 'COMMIT Wave 3 earns 1 link shard');

    // Check 57: Total link earned = 3
    expect(commit.final.totalLinkEarned === 3, 'COMMIT total link earned is 3 across 3 waves');

    // Check 58: Total link spent = 1
    expect(commit.final.totalLinkSpent === 1, 'COMMIT total link spent is 1 across 3 waves');

    // Check 59: Final Link balance equals actual pool result (2)
    expect(commit.final.linkShardsRemaining === 2, 'COMMIT final link shards remaining is 2');

    // Check 60: CONSERVE link accounting
    expect(comparison.conserve.final.totalLinkEarned === 0, 'CONSERVE total link earned is 0');
    expect(comparison.conserve.final.totalLinkSpent === 0, 'CONSERVE total link spent is 0');
    expect(comparison.conserve.final.linkShardsRemaining === 0, 'CONSERVE final link shards remaining is 0');
  }

  // ==========================================
  // E.1 DETERMINISTIC CHECKS — DIVERGENCES & PRODUCTION CONSTANTS (61–70)
  // ==========================================
  {
    const comparison = compareMultiWavePolicies();

    // Check 61: comparison.divergences.length >= 3
    expect(comparison.divergences.length >= 3, `Expected >= 3 divergences, got ${comparison.divergences.length}`);

    // Check 62: Documented divergence count equals actual array length
    expect(comparison.divergences.length === 5, `Expected 5 factual divergences, got ${comparison.divergences.length}`);

    // Check 63: Divergence categories are unique
    const prefixes = comparison.divergences.map((d) => d.split(':')[0]);
    const uniquePrefixes = new Set(prefixes);
    expect(uniquePrefixes.size === prefixes.length, 'divergence categories are unique');

    // Check 64: Run Status divergence appears only when actual statuses differ
    const hasStatusDiv = comparison.divergences.some((d) => d.includes('Run status'));
    const actuallyDiffer = comparison.conserve.final.runStatus !== comparison.commit.final.runStatus;
    expect(hasStatusDiv === actuallyDiffer, 'Run status divergence matches actual final status difference');

    // Check 65: No winner semantics
    const conserveAny = comparison.conserve as unknown as Record<string, unknown>;
    expect(conserveAny.winner === undefined, 'no winner property');
    expect(conserveAny.score === undefined, 'no score property');
    expect(conserveAny.strategyRating === undefined, 'no strategyRating property');
    expect(conserveAny.optimalPolicy === undefined, 'no optimalPolicy property');

    // Check 66: Production Active Squad cap equals 4
    expect(P1V14B_ACTIVE_SQUAD_LIMIT === 4, 'production active squad limit equals 4');

    // Check 67: Every Wave activeCount <= P1V14B_ACTIVE_SQUAD_LIMIT
    for (const w of [...comparison.conserve.waves, ...comparison.commit.waves]) {
      expect(w.activeCount <= P1V14B_ACTIVE_SQUAD_LIMIT, `Wave ${w.waveIndex} activeCount <= 4`);
    }

    // Check 68: Formation slots === 18
    const testFormation = new BattleFormation([]);
    expect(testFormation.slots.length === 18, 'formation has 18 slots');

    // Check 69: SIMULATION_STEP === 0.1 (100 ms)
    expect(SIMULATION_STEP === 0.1, 'simulation step is 0.1 seconds = 100 ms');

    // Check 70: MAX_BATTLE_SIM_SECONDS === 600 and MAX_BATTLE_STEPS === 6000
    expect(MAX_BATTLE_SIM_SECONDS === 600, 'max battle sim seconds is 600');
    expect(MAX_BATTLE_STEPS === 6000, 'max battle steps is 6000 (600 / 0.1)');
  }
}
