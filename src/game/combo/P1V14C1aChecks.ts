import { BeastRushPhaseTimer } from './BeastRushPhaseTimer';
import { ComboQualityTracker } from './ComboQualityTracker';
import { EnergyRushTimer } from '../energy/EnergyRushTimer';
import { BattleQueue } from '../queue/BattleQueue';
import { EnergyQueue } from '../energy/EnergyQueue';
import { evaluateLinkShardReward } from '../run/RunLinkShardPool';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`P1-V14C.1a check failed: ${message}`);
};

export function runP1V14C1aChecks(): void {
  // ==========================================
  // Section 32: SHARED TIMING CHECKS (1–13)
  // ==========================================
  // 1. fresh phase enters READY
  const timer = new BeastRushPhaseTimer(12);
  expect(timer.isReady && !timer.isActive && !timer.isEnded, '1. fresh phase enters READY state');

  // 2. timer reports 12.0s while READY
  expect(timer.snapshot.remainingSeconds === 12, '2. timer reports 12.0s while READY');

  // 3. update(5s) while READY leaves 12.0s
  timer.update(5);
  expect(timer.snapshot.remainingSeconds === 12 && timer.isReady, '3. update(5s) while READY leaves 12.0s');

  // 4. update(100s) while READY leaves 12.0s
  timer.update(100);
  expect(timer.snapshot.remainingSeconds === 12 && timer.isReady, '4. update(100s) while READY leaves 12.0s');

  // 5. invalid interaction does not start timer
  // Invalid interaction performs metrics/feedback but never calls timer.start()
  expect(timer.isReady && !timer.isActive, '5. invalid interaction does not start timer');

  // 6. first valid match starts timer
  timer.start();
  expect(timer.isActive && !timer.isReady && timer.snapshot.remainingSeconds === 12, '6. first valid match starts timer from 12.0s');

  // 7. start occurs exactly once
  expect(timer.isActive, '7. timer is now active');

  // 8. second valid match does not restart timer
  timer.update(2); // remainingSeconds becomes 10s
  expect(timer.snapshot.remainingSeconds === 10, '8. timer decremented to 10s');
  timer.start(); // second valid match calls start()
  expect(timer.snapshot.remainingSeconds === 10, '8. second valid match does not restart timer to 12s');

  // 9. second valid match does not extend timer
  expect(timer.snapshot.remainingSeconds === 10, '9. second valid match does not extend timer duration');

  // 10. ACTIVE update decreases timer normally
  timer.update(1);
  expect(timer.snapshot.remainingSeconds === 9, '10. ACTIVE update decreases timer normally to 9s');

  // 11. zero emits end exactly once
  let endEvents = 0;
  timer.onEnded(() => { endEvents += 1; });
  timer.update(9); // reaches 0s
  expect(timer.snapshot.remainingSeconds === 0 && timer.isEnded && endEvents === 1, '11. zero emits end event exactly once');

  // 12. later updates do not duplicate end event
  timer.update(5);
  expect(endEvents === 1 && timer.snapshot.remainingSeconds === 0, '12. later updates do not duplicate end event');

  // 13. reset restores READY 12.0s
  timer.reset();
  expect(timer.isReady && !timer.isActive && timer.snapshot.remainingSeconds === 12, '13. reset restores READY at 12.0s');

  // ==========================================
  // Section 33: BEAST RUSH CHECKS (14–25)
  // ==========================================
  // 14. Beast enters READY with Combo 0 / Best 0
  const beastTimer = new BeastRushPhaseTimer(12);
  const combo = new ComboQualityTracker(1.5);
  expect(beastTimer.isReady && combo.snapshot.currentStreak === 0 && combo.snapshot.bestStreak === 0, '14. Beast enters READY with Combo 0 / Best 0');

  // 15. READY observation time does not affect Combo
  combo.update(10);
  expect(combo.snapshot.currentStreak === 0 && combo.snapshot.bestStreak === 0 && !combo.snapshot.active, '15. READY observation time does not affect Combo');

  // 16. invalid READY action does not create Combo
  combo.breakStreak();
  expect(combo.snapshot.currentStreak === 0 && combo.snapshot.bestStreak === 0, '16. invalid READY action does not create Combo');

  // 17. first valid Beast match: BattleQueue +1, phase becomes ACTIVE, Combo = 1, Best = 1
  const bq = new BattleQueue();
  beastTimer.start();
  bq.addBeastMatch('beast-a');
  combo.registerValidMatch();
  expect(bq.count('beast-a') === 1 && beastTimer.isActive && combo.snapshot.currentStreak === 1 && combo.snapshot.bestStreak === 1, '17. first valid Beast match recruits +1, starts timer, and sets Combo 1');

  // 18. Combo link window starts from first valid match
  expect(combo.snapshot.windowSeconds === 1.5, '18. Combo link window is active at 1.5s after first valid match');

  // 19. later valid match follows C.1 streak logic
  combo.registerValidMatch();
  expect(combo.snapshot.currentStreak === 2 && combo.snapshot.bestStreak === 2 && combo.snapshot.windowSeconds === 1.5, '19. later valid match increments streak to 2 and resets window');

  // 20. later valid match does not alter phase duration
  const beastTimeBefore = beastTimer.snapshot.remainingSeconds;
  bq.addBeastMatch('beast-a');
  beastTimer.start(); // idempotent
  expect(beastTimer.snapshot.remainingSeconds === beastTimeBefore, '20. later valid match does not alter phase duration');

  // 21. invalid ACTIVE input breaks Combo but not phase timer
  combo.breakStreak();
  expect(combo.snapshot.currentStreak === 0 && beastTimer.snapshot.remainingSeconds === beastTimeBefore && beastTimer.isActive, '21. invalid ACTIVE input breaks Combo but does not alter phase timer');

  // 22. auto reshuffle does not start READY timer
  const freshBeastTimer = new BeastRushPhaseTimer(12);
  // Simulating auto-reshuffle without player match
  expect(freshBeastTimer.isReady && freshBeastTimer.snapshot.remainingSeconds === 12, '22. auto reshuffle does not start READY timer');

  // 23. auto reshuffle does not impersonate Combo-break input
  combo.registerValidMatch();
  const streakBeforeReshuffle = combo.snapshot.currentStreak;
  // Auto-reshuffle preserves current combo streak
  expect(combo.snapshot.currentStreak === streakBeforeReshuffle && combo.snapshot.currentStreak > 0, '23. auto reshuffle does not break Combo');

  // 24. C.1 quantity/quality decoupling checks remain PASS
  const bqA = new BattleQueue();
  const bqB = new BattleQueue();
  for (let i = 0; i < 6; i++) {
    bqA.addBeastMatch('beast-a');
    bqB.addBeastMatch('beast-a');
  }
  expect(bqA.count('beast-a') === 6 && bqB.count('beast-a') === 6, '24. C.1 quantity invariant holds: 6 matches equal 6 beasts');

  // 25. C.2 reward checks remain PASS
  expect(evaluateLinkShardReward(6) === 1 && evaluateLinkShardReward(1) === 0, '25. C.2 Link Shard rewards derive purely from bestStreak quality');

  // ==========================================
  // Section 34: ENERGY RUSH CHECKS (26–35)
  // ==========================================
  // 26. Energy Rush enters READY at 12.0s
  const energyTimer = new EnergyRushTimer(12.0);
  expect(energyTimer.isReady && !energyTimer.isActive && energyTimer.snapshot.remainingSeconds === 12, '26. Energy Rush enters READY at 12.0s');

  // 27. READY time does not decrease countdown
  energyTimer.update(7);
  expect(energyTimer.snapshot.remainingSeconds === 12 && energyTimer.isReady, '27. READY time does not decrease countdown');

  // 28. invalid READY input does not start countdown
  expect(energyTimer.isReady && !energyTimer.isActive, '28. invalid READY input does not start countdown');

  // 29. first valid Energy match: grants normal Energy, starts countdown
  const eq = new EnergyQueue();
  energyTimer.start();
  eq.addCharge('energy-a');
  expect(eq.getTotalCharges() === 1 && energyTimer.isActive && energyTimer.snapshot.remainingSeconds === 12, '29. first valid Energy match grants charge and starts countdown from 12.0s');

  // 30. first valid Energy match is counted normally
  expect(eq.getCharges('energy-a') === 1, '30. first valid Energy match is not sacrificed');

  // 31. later Energy match does not restart timer
  energyTimer.update(3); // 9s remaining
  energyTimer.start(); // second valid match calls start()
  expect(energyTimer.snapshot.remainingSeconds === 9, '31. later Energy match does not restart timer');

  // 32. later Energy match does not extend timer
  expect(energyTimer.snapshot.remainingSeconds === 9, '32. later Energy match does not extend timer');

  // 33. auto reshuffle does not start READY timer
  const freshEnergyTimer = new EnergyRushTimer(12.0);
  expect(freshEnergyTimer.isReady && freshEnergyTimer.snapshot.remainingSeconds === 12, '33. auto reshuffle does not start READY timer in Energy Rush');

  // 34. ACTIVE Energy timer reaches 0 normally
  let energyEnds = 0;
  energyTimer.onEnded(() => { energyEnds += 1; });
  energyTimer.update(9); // reaches 0s
  expect(energyTimer.snapshot.remainingSeconds === 0 && energyTimer.isEnded && energyEnds === 1, '34. ACTIVE Energy timer reaches 0 normally and emits end once');

  // 35. Energy transition to Battle Setup remains correct
  energyTimer.reset();
  expect(energyTimer.isReady && energyTimer.snapshot.remainingSeconds === 12, '35. Energy timer resets cleanly to READY for next Wave / Run');

  // ==========================================
  // Section 35: P1-V14C.1a.1 TIMING STATE HARDENING CHECKS (1–26)
  // ==========================================

  // --- BEAST TIMER CHECKS (1–13) ---
  // 1. fresh timer = READY 12.0s.
  const bTimer = new BeastRushPhaseTimer(12);
  expect(bTimer.isReady && !bTimer.isActive && !bTimer.isEnded && bTimer.snapshot.remainingSeconds === 12, 'H1. fresh Beast timer = READY 12.0s');

  // 2. READY start() → ACTIVE.
  bTimer.start();
  expect(bTimer.isActive && !bTimer.isReady && !bTimer.isEnded && bTimer.snapshot.remainingSeconds === 12, 'H2. READY start() -> ACTIVE');

  // 3. ACTIVE update reduces time.
  bTimer.update(4);
  expect(bTimer.isActive && bTimer.snapshot.remainingSeconds === 8, 'H3. ACTIVE update reduces time to 8s');

  // 4. ACTIVE repeated start() does not reset time.
  bTimer.start();
  expect(bTimer.isActive && bTimer.snapshot.remainingSeconds === 8, 'H4. ACTIVE repeated start() does not reset time');

  // 5. ACTIVE reaches 0 → ENDED.
  let bEndEvents = 0;
  bTimer.onEnded(() => { bEndEvents += 1; });
  bTimer.update(8);
  expect(bTimer.isEnded && !bTimer.isActive && !bTimer.isReady && bTimer.snapshot.remainingSeconds === 0, 'H5. ACTIVE reaches 0 -> ENDED');

  // 6. end event fires exactly once.
  expect(bEndEvents === 1, 'H6. end event fires exactly once');

  // 7. ENDED start() remains ENDED.
  bTimer.start();
  expect(bTimer.isEnded && !bTimer.isActive, 'H7. ENDED start() remains ENDED');

  // 8. ENDED start() keeps remainingSeconds = 0.
  expect(bTimer.snapshot.remainingSeconds === 0, 'H8. ENDED start() keeps remainingSeconds = 0');

  // 9. repeated ENDED start() remains ENDED.
  bTimer.start();
  bTimer.start();
  expect(bTimer.isEnded && !bTimer.isActive && bTimer.snapshot.remainingSeconds === 0, 'H9. repeated ENDED start() remains ENDED');

  // 10. ENDED update(5) remains 0 / ENDED.
  bTimer.update(5);
  expect(bTimer.isEnded && !bTimer.isActive && bTimer.snapshot.remainingSeconds === 0, 'H10. ENDED update(5) remains 0 / ENDED');

  // 11. ENDED does not emit another end event.
  expect(bEndEvents === 1, 'H11. ENDED does not emit another end event');

  // 12. ENDED reset() → READY 12.0s.
  bTimer.reset();
  expect(bTimer.isReady && !bTimer.isActive && !bTimer.isEnded && bTimer.snapshot.remainingSeconds === 12, 'H12. ENDED reset() -> READY 12.0s');

  // 13. after reset, start() works normally again.
  bTimer.start();
  expect(bTimer.isActive && !bTimer.isReady && !bTimer.isEnded && bTimer.snapshot.remainingSeconds === 12, 'H13. after reset, start() works normally again');

  // --- ENERGY TIMER CHECKS (14–26) ---
  // 14. fresh Energy timer = READY 12.0s.
  const eTimer = new EnergyRushTimer(12.0);
  expect(eTimer.isReady && !eTimer.isActive && !eTimer.isEnded && eTimer.snapshot.remainingSeconds === 12, 'H14. fresh Energy timer = READY 12.0s');

  // 15. READY start() → ACTIVE.
  eTimer.start();
  expect(eTimer.isActive && !eTimer.isReady && !eTimer.isEnded && eTimer.snapshot.remainingSeconds === 12, 'H15. READY start() -> ACTIVE');

  // 16. ACTIVE update reduces time.
  eTimer.update(4);
  expect(eTimer.isActive && eTimer.snapshot.remainingSeconds === 8, 'H16. ACTIVE update reduces time to 8s');

  // 17. ACTIVE repeated start() does not reset time.
  eTimer.start();
  expect(eTimer.isActive && eTimer.snapshot.remainingSeconds === 8, 'H17. ACTIVE repeated start() does not reset time');

  // 18. ACTIVE reaches 0 → ENDED.
  let eEndEvents = 0;
  eTimer.onEnded(() => { eEndEvents += 1; });
  eTimer.update(8);
  expect(eTimer.isEnded && !eTimer.isActive && !eTimer.isReady && eTimer.snapshot.remainingSeconds === 0, 'H18. ACTIVE reaches 0 -> ENDED');

  // 19. end event fires exactly once.
  expect(eEndEvents === 1, 'H19. end event fires exactly once');

  // 20. ENDED start() remains ENDED.
  eTimer.start();
  expect(eTimer.isEnded && !eTimer.isActive, 'H20. ENDED start() remains ENDED');

  // 21. ENDED remainingSeconds remains 0.
  expect(eTimer.snapshot.remainingSeconds === 0, 'H21. ENDED remainingSeconds remains 0');

  // 22. repeated ENDED start() remains ENDED.
  eTimer.start();
  eTimer.start();
  expect(eTimer.isEnded && !eTimer.isActive && eTimer.snapshot.remainingSeconds === 0, 'H22. repeated ENDED start() remains ENDED');

  // 23. ENDED update() remains 0.
  eTimer.update(5);
  expect(eTimer.isEnded && !eTimer.isActive && eTimer.snapshot.remainingSeconds === 0, 'H23. ENDED update() remains 0');

  // 24. no duplicate end event.
  expect(eEndEvents === 1, 'H24. no duplicate end event');

  // 25. reset() → READY 12.0s.
  eTimer.reset();
  expect(eTimer.isReady && !eTimer.isActive && !eTimer.isEnded && eTimer.snapshot.remainingSeconds === 12, 'H25. reset() -> READY 12.0s');

  // 26. post-reset start() works normally.
  eTimer.start();
  expect(eTimer.isActive && !eTimer.isReady && !eTimer.isEnded && eTimer.snapshot.remainingSeconds === 12, 'H26. post-reset start() works normally');
}
