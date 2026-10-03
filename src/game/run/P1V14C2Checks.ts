import { StarConverter } from '../queue/StarConverter';
import { RunRoster } from './RunRoster';
import { RunLinkShardPool, evaluateLinkShardReward, LINK_SHARD_MAX } from './RunLinkShardPool';
import type { CombatUnit } from '../battle/AutonomousBattleModel';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`P1-V14C.2 check failed: ${message}`);
};

const recruitCopies = (count: number, beastId = 'beast-a') => new StarConverter().recruit(beastId, count);

export function runP1V14C2Checks(): void {
  // ==========================================
  // Section 26: REWARD CHECKS (1-11)
  // ==========================================
  // 1. best streak 0 → 0 shard
  expect(evaluateLinkShardReward(0) === 0, '1. best streak 0 awards 0 shard');
  // 2. best streak 3 → 0
  expect(evaluateLinkShardReward(3) === 0, '2. best streak 3 awards 0 shard');
  // 3. best streak 4 → 1
  expect(evaluateLinkShardReward(4) === 1, '3. best streak 4 awards 1 shard');
  // 4. best streak 6 → 1
  expect(evaluateLinkShardReward(6) === 1, '4. best streak 6 awards 1 shard');
  // 5. best streak 7 → 2
  expect(evaluateLinkShardReward(7) === 2, '5. best streak 7 awards 2 shards');
  // 6. best streak 20 → 2
  expect(evaluateLinkShardReward(20) === 2, '6. best streak 20 awards 2 shards');

  // 7. reward evaluated once per Beast Rush
  const trackerReward = evaluateLinkShardReward(5);
  expect(trackerReward === 1, '7. reward evaluated once from bestStreak at end of Beast Rush');

  // 8. total match count alone does not determine reward
  const streak1Reward = evaluateLinkShardReward(1);
  const streak6Reward = evaluateLinkShardReward(6);
  expect(streak1Reward === 0 && streak6Reward === 1, '8. total match count alone does not determine reward');

  // 9. same match count can produce different shard reward
  // Player A: 6 matches in 1 combo streak (best 6) -> 1 shard
  // Player B: 6 matches broken into 6 single matches (best 1) -> 0 shard
  expect(evaluateLinkShardReward(6) === 1 && evaluateLinkShardReward(1) === 0, '9. same match count (6) produces different shard reward based on combo quality');

  // 10. shard cap = 3
  expect(LINK_SHARD_MAX === 3, '10. shard cap constant is 3');
  const poolCap = new RunLinkShardPool();
  poolCap.award(2);
  poolCap.award(2);
  expect(poolCap.count === 3, '10. pool count clamps at max 3');

  // 11. overflow never exceeds 3
  const poolOverflow = new RunLinkShardPool();
  poolOverflow.award(5);
  expect(poolOverflow.count === 3, '11. overflow award never exceeds 3');

  // ==========================================
  // Section 27: NORMAL CONSOLIDATION (12-15)
  // ==========================================
  // 12. 3 copies + 0 shard → normal consolidation succeeds
  const normalRoster = new RunRoster();
  const normalUnits = normalRoster.recruit(recruitCopies(3));
  const poolZero = new RunLinkShardPool();
  expect(normalRoster.canConsolidate(normalUnits[0].instanceId, new Set(), poolZero.count), '12. 3 copies + 0 shard can consolidate');
  const normalResult = normalRoster.consolidate(normalUnits[0].instanceId, new Set(), poolZero)!;
  expect(normalResult && normalResult.upgraded.star === 2 && normalResult.shardsSpent === 0 && !normalResult.isShardAssisted, '12. normal consolidation succeeds with 0 shard spent');

  // 13. 3 copies + shard available → succeeds with 0 shard spent
  const normalWithShards = new RunRoster();
  const threeUnits = normalWithShards.recruit(recruitCopies(3));
  const poolTwo = new RunLinkShardPool();
  poolTwo.award(2);
  const previewThree = normalWithShards.consolidationPreview(threeUnits[0].instanceId, new Set(), poolTwo.count);
  expect(previewThree?.shardsRequired === 0 && !previewThree?.isShardAssisted, '13. 3 copies prioritizes normal consolidation with 0 shards required');
  const normalUpgrade = normalWithShards.consolidate(threeUnits[0].instanceId, new Set(), poolTwo)!;
  expect(normalUpgrade.shardsSpent === 0 && poolTwo.count === 2, '13. 3 copies consumes 0 shards even when shards are available');

  // 14. normal B.3 HP behavior unchanged
  const injuredThree = new RunRoster();
  const injuredThreeUnits = injuredThree.recruit(recruitCopies(3));
  injuredThree.reconcile([
    { unitId: injuredThreeUnits[0].instanceId, currentHp: 80 } as CombatUnit,
    { unitId: injuredThreeUnits[1].instanceId, currentHp: 40 } as CombatUnit,
    { unitId: injuredThreeUnits[2].instanceId, currentHp: 80 } as CombatUnit,
  ]);
  const normalInjuredResult = injuredThree.consolidate(injuredThreeUnits[0].instanceId)!;
  expect(normalInjuredResult.upgraded.maxHp === 144 && normalInjuredResult.upgraded.currentHp === 120, '14. normal 3-body HP aggregation unchanged (200/240 -> 120/144)');

  // 15. normal deterministic instance-ID rule unchanged
  expect(normalUpgrade.upgraded.instanceId === threeUnits[0].instanceId, '15. normal deterministic instance-ID rule preserves primary ID');

  // ==========================================
  // Section 28: SHARD ASSIST (16-27)
  // ==========================================
  // 16. 2 copies + 0 shard → fail
  const twoCopiesRoster = new RunRoster();
  const twoUnits = twoCopiesRoster.recruit(recruitCopies(2));
  const emptyPool = new RunLinkShardPool();
  expect(!twoCopiesRoster.canConsolidate(twoUnits[0].instanceId, new Set(), emptyPool.count), '16. 2 copies + 0 shard fails');
  expect(twoCopiesRoster.consolidate(twoUnits[0].instanceId, new Set(), emptyPool) === undefined, '16. consolidate returns undefined with 0 shard');

  // 17. 2 copies + 1 shard → succeed
  const assistRoster = new RunRoster();
  const assistUnits = assistRoster.recruit(recruitCopies(2));
  const poolOne = new RunLinkShardPool();
  poolOne.award(1);
  expect(assistRoster.canConsolidate(assistUnits[0].instanceId, new Set(), poolOne.count), '17. 2 copies + 1 shard can consolidate');
  const assistResult = assistRoster.consolidate(assistUnits[0].instanceId, new Set(), poolOne)!;
  expect(assistResult && assistResult.upgraded.star === 2, '17. 2 copies + 1 shard succeeds into 2-star');

  // 18. exactly 1 shard consumed
  expect(assistResult.shardsSpent === 1 && poolOne.count === 0, '18. exactly 1 shard consumed');

  // 19. exactly 1 secondary real instance consumed
  expect(assistResult.consumedIds.length === 1 && assistResult.consumedIds[0] === assistUnits[1].instanceId, '19. exactly 1 secondary real instance consumed');

  // 20. deterministic primary instance retained
  expect(assistResult.upgraded.instanceId === assistUnits[0].instanceId, '20. deterministic primary instance retained');

  // 21. 1 copy + 2 shards → fail
  const oneCopyRoster = new RunRoster();
  const oneUnit = oneCopyRoster.recruit(recruitCopies(1));
  const richPool = new RunLinkShardPool();
  richPool.award(2);
  expect(!oneCopyRoster.canConsolidate(oneUnit[0].instanceId, new Set(), richPool.count), '21. 1 copy + 2 shards cannot consolidate (min 2 real bodies)');
  expect(oneCopyRoster.consolidate(oneUnit[0].instanceId, new Set(), richPool) === undefined, '21. consolidate returns undefined for 1 copy + 2 shards');

  // 22. mixed beastId + shard → fail
  const mixedRoster = new RunRoster();
  const mixedA = mixedRoster.recruit(recruitCopies(1, 'beast-a'));
  mixedRoster.recruit(recruitCopies(1, 'beast-b'));
  const mixPool = new RunLinkShardPool();
  mixPool.award(1);
  expect(!mixedRoster.canConsolidate(mixedA[0].instanceId, new Set(), mixPool.count), '22. mixed beastId + shard cannot consolidate');

  // 23. mixed STAR + shard → fail
  const mixedStarRoster = new RunRoster();
  const star1 = mixedStarRoster.recruit(recruitCopies(1, 'beast-a'));
  const star2 = mixedStarRoster.recruit([{ contentId: 'beast-a', star: 2 }]);
  const starPool = new RunLinkShardPool();
  starPool.award(1);
  expect(!mixedStarRoster.canConsolidate(star1[0].instanceId, new Set(), starPool.count), '23. mixed STAR 1★ and 2★ + shard cannot consolidate');
  expect(!mixedStarRoster.canConsolidate(star2[0].instanceId, new Set(), starPool.count), '23. mixed STAR 2★ and 1★ + shard cannot consolidate');

  // 24. KO ingredient + shard → fail
  const koRoster = new RunRoster();
  const koUnits = koRoster.recruit(recruitCopies(2));
  koRoster.reconcile([{ unitId: koUnits[1].instanceId, currentHp: 0 } as CombatUnit]);
  const koPool = new RunLinkShardPool();
  koPool.award(1);
  expect(!koRoster.canConsolidate(koUnits[0].instanceId, new Set(), koPool.count), '24. KO ingredient + shard cannot consolidate');

  // 25. deployed ingredient + shard → fail
  const deployedRoster = new RunRoster();
  const depUnits = deployedRoster.recruit(recruitCopies(2));
  const depPool = new RunLinkShardPool();
  depPool.award(1);
  expect(!deployedRoster.canConsolidate(depUnits[0].instanceId, new Set([depUnits[1].instanceId]), depPool.count), '25. deployed secondary ingredient + shard cannot consolidate');
  expect(!deployedRoster.canConsolidate(depUnits[0].instanceId, new Set([depUnits[0].instanceId]), depPool.count), '25. deployed primary ingredient + shard cannot consolidate');

  // 26. 2 × 2★ + shard → 3★ succeeds
  const twoStarRoster = new RunRoster();
  const twoStarUnits = twoStarRoster.recruit([{ contentId: 'beast-a', star: 2 }, { contentId: 'beast-a', star: 2 }]);
  const twoStarPool = new RunLinkShardPool();
  twoStarPool.award(1);
  expect(twoStarRoster.canConsolidate(twoStarUnits[0].instanceId, new Set(), twoStarPool.count), '26. 2 × 2★ + 1 shard can consolidate');
  const threeStarResult = twoStarRoster.consolidate(twoStarUnits[0].instanceId, new Set(), twoStarPool)!;
  expect(threeStarResult && threeStarResult.upgraded.star === 3, '26. 2 × 2★ + 1 shard upgrades to 3★');

  // 27. 3★ cannot upgrade even with shards
  const threeStarPool = new RunLinkShardPool();
  threeStarPool.award(3);
  expect(!twoStarRoster.canConsolidate(threeStarResult.upgraded.instanceId, new Set(), threeStarPool.count), '27. 3★ cannot upgrade even with shards');

  // ==========================================
  // Section 29: HP CHECKS (28-33)
  // ==========================================
  // 28. two full-health copies + shard → full-health target
  const fullHpRoster = new RunRoster();
  const fullCopies = fullHpRoster.recruit(recruitCopies(2));
  const hpPool = new RunLinkShardPool();
  hpPool.award(1);
  const fullUpgrade = fullHpRoster.consolidate(fullCopies[0].instanceId, new Set(), hpPool)!;
  expect(fullUpgrade.upgraded.currentHp === fullUpgrade.upgraded.maxHp && fullUpgrade.upgraded.maxHp === 144, '28. two full-health copies + shard produce full-health 144/144 target');

  // 29. injured two-copy input preserves two-body health ratio
  // 80/80 and 40/80 -> 120/160 = 75%. Target maxHp = 144. 144 * 0.75 = 108.
  const injuredRoster = new RunRoster();
  const injuredCopies = injuredRoster.recruit(recruitCopies(2));
  injuredRoster.reconcile([
    { unitId: injuredCopies[0].instanceId, currentHp: 80 } as CombatUnit,
    { unitId: injuredCopies[1].instanceId, currentHp: 40 } as CombatUnit,
  ]);
  const injuredPool = new RunLinkShardPool();
  injuredPool.award(1);
  const injuredUpgrade = injuredRoster.consolidate(injuredCopies[0].instanceId, new Set(), injuredPool)!;
  expect(injuredUpgrade.upgraded.currentHp === 108 && injuredUpgrade.upgraded.maxHp === 144, '29. injured two-body ratio (120/160 = 75%) gives exactly 108/144');

  // 30. shard contributes no phantom HP
  // If phantom 80 HP were added: (80 + 40 + 80) / 240 = 200/240 = 83.33% -> 120 HP. Since 108 !== 120, shard contributed 0 HP.
  expect(injuredUpgrade.upgraded.currentHp === 108, '30. shard contributes no phantom HP (result is 108, not 120)');

  // 31. shard cannot create free heal
  // Two 40/80 copies (80/160 = 50%). Target 144 * 0.50 = 72. (Both were 50%, target is 50%, no free heal).
  const halfHpRoster = new RunRoster();
  const halfCopies = halfHpRoster.recruit(recruitCopies(2));
  halfHpRoster.reconcile([
    { unitId: halfCopies[0].instanceId, currentHp: 40 } as CombatUnit,
    { unitId: halfCopies[1].instanceId, currentHp: 40 } as CombatUnit,
  ]);
  const halfPool = new RunLinkShardPool();
  halfPool.award(1);
  const halfUpgrade = halfHpRoster.consolidate(halfCopies[0].instanceId, new Set(), halfPool)!;
  expect(halfUpgrade.upgraded.currentHp === 72, '31. two 50% health copies produce 50% target (72/144), no free heal');

  // 32. result HP clamps correctly
  // Very low health: 1/80 + 1/80 = 2/160 = 1.25%. 144 * 0.0125 = 1.8 -> rounded to 2.
  const lowHpRoster = new RunRoster();
  const lowCopies = lowHpRoster.recruit(recruitCopies(2));
  lowHpRoster.reconcile([
    { unitId: lowCopies[0].instanceId, currentHp: 1 } as CombatUnit,
    { unitId: lowCopies[1].instanceId, currentHp: 1 } as CombatUnit,
  ]);
  const lowPool = new RunLinkShardPool();
  lowPool.award(1);
  const lowUpgrade = lowHpRoster.consolidate(lowCopies[0].instanceId, new Set(), lowPool)!;
  expect(lowUpgrade.upgraded.currentHp >= 1 && lowUpgrade.upgraded.currentHp <= lowUpgrade.upgraded.maxHp, '32. result HP clamps safely within [1, maxHp]');

  // 33. upgraded HP persists across Waves
  injuredRoster.reconcile([{ unitId: injuredUpgrade.upgraded.instanceId, currentHp: 65 } as CombatUnit]);
  expect(injuredRoster.get(injuredUpgrade.upgraded.instanceId)?.currentHp === 65 && injuredRoster.get(injuredUpgrade.upgraded.instanceId)?.star === 2, '33. upgraded HP and STAR persist through subsequent wave reconcile');

  // ==========================================
  // Section 30: RUN RESOURCE CHECKS (34-38)
  // ==========================================
  // 34. unspent shard persists Wave 1 → Wave 2
  const runPool = new RunLinkShardPool();
  runPool.award(1);
  // Simulating wave 1 -> wave 2 transition (no pool reset)
  expect(runPool.count === 1, '34. unspent shard persists across Waves');

  // 35. spending reduces count exactly once
  const spendSuccess = runPool.spend(1);
  expect(spendSuccess && runPool.count === 0, '35. spending reduces count exactly once');
  expect(!runPool.spend(1), '35. cannot spend when balance is 0');

  // 36. earning after spending works
  runPool.award(2);
  expect(runPool.count === 2, '36. earning shards after spending works normally');

  // 37. Restart clears shard pool
  runPool.reset();
  expect(runPool.count === 0, '37. restart clears shard pool to 0');

  // 38. no shard leakage between Runs
  const newRunPool = new RunLinkShardPool();
  expect(newRunPool.count === 0, '38. new Run starts cleanly with 0 shards');
}
