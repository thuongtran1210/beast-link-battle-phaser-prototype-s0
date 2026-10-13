import { AutonomousBattleModel } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { P1V13A_SIGNATURE_RULES, P1V11C_FIXTURE_A_FRONTLINE, SIMULATION_STEP } from './BattleConfig';
import type { BattleCommand } from './commands/BattleCommand';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`BattleCommandEvent Check Failed: ${message}`);
}

export function runBattleCommandEventChecks(): void {
  // Test 1: Basic stepWithCommands event emission
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-c', star: 1 },
  ]);
  formation.place(formation.units[0].unitId, 'front-1');
  formation.place(formation.units[1].unitId, 'mid-1');

  const model = new AutonomousBattleModel(
    formation,
    P1V11C_FIXTURE_A_FRONTLINE,
    P1V13A_SIGNATURE_RULES,
  );

  // Poll before steps
  const initialEvents = model.pollEvents();
  expect(initialEvents.length === 0, 'Initial event buffer must be empty');

  // Step without commands
  const res1 = model.stepWithCommands(SIMULATION_STEP);
  expect(res1.snapshot.status === 'Running', 'Status must be running');

  // Test 2: Tactical energy cast command
  const energyQueue = new EnergyQueue();
  energyQueue.addCharge('energy-e'); // Guard

  const guardCmd: BattleCommand = {
    type: 'CastTacticalEnergy',
    tick: res1.snapshot.elapsedTicks,
    energyId: 'energy-e',
    teamId: 'TeamA',
  };

  const res2 = model.stepWithCommands(SIMULATION_STEP, [guardCmd], energyQueue);
  const castEvents = res2.events.filter((e) => e.type === 'TacticalEnergyCast');
  expect(castEvents.length === 1, 'Exactly one TacticalEnergyCast event must be emitted');
  const castEvent = castEvents[0];
  if (castEvent.type === 'TacticalEnergyCast') {
    expect(castEvent.energyId === 'energy-e', 'energyId must match energy-e');
    expect(castEvent.success === true, 'Guard cast must succeed on living frontline');
  }

  // Ensure polling clears the event buffer
  const polled = model.pollEvents();
  expect(polled.length === 0, 'Subsequent poll must return empty array after stepWithCommands');

  // Test 3: Surrender Command
  const surrenderCmd: BattleCommand = {
    type: 'Surrender',
    tick: res2.snapshot.elapsedTicks,
    teamId: 'TeamA',
  };

  const res3 = model.stepWithCommands(SIMULATION_STEP, [surrenderCmd]);
  expect(res3.snapshot.status === 'Lose', 'Surrendering TeamA must set status to Lose');
  const endedEvents = res3.events.filter((e) => e.type === 'BattleEnded');
  expect(endedEvents.length === 1, 'Surrender must emit BattleEnded event');
  const endedEvent = endedEvents[0];
  if (endedEvent.type === 'BattleEnded') {
    expect(endedEvent.status === 'Lose', 'Ended event status must be Lose');
    expect(endedEvent.winnerTeamId === 'TeamB', 'Winner must be TeamB');
  }

  // Test 4: Battle Win terminal event
  const easyFormation = new BattleFormation([
    { contentId: 'beast-a', star: 3 },
  ]);
  easyFormation.place(easyFormation.units[0].unitId, 'front-1');
  const winModel = new AutonomousBattleModel(
    easyFormation,
    [{ enemyId: 'weak-mob', slotId: 'enemy-1', row: 'Front', column: 1, maxHp: 1, damage: 0 }],
    P1V13A_SIGNATURE_RULES,
  );

  let winEventEmitted = false;
  for (let step = 0; step < 50 && winModel.snapshot.status === 'Running'; step++) {
    const stepRes = winModel.stepWithCommands(SIMULATION_STEP);
    if (stepRes.events.some((e) => e.type === 'BattleEnded' && e.status === 'Win')) {
      winEventEmitted = true;
      break;
    }
  }

  expect(winEventEmitted, 'Winning combat must emit BattleEnded event with status Win');
}
