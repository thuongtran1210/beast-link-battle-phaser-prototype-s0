import { AutonomousBattleModel } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { LocalBattleController } from './controller/LocalBattleController';
import {
  RemoteBattleController,
  type NetworkTransportAdapter,
} from './controller/RemoteBattleController';
import {
  P1V13A_SIGNATURE_RULES,
  P1V11C_FIXTURE_A_FRONTLINE,
  SIMULATION_STEP,
} from './BattleConfig';
import type { AutonomousBattleSnapshot } from './BattleTypes';
import type { BattleEvent } from './events/BattleEvents';
import type { BattleCommand } from './commands/BattleCommand';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`BattleController Check Failed: ${message}`);
}

export function runBattleControllerChecks(): void {
  // Test 1: LocalBattleController Lifecycle
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
  const energyQueue = new EnergyQueue();
  energyQueue.addCharge('energy-e');

  const localController = new LocalBattleController(model, energyQueue);
  expect(localController.isRemote === false, 'Local controller isRemote must be false');
  expect(localController.currentSnapshot.status === 'Running', 'Initial status must be Running');

  let snapshotReceivedCount = 0;
  let receivedEventsCount = 0;
  let statusChange: string | null = null;

  const unsubSnapshot = localController.onSnapshot((s) => {
    snapshotReceivedCount++;
    expect(s.elapsedTicks > 0, 'Snapshot tick must advance');
  });

  const unsubEvents = localController.onEvents((evs) => {
    receivedEventsCount += evs.length;
  });

  const unsubStatus = localController.onStatus((st) => {
    statusChange = st;
  });

  // Queue a Tactical Energy command and step
  localController.sendCommand({
    type: 'CastTacticalEnergy',
    tick: 1,
    energyId: 'energy-e',
    teamId: 'TeamA',
  });

  localController.step(SIMULATION_STEP);

  expect(snapshotReceivedCount === 1, 'Snapshot listener must be called once');
  expect(receivedEventsCount >= 1, 'Events listener must receive tactical cast event');
  expect(statusChange === null, 'Status must still be running');

  // Issue surrender command
  localController.sendCommand({
    type: 'Surrender',
    tick: 2,
    teamId: 'TeamA',
  });

  localController.step(SIMULATION_STEP);
  expect(statusChange === 'Lose', 'Surrender must trigger status listener with Lose');

  // Verify unsubscribe
  const beforeUnsub = snapshotReceivedCount;
  unsubSnapshot();
  unsubEvents();
  unsubStatus();
  localController.step(SIMULATION_STEP);
  expect(snapshotReceivedCount === beforeUnsub, 'Unsubscribed listener must not be called again');
  localController.dispose();

  // Test 2: RemoteBattleController Network Adapter
  const transportState = {
    sentCommand: null as BattleCommand | null,
    disconnected: false,
    snapshotCb: null as ((s: AutonomousBattleSnapshot) => void) | null,
    eventsCb: null as ((evs: BattleEvent[]) => void) | null,
    statusCb: null as ((st: 'Running' | 'Win' | 'Lose') => void) | null,
  };

  const mockTransport: NetworkTransportAdapter = {
    sendCommand(cmd) {
      transportState.sentCommand = cmd;
    },
    onSnapshot(handler) {
      transportState.snapshotCb = handler;
      return () => { transportState.snapshotCb = null; };
    },
    onEvents(handler) {
      transportState.eventsCb = handler;
      return () => { transportState.eventsCb = null; };
    },
    onStatus(handler) {
      transportState.statusCb = handler;
      return () => { transportState.statusCb = null; };
    },
    disconnect() {
      transportState.disconnected = true;
    },
  };

  const initialFakeSnapshot: AutonomousBattleSnapshot = {
    ...model.snapshot,
    elapsedTicks: 100,
  };

  const remoteController = new RemoteBattleController(initialFakeSnapshot, mockTransport);
  expect(remoteController.isRemote === true, 'Remote controller isRemote must be true');
  expect(remoteController.currentSnapshot.elapsedTicks === 100, 'Initial snapshot must match');

  // Send command through remote controller
  const testCmd: BattleCommand = {
    type: 'CastTacticalEnergy',
    tick: 101,
    energyId: 'energy-f',
    teamId: 'TeamA',
  };
  remoteController.sendCommand(testCmd);
  expect(transportState.sentCommand === testCmd, 'sendCommand must forward to network transport');

  // Simulate server sending back an updated snapshot and event
  let remoteSnapshotReceived: AutonomousBattleSnapshot | null = null;
  let remoteEventsReceived: BattleEvent[] = [];
  let remoteStatusReceived: string | null = null;

  remoteController.onSnapshot((s) => { remoteSnapshotReceived = s; });
  remoteController.onEvents((evs) => { remoteEventsReceived = evs; });
  remoteController.onStatus((st) => { remoteStatusReceived = st; });

  const updatedServerSnapshot: AutonomousBattleSnapshot = {
    ...initialFakeSnapshot,
    elapsedTicks: 102,
  };
  transportState.snapshotCb?.(updatedServerSnapshot);
  expect((remoteSnapshotReceived as AutonomousBattleSnapshot | null)?.elapsedTicks === 102, 'Remote controller must propagate server snapshot');
  expect(remoteController.currentSnapshot.elapsedTicks === 102, 'currentSnapshot must update');

  const mockServerEvent: BattleEvent = {
    type: 'TacticalEnergyCast',
    tick: 102,
    time: 5.1,
    energyId: 'energy-f',
    kind: 'Disrupt',
    amount: 0,
    success: true,
  };
  transportState.eventsCb?.([mockServerEvent]);
  expect(remoteEventsReceived.length === 1, 'Remote events must propagate');

  transportState.statusCb?.('Win');
  expect(remoteStatusReceived === 'Win', 'Remote status change must propagate');

  // Dispose
  remoteController.dispose();
  expect(transportState.disconnected, 'Disposing remote controller must disconnect transport');
}
