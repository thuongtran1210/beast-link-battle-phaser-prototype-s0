import { AutonomousBattleModel, EXPERIMENTAL_FRONTLINE_HEAL_HP, FRONTLINE_HEAL_HP } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { allowsPuzzleInput, GamePhase } from '../state/GamePhase';

export function runP1S4Checks(): void {
  // 1. Safe charge consumption in EnergyQueue
  const energy = new EnergyQueue();
  expect(!energy.consumeCharge('energy-a'), 'cannot consume from empty EnergyQueue');
  expect(!energy.consume('energy-a'), 'consume alias cannot consume from empty EnergyQueue');
  expect(!energy.consumeCharge('energy-a', 0), 'cannot consume zero charges');
  expect(!energy.consumeCharge('energy-a', -1), 'cannot consume negative charges');
  expect(!energy.consumeCharge('energy-a', 1.5), 'cannot consume non-integer charges');

  energy.addCharge('energy-a', 2);
  energy.addCharge('energy-b', 1);
  expect(energy.getTotalCharges() === 3 && energy.getCharges('energy-a') === 2 && energy.getCharges('energy-b') === 1, 'energy charges stored correctly');

  expect(!energy.consumeCharge('energy-a', 3), 'cannot consume more charges than available');
  expect(energy.getCharges('energy-a') === 2, 'failed consumption does not modify charges');

  expect(energy.consumeCharge('energy-a', 1), 'consume exactly 1 charge succeeds');
  expect(energy.getCharges('energy-a') === 1 && energy.getCharges('energy-b') === 1 && energy.getTotalCharges() === 2, 'consuming 1 charge decrements selected ID only');

  expect(energy.consumeCharge('energy-a', 1), 'consume remaining charge succeeds');
  expect(energy.getCharges('energy-a') === 0 && energy.getTotalCharges() === 1, 'exhausted energy ID reaches 0 charges');
  expect(energy.getAll().length === 1 && energy.getAll()[0].energyId === 'energy-b', 'exhausted energy ID is removed from getAll');

  // 2. Experimental Frontline Heal fixture mechanics
  expect(EXPERIMENTAL_FRONTLINE_HEAL_HP === 30 && FRONTLINE_HEAL_HP === 30, 'Experimental Frontline Heal fixture is exactly +30 HP');

  // Tanker (max HP 80, role Tanker)
  const tankerFormation = formation([{ contentId: 'beast-a', star: 1 }], ['front-1']);
  const battle = new AutonomousBattleModel(tankerFormation);
  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 2);

  // Cast on full HP unit caps at max HP
  expect(battle.snapshot.units[0].currentHp === 80, 'unit starts at max HP 80');
  expect(battle.castFrontlineHeal('energy-a', queue), 'cast succeeds on full HP unit');
  expect(battle.snapshot.units[0].currentHp === 80, 'heal is capped at max HP');
  expect(queue.getCharges('energy-a') === 1, 'cast consumes exactly 1 charge from selected ID even when capped');

  // Damage unit and heal
  battle.tick(); // Enemy damage 15 -> Tanker HP becomes 65
  expect(battle.snapshot.units[0].currentHp === 65, 'unit takes 15 enemy damage');
  expect(battle.castFrontlineHeal('energy-a', queue), 'cast succeeds on damaged unit');
  expect(battle.snapshot.units[0].currentHp === 80, 'heal 65 + 30 is capped at max HP 80');
  expect(queue.getCharges('energy-a') === 0, 'second cast consumes remaining charge');

  // Cannot cast with 0 charges
  expect(!battle.castFrontlineHeal('energy-a', queue), 'cast fails when selected Energy ID has 0 charges');
  expect(battle.snapshot.units[0].currentHp === 80, 'failed cast does not change unit HP');

  // 3. Multi-unit targeting: heals current front-most alive unit
  const multiFormation = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-2', 'front-1', 'mid-1'],
  );
  const multiBattle = new AutonomousBattleModel(multiFormation);
  const multiQueue = new EnergyQueue();
  multiQueue.addCharge('energy-c', 3);

  // Tick 1: front-1 (Mage, 40 max HP) takes 15 damage -> 25 HP
  multiBattle.tick();
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-1')?.currentHp === 25, 'front-1 targeted by enemy');
  expect(multiBattle.castFrontlineHeal('energy-c', multiQueue), 'cast frontline heal on multi formation');
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-1')?.currentHp === 40, 'front-1 healed to 40 max HP');
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-2')?.currentHp === 80, 'front-2 untouched');
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'mid-1')?.currentHp === 45, 'mid-1 untouched');

  // 4. Dead units cannot revive
  // Tick front-1 until defeated (Mage HP 40: enemy damage 15 -> tick: 25, tick: 10, tick: 0)
  multiBattle.tick(); // front-1 takes 15 -> 25 HP
  multiBattle.tick(); // front-1 takes 15 -> 10 HP
  multiBattle.tick(); // front-1 takes 15 -> 0 HP (defeated)
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-1')?.currentHp === 0, 'front-1 is defeated');

  // Next front-most alive unit is front-2 (Tanker)
  multiBattle.tick(); // enemy targets front-2: takes 15 damage -> 65 HP
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-2')?.currentHp === 65, 'enemy targets next front-most alive unit front-2');

  // Now cast heal: must heal front-2, NOT dead front-1
  expect(multiBattle.castFrontlineHeal('energy-c', multiQueue), 'cast frontline heal with defeated unit present');
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-1')?.currentHp === 0, 'dead unit cannot revive and remains 0 HP');
  expect(multiBattle.snapshot.units.find((u) => u.slotId === 'front-2')?.currentHp === 80, 'front-2 (current front-most alive) receives heal');

  // 5. Cast only while Battle is Running
  const winBattle = new AutonomousBattleModel(formation([{ contentId: 'beast-a', star: 3 }], ['front-1']));
  while (winBattle.snapshot.status === 'Running') winBattle.tick();
  expect(winBattle.snapshot.status === 'Win', 'strong fixture reaches Win');
  const winQueue = new EnergyQueue(); winQueue.addCharge('energy-a', 2);
  expect(!winBattle.castFrontlineHeal('energy-a', winQueue), 'cast rejected after Battle ends in Win');
  expect(winQueue.getCharges('energy-a') === 2, 'charges are not consumed after Win');

  const loseBattle = new AutonomousBattleModel(formation([{ contentId: 'beast-b', star: 1 }], ['front-1']));
  while (loseBattle.snapshot.status === 'Running') loseBattle.tick();
  expect(loseBattle.snapshot.status === 'Lose', 'weak fixture reaches Lose');
  const loseQueue = new EnergyQueue(); loseQueue.addCharge('energy-b', 2);
  expect(!loseBattle.castFrontlineHeal('energy-b', loseQueue), 'cast rejected after Battle ends in Lose');
  expect(loseQueue.getCharges('energy-b') === 2, 'charges are not consumed after Lose');

  // 6. Timed Energy Cast saves unit and alters battle outcome (Autonomous battle continues before/after cast)
  // Weak fixture (Assassin: HP 35, Damage 14): without heal dies at tick 3.
  const timedFormation = formation([{ contentId: 'beast-b', star: 1 }], ['front-1']);
  const timedBattle = new AutonomousBattleModel(timedFormation);
  const timedQueue = new EnergyQueue(); timedQueue.addCharge('energy-a', 1);
  timedBattle.tick(); // Tick 1: HP 20
  timedBattle.tick(); // Tick 2: HP 5
  expect(timedBattle.snapshot.units[0].currentHp === 5, 'unit at critical HP before lethal tick');
  expect(timedBattle.castFrontlineHeal('energy-a', timedQueue), 'timely cast heals unit');
  expect(timedBattle.snapshot.units[0].currentHp === 35, 'unit restored to max HP 35 before next tick');
  timedBattle.tick(); // Tick 3: survives! HP becomes 20 instead of dying at 0
  expect(timedBattle.snapshot.status === 'Running' && timedBattle.snapshot.units[0].currentHp === 20, 'Battle continues autonomously after cast and unit survives');

  // 7. No puzzle board and formation lock during Battle
  expect(!allowsPuzzleInput(GamePhase.Battle), 'no puzzle input allowed during Battle');
  const formationBefore = JSON.stringify(timedFormation.units);
  timedBattle.tick();
  expect(JSON.stringify(timedFormation.units) === formationBefore, 'formation remains locked and unedited during Battle');

  // 8. No-cast path still reaches Win/Lose automatically
  const noCastBattle = new AutonomousBattleModel(formation([{ contentId: 'beast-b', star: 1 }], ['front-1']));
  while (noCastBattle.snapshot.status === 'Running') noCastBattle.tick();
  expect(noCastBattle.snapshot.status === 'Lose', 'no-cast path automatically reaches terminal Result state');

  // 9. Stored Energy persists into Result, and Restart clears EnergyQueue
  const resultQueue = new EnergyQueue();
  resultQueue.addCharge('energy-b', 3);
  expect(resultQueue.getCharges('energy-b') === 3 && resultQueue.getTotalCharges() === 3, 'Stored Energy count persists correctly into Result');
  resultQueue.reset();
  expect(resultQueue.getTotalCharges() === 0 && resultQueue.getAll().length === 0, 'Restart clears EnergyQueue and combat state');
}

function formation(units: Array<{ contentId: string; star: 1 | 2 | 3 }>, slots: string[]): BattleFormation {
  const f = new BattleFormation(units);
  f.units.forEach((unit, index) => f.place(unit.unitId, slots[index]));
  return f;
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-S4 check failed: ${label}`);
}
