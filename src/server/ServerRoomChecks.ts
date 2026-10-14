import { RoomManager } from './RoomManager';
import { BattleRoom, type RoomScheduler } from './BattleRoom';
import { SIMULATION_STEP } from '../game/battle/BattleConfig';
import type { DeployedFormationUnit, ServerMessage } from '../network/protocol/NetworkMessages';
import { onlinePerspective } from '../game/network/OnlinePerspective';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ServerRoom Check Failed: ${message}`);
}

export function runServerRoomChecks(): void {
  const manager = new RoomManager();
  const room = manager.createRoom('pvp');
  const messagesA: ServerMessage[] = [];
  const messagesB: ServerMessage[] = [];
  const a = room.addPlayer('alice', 'Alice', message => messagesA.push(message));
  const b = room.addPlayer('bob', 'Bob', message => messagesB.push(message));
  expect(a.teamId === 'TeamA' && b.teamId === 'TeamB', 'Distinct team ownership');
  expect(manager.getRoomByCode(room.roomCode) === room && room.isFull, 'Room lookup and capacity');
  let rejected = false;
  try { room.addPlayer('third', 'Third', () => {}); } catch { rejected = true; }
  expect(rejected, 'Third player rejected');
  room.setPlayerReady('alice', true);
  room.setPlayerReady('bob', true);
  expect(room.state === 'COUNTDOWN', 'Both ready trigger countdown');
  room.setPlayerReady('bob', false);
  expect(String(room.state) === 'WAITING', 'Unready cancels countdown');
  room.setPlayerReady('bob', true);
  room.startMatch();
  expect(String(room.state) === 'BeastRush', 'Match enters preparation, never placeholder combat');
  expect(room.step() === null, 'No combat ticks during preparation');
  const startA = messagesA.find(message => message.type === 'MATCH_START');
  const startB = messagesB.find(message => message.type === 'MATCH_START');
  expect(startA?.type === 'MATCH_START' && startB?.type === 'MATCH_START' && startA.seed === startB.seed, 'Both receive same seed');
  room.preparationReady('alice', 'BeastRush');
  room.preparationReady('alice', 'BeastRush');
  room.preparationReady('intruder', 'BeastRush');
  room.preparationReady('bob', 'EnergyRush');
  expect(String(room.state) === 'BeastRush', 'Duplicates, nonmembers and wrong phase cannot release barrier');
  room.preparationReady('bob', 'BeastRush');
  expect(String(room.state) === 'EnergyRush', 'Both finish BeastRush together');
  room.preparationReady('alice', 'EnergyRush');
  expect(String(room.state) === 'EnergyRush', 'Fast player waits for peer');
  room.preparationReady('bob', 'EnergyRush');
  expect(String(room.state) === 'BattleSetup', 'Both enter Setup together');
  const beastA: DeployedFormationUnit = { unitId: 'run-unit-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-1', row: 'Front', column: 1, maxHp: 100, currentHp: 75, damage: 10 };
  const beastB: DeployedFormationUnit = { ...beastA, beastId: 'beast-b', role: 'Assassin', currentHp: 50 };
  room.deployFormation('alice', [beastA], false);
  room.deployFormation('bob', [beastB], false);
  expect(String(room.state) === 'BattleSetup', 'Two previews must not start combat');
  const preview = messagesB.find(message => message.type === 'OPPONENT_FORMATION_READY');
  expect(preview?.type === 'OPPONENT_FORMATION_READY' && preview.units[0].beastId === 'beast-a' && preview.units[0].slotId === 'front-1' && !preview.ready, 'Opponent receives actual beast and placement');
  room.deployFormation('alice', [beastA], true, [{ energyId: 'energy-a', charges: 1 }]);
  expect(String(room.state) === 'BattleSetup', 'One committed formation waits');
  room.deployFormation('alice', [{ ...beastA, beastId: 'beast-d' }], true);
  room.deployFormation('bob', [beastB], true, [{ energyId: 'energy-a', charges: 1 }]);
  expect(String(room.state) === 'BATTLE', 'Two commits start real combat');
  room.stopTicking();
  const battleA = messagesA.find(message => message.type === 'ONLINE_BATTLE_START');
  const battleB = messagesB.find(message => message.type === 'ONLINE_BATTLE_START');
  expect(battleA?.type === 'ONLINE_BATTLE_START' && battleB?.type === 'ONLINE_BATTLE_START', 'Both clients receive battle start');
  if (!battleA || battleA.type !== 'ONLINE_BATTLE_START') throw new Error('Missing start');
  const canonical = battleA.snapshot;
  expect(canonical.units[0].beastId === 'beast-a', 'Committed formation cannot be overwritten');
  expect(canonical.enemies[0].currentHp === 50, 'TeamB persistent HP preserved');
  expect(canonical.units[0].unitId !== canonical.enemies[0].enemyId, 'Same local IDs are namespaced by owner');
  const bobView = onlinePerspective(canonical, 'TeamB');
  expect(bobView.units[0].beastId === 'beast-b' && bobView.enemies[0].beastId === 'beast-a', 'Bob sees himself left and Alice right');
  expect(bobView.units[0].positionX === -canonical.enemies[0].positionX, 'Bob view mirrors positions');
  const roundTrip = onlinePerspective(bobView, 'TeamB');
  expect(roundTrip.units[0].unitId === canonical.units[0].unitId && roundTrip.enemies[0].enemyId === canonical.enemies[0].enemyId, 'Perspective round-trip retains canonical IDs');
  expect(room.receiveCommand('bob', { type: 'CastTacticalEnergy', energyId: 'energy-a', tick: 0, teamId: 'TeamA' }), 'Bob can spend his authoritative Energy');
  const result = room.step(SIMULATION_STEP)!;
  expect(result.snapshot.enemies[0].currentHp > 50, 'Bob heal targets Bob, even with spoofed command team');
  expect(result.snapshot.units[0].currentHp === canonical.units[0].currentHp, 'Bob heal cannot heal Alice');
  expect(!room.receiveCommand('bob', { type: 'CastTacticalEnergy', energyId: 'energy-a', tick: 1 }), 'Consumed charge cannot replay');
  expect(messagesB.some(message => message.type === 'ENERGY_INVENTORY' && message.entries.length === 0), 'Server confirms remaining Energy');
  room.receiveCommand('bob', { type: 'Surrender', tick: 2, teamId: 'TeamA' });
  const ended = room.step(SIMULATION_STEP)!;
  expect(String(room.state) === 'ENDED', 'Surrender ends match');
  expect(onlinePerspective(ended.snapshot, 'TeamA').status === 'Win' && onlinePerspective(ended.snapshot, 'TeamB').status === 'Lose', 'Opposite relative results');
  expect(messagesA.some(message => message.type === 'MATCH_END' && message.winnerTeamId === 'TeamA'), 'Winner broadcast authoritative');
  const count = messagesA.filter(message => message.type === 'ONLINE_BATTLE_START').length;
  room.deployFormation('alice', [beastA]);
  expect(messagesA.filter(message => message.type === 'ONLINE_BATTLE_START').length === count, 'Late deploy cannot restart battle');
  manager.removeRoom(room.roomId);
  expect(manager.getRoom(room.roomId) === undefined, 'Room disposal');

  // Verify injectable scheduler for P2P-01.1
  let timerCb: (() => void) | undefined;
  let intervalCb: (() => void) | undefined;
  let clearedTimeout = false;
  let clearedInterval = false;
  const mockScheduler: RoomScheduler = {
    setTimeout: (fn) => { timerCb = fn; return 101; },
    clearTimeout: (id) => { if (id === 101) clearedTimeout = true; },
    setInterval: (fn) => { intervalCb = fn; return 202; },
    clearInterval: (id) => { if (id === 202) clearedInterval = true; },
  };
  const scheduledRoom = new BattleRoom('room-mock', 'B-9999', 'pvp', mockScheduler);
  scheduledRoom.addPlayer('p1', 'Player 1', () => {});
  scheduledRoom.addPlayer('p2', 'Player 2', () => {});
  scheduledRoom.setPlayerReady('p1', true);
  scheduledRoom.setPlayerReady('p2', true);
  expect(scheduledRoom.state === 'COUNTDOWN' && timerCb !== undefined, 'Injectable scheduler captures countdown timer');
  timerCb!();
  expect(scheduledRoom.state === 'BeastRush', 'Mock scheduler callback advances countdown');
  scheduledRoom.startTicking();
  expect(intervalCb !== undefined, 'Mock scheduler captures interval ticking');
  scheduledRoom.dispose();
  expect(clearedInterval, 'Room disposal cleans up mock scheduler interval');
}
