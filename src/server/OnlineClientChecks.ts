import { WebSocket, WebSocketServer } from 'ws';
import { GameServer } from './GameServer';
import { WebSocketClientAdapter } from '../game/network/WebSocketClientAdapter';
import { RemoteBattleController } from '../game/battle/controller/RemoteBattleController';
import type { DeployedFormationUnit, MatchStartMessage } from '../network/protocol/NetworkMessages';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Online client check failed: ${message}`);
}
async function until(predicate: () => boolean, label: string): Promise<void> {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Timed out: ${label}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
async function check(): Promise<void> {
  const original = globalThis.WebSocket;
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
  const server = new GameServer();
  const externalUrl = process.env.ONLINE_CHECK_SERVER_URL;
  let a: WebSocketClientAdapter | undefined;
  let b: WebSocketClientAdapter | undefined;
  try {
    if (!externalUrl) {
      const legacy = new WebSocketServer({ port: 0 });
      await new Promise<void>(resolve => legacy.once('listening', resolve));
      legacy.on('connection', socket => socket.on('message', () => socket.send(JSON.stringify({ type: 'ROOM_JOINED', roomCode: 'B-0000', playerId: 'old', teamId: 'TeamA', mode: 'pvp' }))));
      const address = legacy.address();
      const legacyAdapter = new WebSocketClientAdapter(`ws://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`);
      let mismatchRejected = false;
      try { await legacyAdapter.createRoom('Version check'); }
      catch (error) { mismatchRejected = error instanceof Error && error.message.includes('phiên bản cũ'); }
      finally { legacyAdapter.disconnect(); legacy.clients.forEach(socket => socket.terminate()); await new Promise<void>(resolve => legacy.close(() => resolve())); }
      expect(mismatchRejected, 'Old server fails clearly in lobby instead of hanging at phase barrier');
      await server.start(0);
    }
    const url = externalUrl ?? `ws://127.0.0.1:${server.port}`;
    a = new WebSocketClientAdapter(url);
    b = new WebSocketClientAdapter(url);
    const alice = a;
    const bob = b;
    const joinedA = await alice.createRoom('Alice');
    await bob.joinRoom(joinedA.roomCode, 'Bob');
    expect(alice.teamId === 'TeamA' && bob.teamId === 'TeamB', 'Adapters retain local team');
    let startA: MatchStartMessage | undefined;
    let startB: MatchStartMessage | undefined;
    alice.onMatchStart(message => { startA = message; });
    bob.onMatchStart(message => { startB = message; });
    alice.setReady(true); bob.setReady(true);
    await until(() => Boolean(startA && startB), 'match preparation');
    expect(startA!.seed === startB!.seed, 'Common seed across real sockets');
    const room = server.roomManager.getRoomByCode(joinedA.roomCode);
    if (room) expect(room.state === 'BeastRush', 'Server still preparing after match message');
    alice.preparationReady('BeastRush');
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(bob.preparationPhase === 'BeastRush', 'One client cannot advance the other prematurely');
    bob.preparationReady('BeastRush');
    await until(() => alice.preparationPhase === 'EnergyRush' && bob.preparationPhase === 'EnergyRush', 'shared EnergyRush');
    alice.preparationReady('EnergyRush'); bob.preparationReady('EnergyRush');
    await until(() => alice.preparationPhase === 'BattleSetup' && bob.preparationPhase === 'BattleSetup', 'shared Setup');
    const unitA: DeployedFormationUnit = { unitId: 'same-id', beastId: 'beast-a', role: 'Tanker', star: 2, slotId: 'front-1', row: 'Front', column: 1, maxHp: 400, currentHp: 200, damage: 10 };
    const unitB: DeployedFormationUnit = { ...unitA, beastId: 'beast-c', role: 'Ranger', star: 1, slotId: 'back-2', row: 'Back', column: 2, maxHp: 200, currentHp: 100 };
    alice.deployFormation([unitA], false);
    bob.deployFormation([unitB], false);
    await until(() => Boolean(alice.opponentFormation && bob.opponentFormation), 'formation previews');
    expect(alice.opponentFormation!.units[0].beastId === 'beast-c' && alice.opponentFormation!.units[0].column === 2, 'Alice sees Bob Beast and placement');
    expect(bob.opponentFormation!.units[0].beastId === 'beast-a' && !bob.opponentFormation!.ready, 'Bob sees Alice preview before commit');
    const controllerA = new RemoteBattleController(startA!.initialSnapshot, alice);
    const controllerB = new RemoteBattleController(startB!.initialSnapshot, bob);
    let enteredA = false;
    let enteredB = false;
    alice.onOnlineBattleStart(() => { enteredA = controllerA.currentSnapshot.units[0]?.beastId === 'beast-a'; });
    bob.onOnlineBattleStart(() => { enteredB = controllerB.currentSnapshot.units[0]?.beastId === 'beast-c'; });
    alice.deployFormation([unitA], true, [{ energyId: 'energy-a', charges: 1 }]);
    bob.deployFormation([unitB], true, [{ energyId: 'energy-a', charges: 1 }]);
    await until(() => enteredA && enteredB, 'snapshot committed before Battle start callbacks');
    expect(controllerB.currentSnapshot.enemies[0].beastId === 'beast-a', 'Bob sees opponent Beast in combat');
    expect(controllerA.currentSnapshot.enemies[0].currentHp === 100, 'Bob HP preserved on Alice view');
    let energyB: number | undefined;
    bob.onEnergyInventory(message => { energyB = message.entries.reduce((sum, entry) => sum + entry.charges, 0); });
    controllerB.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-a' });
    await until(() => energyB === 0 && controllerB.currentSnapshot.units[0].currentHp > 100, 'Bob Energy consumption and own-team heal');
    await until(() => controllerA.currentSnapshot.elapsedTicks === controllerB.currentSnapshot.elapsedTicks && controllerA.currentSnapshot.elapsedTicks > 0, 'matching authoritative ticks');
    expect(controllerA.currentSnapshot.enemies[0].currentHp === controllerB.currentSnapshot.units[0].currentHp, 'Same body HP in both perspectives');
    let statusA = '';
    let statusB = '';
    controllerA.onStatus(status => { statusA = status; });
    controllerB.onStatus(status => { statusB = status; });
    controllerB.sendCommand({ type: 'Surrender', tick: controllerB.currentSnapshot.elapsedTicks });
    await until(() => statusA === 'Win' && statusB === 'Lose', 'opposite results through actual adapters');
    expect(controllerA.currentSnapshot.status === 'Win' && controllerB.currentSnapshot.status === 'Lose', 'Snapshot status matches match-end status');
    controllerA.dispose(); controllerB.dispose();
    console.log('Two-client WebSocket phase, formation, perspective, HP, Energy and result checks passed.');
  } finally {
    a?.disconnect(); b?.disconnect();
    await server.stop();
    globalThis.WebSocket = original;
  }
}
void check().catch(error => { console.error(error); process.exitCode = 1; });
