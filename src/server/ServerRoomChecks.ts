import { RoomManager } from './RoomManager';
import { SIMULATION_STEP } from '../game/battle/BattleConfig';
import type { ServerMessage } from '../network/protocol/NetworkMessages';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ServerRoom Check Failed: ${message}`);
}

export function runServerRoomChecks(): void {
  const manager = new RoomManager();

  // Test 1: Room creation & code generation
  const room = manager.createRoom('pvp');
  expect(Boolean(room.roomId), 'roomId must be non-empty');
  expect(room.roomCode.startsWith('B-'), 'roomCode must start with B-');
  expect(manager.getRoomByCode(room.roomCode) === room, 'getRoomByCode must locate the room');

  // Test 2: Player joining & Team assignment
  const p1Messages: ServerMessage[] = [];
  const p2Messages: ServerMessage[] = [];

  const p1 = room.addPlayer('p-1', 'Player One', (msg) => p1Messages.push(msg));
  expect(p1.teamId === 'TeamA', 'First player must be assigned to TeamA');
  expect(room.playerCount === 1, 'Player count must be 1');
  expect(!room.isFull, 'Room must not be full with 1 player');

  const p2 = room.addPlayer('p-2', 'Player Two', (msg) => p2Messages.push(msg));
  expect(p2.teamId === 'TeamB', 'Second player must be assigned to TeamB');
  expect(room.playerCount === 2, 'Player count must be 2');
  expect(room.isFull, 'Room must be full with 2 players');

  // Check 3rd player rejected
  let thirdPlayerError = false;
  try {
    room.addPlayer('p-3', 'Player Three', () => {});
  } catch {
    thirdPlayerError = true;
  }
  expect(thirdPlayerError, 'Third player must be rejected when room is full');

  // Test 3: Ready state & Match Start
  expect(!room.allReady, 'allReady must be false before players set ready');
  room.setPlayerReady('p-1', true);
  expect(!room.allReady, 'allReady must be false when only p-1 is ready');

  room.setPlayerReady('p-2', true);
  expect(room.allReady, 'allReady must be true when both players are ready');

  // Start match immediately
  room.startMatch();
  expect(room.state === 'BATTLE', 'Room state must be BATTLE');

  // Check MATCH_START message was broadcasted
  const matchStartA = p1Messages.find((m) => m.type === 'MATCH_START');
  const matchStartB = p2Messages.find((m) => m.type === 'MATCH_START');
  expect(Boolean(matchStartA && matchStartB), 'Both players must receive MATCH_START');
  if (matchStartA && matchStartA.type === 'MATCH_START') {
    expect(matchStartA.seed > 0, 'Match seed must be positive');
  }

  // Test 4: Authoritative Ticking & Command Processing
  const tickRes = room.step(SIMULATION_STEP);
  expect(Boolean(tickRes), 'step() must return snapshot during BATTLE');
  expect(tickRes!.snapshot.elapsedTicks === 1, 'Elapsed ticks must advance to 1');

  // Check BATTLE_TICK was broadcasted
  const tickMsgA = p1Messages.filter((m) => m.type === 'BATTLE_TICK');
  expect(tickMsgA.length === 1, 'Player One must receive BATTLE_TICK packet');

  // Test 5: Surrender and Match End broadcast
  room.receiveCommand('p-2', {
    type: 'Surrender',
    tick: 2,
    teamId: 'TeamB',
  });

  room.step(SIMULATION_STEP);
  expect(room.state === 'ENDED', 'Room state must transition to ENDED upon surrender');

  const matchEndMsg = p1Messages.find((m) => m.type === 'MATCH_END');
  expect(Boolean(matchEndMsg), 'MATCH_END must be broadcasted on terminal state');
  if (matchEndMsg && matchEndMsg.type === 'MATCH_END') {
    expect(matchEndMsg.winnerTeamId === 'TeamA', 'TeamA must be winner when TeamB surrenders');
  }

  // Test 6: Room disposal
  manager.removeRoom(room.roomId);
  expect(manager.getRoom(room.roomId) === undefined, 'Room must be removed from RoomManager');

  // Test 7: Formation Deployment & Authoritative PvP Battle Start
  const pvpRoom = manager.createRoom('pvp');
  const p1PvpMsgs: ServerMessage[] = [];
  const p2PvpMsgs: ServerMessage[] = [];
  pvpRoom.addPlayer('pvp-1', 'Alice', (m) => p1PvpMsgs.push(m));
  pvpRoom.addPlayer('pvp-2', 'Bob', (m) => p2PvpMsgs.push(m));

  pvpRoom.deployFormation('pvp-1', [
    { unitId: 'u-1', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-1', row: 'Front', column: 1, maxHp: 100, currentHp: 100, damage: 10 },
  ]);
  const opponentReadyMsg = p2PvpMsgs.find((m) => m.type === 'OPPONENT_FORMATION_READY');
  expect(Boolean(opponentReadyMsg), 'Player 2 should receive OPPONENT_FORMATION_READY when Player 1 deploys');

  pvpRoom.deployFormation('pvp-2', [
    { unitId: 'u-2', beastId: 'beast-b', role: 'Assassin', star: 1, slotId: 'mid-1', row: 'Mid', column: 1, maxHp: 80, currentHp: 80, damage: 15 },
  ]);
  const onlineBattleStart = p1PvpMsgs.find((m) => m.type === 'ONLINE_BATTLE_START');
  expect(Boolean(onlineBattleStart), 'Both players should receive ONLINE_BATTLE_START after both deploy');
  if (onlineBattleStart && onlineBattleStart.type === 'ONLINE_BATTLE_START') {
    expect(onlineBattleStart.snapshot.enemies.length === 1, 'Enemy team should have Bob deployed beast');
    expect(onlineBattleStart.snapshot.enemies[0].beastId === 'beast-b', 'Enemy beastId must match Bob deployed unit');
  }
  manager.removeRoom(pvpRoom.roomId);
}
