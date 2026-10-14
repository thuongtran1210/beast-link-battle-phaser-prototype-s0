import { PeerSessionAdapter } from '../../game/network/PeerSessionAdapter';
import { RemoteBattleController } from '../../game/battle/controller/RemoteBattleController';
import { ONLINE_PROTOCOL_VERSION } from '../protocol/NetworkMessages';
import type {
  RoomUpdateMessage,
  MatchStartMessage,
  OnlineBattleStartMessage,
  DeployedFormationUnit,
} from '../protocol/NetworkMessages';
import { BattleRoom, type RoomScheduler } from '../room/BattleRoom';
import { SIMULATION_STEP } from '../../game/battle/BattleConfig';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`P2P Check Failed: ${message}`);
}

class MockDataConnection {
  open = false;
  peer: string;
  remotePeer: string;
  private listeners = new Map<string, Array<(...args: any[]) => void>>();
  pairedConnection?: MockDataConnection;
  dataChannel = {
    bufferedAmount: 0,
  };

  constructor(peer: string, remotePeer: string) {
    this.peer = peer;
    this.remotePeer = remotePeer;
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  send(data: any): void {
    if (!this.open) return;
    setTimeout(() => {
      if (this.pairedConnection && this.pairedConnection.open) {
        this.pairedConnection.emit('data', data);
      }
    }, 5);
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.emit('close');
    if (this.pairedConnection && this.pairedConnection.open) {
      this.pairedConnection.open = false;
      this.pairedConnection.emit('close');
    }
  }
}

class MockPeer {
  id: string;
  destroyed = false;
  private listeners = new Map<string, Array<(...args: any[]) => void>>();
  static registry = new Map<string, MockPeer>();

  constructor(id?: string) {
    this.id = id ?? `peer-${Math.random().toString(36).slice(2, 8)}`;
    MockPeer.registry.set(this.id, this);
    setTimeout(() => {
      this.emit('open', this.id);
    }, 1);
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  connect(targetId: string, options?: any): MockDataConnection {
    const targetPeer = MockPeer.registry.get(targetId);
    const localConn = new MockDataConnection(targetId, this.id);

    if (!targetPeer || targetPeer.destroyed) {
      setTimeout(() => {
        localConn.emit('error', new Error(`Could not connect to peer ${targetId}`));
        this.emit('error', { type: 'peer-unavailable', message: `Peer ${targetId} not found.` });
      }, 5);
      return localConn;
    }

    const remoteConn = new MockDataConnection(this.id, targetId);
    localConn.pairedConnection = remoteConn;
    remoteConn.pairedConnection = localConn;

    setTimeout(() => {
      targetPeer.emit('connection', remoteConn);
      remoteConn.open = true;
      remoteConn.emit('open');

      localConn.open = true;
      localConn.emit('open');
    }, 5);

    return localConn;
  }

  destroy(): void {
    this.destroyed = true;
    MockPeer.registry.delete(this.id);
    this.emit('close');
  }
}

async function until(predicate: () => boolean, label: string, timeoutMs = 3000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export async function runPeerSessionChecks(): Promise<void> {
  MockPeer.registry.clear();

  const mockFactory = (id?: string) => new MockPeer(id);

  // 1. Normal connection flow between Host and Guest (P2P-01.2)
  let timerCb: (() => void) | undefined;
  const mockScheduler: RoomScheduler = {
    setTimeout: (fn: () => void) => { timerCb = fn; return 100; },
    clearTimeout: () => {},
    setInterval: (fn: () => void, ms: number) => setInterval(fn, ms),
    clearInterval: (id: any) => clearInterval(id),
  };

  const host = new PeerSessionAdapter({
    peerId: 'host-alice',
    peerFactory: mockFactory,
    scheduler: mockScheduler,
  });
  const joinedHost = await host.createRoom('Alice');
  expect(joinedHost.type === 'ROOM_JOINED', 'Host successfully created room');
  expect(joinedHost.teamId === 'TeamA', 'Host assigned TeamA');
  expect(host.isHost === true, 'Host state isHost is true');
  expect(host.roomCode === 'host-alice', 'RoomCode matches host peer ID');

  const inviteLink = host.getInviteLink('http://localhost:5173/');
  expect(inviteLink.includes('?room=host-alice'), 'Invite link formatted with room query param');

  const guest = new PeerSessionAdapter({ peerId: 'guest-bob', peerFactory: mockFactory });
  let guestUpdate: RoomUpdateMessage | undefined;
  guest.onRoomUpdate((update) => {
    guestUpdate = update;
  });

  const joinedGuest = await guest.joinRoom('host-alice', 'Bob');
  expect(joinedGuest.type === 'ROOM_JOINED', 'Guest successfully joined room');
  expect(joinedGuest.teamId === 'TeamB', 'Guest assigned TeamB');
  expect(guest.isHost === false, 'Guest state isHost is false');

  await until(() => guestUpdate !== undefined && guestUpdate.players.length === 2, '2 players in room update');
  expect(guestUpdate!.players.some((p) => p.playerName === 'Alice' && p.teamId === 'TeamA'), 'Alice in room update');
  expect(guestUpdate!.players.some((p) => p.playerName === 'Bob' && p.teamId === 'TeamB'), 'Bob in room update');

  // --- STAGE P2P-01.3: Preparation / Preview / Commit over P2P ---

  // 1a. Ready & Countdown & Common Seed
  let startHost: MatchStartMessage | undefined;
  let startGuest: MatchStartMessage | undefined;
  host.onMatchStart((msg) => { startHost = msg; });
  guest.onMatchStart((msg) => { startGuest = msg; });

  host.setReady(true);
  guest.setReady(true);
  await until(() => timerCb !== undefined, 'Countdown timer started upon both ready');
  timerCb!(); // Complete countdown immediately via mock scheduler

  await until(() => startHost !== undefined && startGuest !== undefined, 'Both received MATCH_START');
  expect(startHost!.seed === startGuest!.seed && typeof startHost!.seed === 'number', 'Common seed across Host and Guest');
  expect(host.preparationPhase === 'BeastRush' && guest.preparationPhase === 'BeastRush', 'Both start in BeastRush');

  // 1b. Phase Barrier (Fast player waits for slow player & duplicate/wrong phase ignored)
  host.preparationReady('BeastRush');
  // Duplicate ready
  host.preparationReady('BeastRush');
  // Wrong phase attempt
  guest.preparationReady('EnergyRush');
  await new Promise((r) => setTimeout(r, 20));
  expect(guest.preparationPhase === 'BeastRush', 'Fast player waits for peer, wrong phase ignored');

  guest.preparationReady('BeastRush');
  await until(() => host.preparationPhase === 'EnergyRush' && guest.preparationPhase === 'EnergyRush', 'Both advance to EnergyRush together');

  guest.preparationReady('EnergyRush');
  await new Promise((r) => setTimeout(r, 20));
  expect(host.preparationPhase === 'EnergyRush', 'Guest waiting for host in EnergyRush');

  host.preparationReady('EnergyRush');
  await until(() => host.preparationPhase === 'BattleSetup' && guest.preparationPhase === 'BattleSetup', 'Both advance to BattleSetup together');

  // 1c. Formation Preview: Placement across all 6 columns and unit removal
  // Host previews unit on Column 1
  const unitA: DeployedFormationUnit = {
    unitId: 'unit-local-1',
    beastId: 'beast-a',
    role: 'Tanker',
    star: 2,
    slotId: 'front-1',
    row: 'Front',
    column: 1,
    maxHp: 400,
    currentHp: 250,
    damage: 15,
  };
  host.deployFormation([unitA], false);
  await until(() => guest.opponentFormation !== undefined && guest.opponentFormation.units.length === 1, 'Guest sees Host preview');
  expect(guest.opponentFormation!.units[0].beastId === 'beast-a', 'Guest sees Beast A');
  expect(guest.opponentFormation!.units[0].column === 1, 'Guest sees column 1');
  expect(guest.opponentFormation!.units[0].star === 2, 'Guest sees 2 stars');
  expect(guest.opponentFormation!.ready === false, 'Preview is not ready');

  // Guest previews unit on Column 6 (testing boundaries and same local unitId)
  const unitB: DeployedFormationUnit = {
    unitId: 'unit-local-1', // same local unitId to verify namespacing
    beastId: 'beast-c',
    role: 'Ranger',
    star: 1,
    slotId: 'back-6',
    row: 'Back',
    column: 6,
    maxHp: 200,
    currentHp: 100,
    damage: 25,
  };
  guest.deployFormation([unitB], false);
  await until(() => host.opponentFormation !== undefined && host.opponentFormation.units.length === 1, 'Host sees Guest preview');
  expect(host.opponentFormation!.units[0].beastId === 'beast-c', 'Host sees Beast C');
  expect(host.opponentFormation!.units[0].column === 6, 'Host sees column 6');
  expect(host.opponentFormation!.ready === false, 'Guest preview is not ready');

  // Host tests unit removal (empty formation preview)
  host.deployFormation([], false);
  await until(() => guest.opponentFormation!.units.length === 0, 'Guest sees Host removed units');
  expect(guest.opponentFormation!.ready === false, 'Removed preview not ready');

  // Host puts unitA back
  host.deployFormation([unitA], false);
  await until(() => guest.opponentFormation!.units.length === 1, 'Host unit restored');

  // 1d. Commit Lock & Battle Controllers
  const controllerHost = new RemoteBattleController(startHost!.initialSnapshot, host);
  const controllerGuest = new RemoteBattleController(startGuest!.initialSnapshot, guest);

  let enteredHost = false;
  let enteredGuest = false;
  host.onOnlineBattleStart(() => {
    enteredHost = controllerHost.currentSnapshot.units[0]?.beastId === 'beast-a';
  });
  guest.onOnlineBattleStart(() => {
    enteredGuest = controllerGuest.currentSnapshot.units[0]?.beastId === 'beast-c';
  });

  let battleStartHost: OnlineBattleStartMessage | undefined;
  let battleStartGuest: OnlineBattleStartMessage | undefined;
  host.onOnlineBattleStart((msg) => { battleStartHost = msg; });
  guest.onOnlineBattleStart((msg) => { battleStartGuest = msg; });

  // Host commits formation with tactical energy
  host.deployFormation([unitA], true, [{ energyId: 'energy-a', charges: 1 }]);
  await until(() => guest.opponentFormation!.ready === true, 'Guest sees Host committed');
  expect(battleStartHost === undefined, 'Battle has not started while Guest has not committed');

  // Host attempts late change after commit (must be locked / ignored)
  host.deployFormation([{ ...unitA, beastId: 'beast-d' }], true);

  // Guest commits formation
  guest.deployFormation([unitB], true, [{ energyId: 'energy-a', charges: 1 }]);
  await until(() => battleStartHost !== undefined && battleStartGuest !== undefined, 'Both receive ONLINE_BATTLE_START');

  // Verify authoritative snapshot and dispatch order (snapshot listeners ran before battle start listeners)
  await until(() => enteredHost && enteredGuest, 'initial battle snapshot committed before online battle start callbacks');
  const hostSnapshot = battleStartHost!.snapshot;
  expect(hostSnapshot.units[0].beastId === 'beast-a', 'Host unit locked and not altered by late deploy');
  expect(hostSnapshot.enemies[0].beastId === 'beast-c', 'Guest unit correctly included');
  expect(hostSnapshot.units[0].unitId !== hostSnapshot.enemies[0].enemyId, 'Namespaced IDs prevent local ID collision');
  expect(controllerGuest.currentSnapshot.enemies[0].beastId === 'beast-a', 'Guest sees Host beast in combat');
  expect(controllerHost.currentSnapshot.enemies[0].currentHp === 100, 'Host sees Guest unit HP');

  // --- STAGE P2P-01.4: Authoritative Battle over P2P ---
  let guestEnergyCharges: number | undefined;
  guest.onEnergyInventory((msg) => {
    guestEnergyCharges = msg.entries.reduce((sum, entry) => sum + entry.charges, 0);
  });

  // Guest casts Tactical Energy (energy-a: heal)
  controllerGuest.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-a' });
  await until(() => guestEnergyCharges === 0 && controllerGuest.currentSnapshot.units[0].currentHp > 100, 'Guest energy consumed and unit healed');

  // Verify authoritative ticks advance on both Host and Guest
  await until(
    () => controllerHost.currentSnapshot.elapsedTicks === controllerGuest.currentSnapshot.elapsedTicks && controllerHost.currentSnapshot.elapsedTicks > 0,
    'Authoritative battle ticks match across Host and Guest',
  );

  // Symmetrical perspective HP check
  expect(
    controllerHost.currentSnapshot.enemies[0].currentHp === controllerGuest.currentSnapshot.units[0].currentHp,
    'Symmetric unit HP across Host and Guest perspectives',
  );

  // Stale tick drop check
  const currentTick = controllerGuest.currentSnapshot.elapsedTicks;
  let droppedTickListenerFired = false;
  const unsubDrop = guest.onSnapshot((s) => {
    if (s.elapsedTicks < currentTick) droppedTickListenerFired = true;
  });
  // Simulate an older packet arriving
  (guest as any).handleServerMessage({
    type: 'BATTLE_TICK',
    tick: currentTick - 1,
    snapshot: (guest as any).room ? (guest as any).room.snapshot : controllerGuest.currentSnapshot,
    events: [],
  });
  unsubDrop();
  expect(!droppedTickListenerFired, 'Stale/out-of-order tick dropped by PeerSessionAdapter');

  // Duplicate command rejection check: replay attempt ignored
  controllerGuest.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-a' });
  expect(guestEnergyCharges === 0, 'Duplicate command cannot replay consumed charges');

  // Terminal state: Surrender from Guest
  let statusHost = '';
  let statusGuest = '';
  controllerHost.onStatus((status) => { statusHost = status; });
  controllerGuest.onStatus((status) => { statusGuest = status; });

  controllerGuest.sendCommand({ type: 'Surrender', tick: controllerGuest.currentSnapshot.elapsedTicks });
  await until(() => statusHost === 'Win' && statusGuest === 'Lose', 'Opposite terminal results on surrender');
  expect(controllerHost.currentSnapshot.status === 'Win' && controllerGuest.currentSnapshot.status === 'Lose', 'Snapshot terminal status matches match end');

  controllerHost.dispose();
  controllerGuest.dispose();
  guest.disconnect();
  host.disconnect();

  // 2. Room full rejection (new room for rejection tests)
  const host2 = new PeerSessionAdapter({ peerId: 'host-alice-2', peerFactory: mockFactory });
  await host2.createRoom('Alice');

  const guest2 = new PeerSessionAdapter({ peerId: 'guest-bob-2', peerFactory: mockFactory });
  await guest2.joinRoom('host-alice-2', 'Bob');

  const thirdPeer = new PeerSessionAdapter({ peerId: 'guest-charlie', peerFactory: mockFactory });
  let roomFullError: Error | undefined;
  try {
    await thirdPeer.joinRoom('host-alice-2', 'Charlie');
  } catch (err: any) {
    roomFullError = err;
  }
  expect(
    roomFullError !== undefined &&
      (roomFullError.message.includes('ROOM_FULL') || roomFullError.message.includes('đủ người chơi')),
    'Third player rejected when room is full',
  );
  thirdPeer.disconnect();

  // 3. Link sai / Peer not found error
  const invalidPeer = new PeerSessionAdapter({ peerId: 'guest-david', peerFactory: mockFactory });
  let notFoundError: Error | undefined;
  try {
    await invalidPeer.joinRoom('non-existent-peer-id', 'David');
  } catch (err: any) {
    notFoundError = err;
  }
  expect(
    notFoundError !== undefined &&
      (notFoundError.message.includes('peer-unavailable') || notFoundError.message.includes('PEER_CONNECTION_ERROR')),
    'Invalid peer ID fails with clear connection error',
  );
  invalidPeer.disconnect();

  // 4. Timeout rejection
  const hangingPeerFactory = (id?: string) => {
    const peer = new MockPeer(id);
    // Override connect to never open
    peer.connect = () => {
      const conn = new MockDataConnection('hanging', id ?? '');
      return conn;
    };
    return peer;
  };

  const timeoutGuest = new PeerSessionAdapter({
    peerId: 'guest-timeout',
    peerFactory: hangingPeerFactory,
    connectTimeoutMs: 150,
  });

  let timeoutError: Error | undefined;
  try {
    await timeoutGuest.joinRoom('host-alice-2', 'TimeoutTester');
  } catch (err: any) {
    timeoutError = err;
  }
  expect(
    timeoutError !== undefined && timeoutError.message.includes('CONNECTION_TIMEOUT'),
    'Hanging connection triggers clear timeout rejection',
  );
  timeoutGuest.disconnect();

  // 5. Version mismatch rejection
  const oldClient = new PeerSessionAdapter({
    peerId: 'guest-old',
    peerFactory: mockFactory,
    protocolVersion: 99999,
  });

  // Free guest2 so the room has space
  guest2.disconnect();
  await until(() => host2.isConnected, 'host2 still open');

  let versionError: Error | undefined;
  try {
    await oldClient.joinRoom('host-alice-2', 'OldClient');
  } catch (err: any) {
    versionError = err;
  }
  expect(
    versionError !== undefined &&
      (versionError.message.includes('VERSION_MISMATCH') || versionError.message.includes('không tương thích')),
    'Mismatched protocol version rejected with clear error',
  );
  oldClient.disconnect();

  // 6. Clean dispose / disconnect
  host2.disconnect();
  expect(!host2.isConnected, 'Host properly disconnected and cleaned up');

  // --- STAGE P2P-01.5: Interruption, Visibility, Backpressure, Cleanup ---
  const instantScheduler: RoomScheduler = {
    setTimeout: (fn: () => void) => {
      setTimeout(fn, 5);
      return 1;
    },
    clearTimeout: () => {},
    setInterval: (fn: () => void, ms: number) => setInterval(fn, ms),
    clearInterval: (id: any) => clearInterval(id),
  };

  // 7a. Abort during Preparation Phase (Guest disconnects in BeastRush)
  const host3 = new PeerSessionAdapter({
    peerId: 'host-alice-3',
    peerFactory: mockFactory,
    scheduler: instantScheduler,
  });
  await host3.createRoom('Alice');
  const guest3 = new PeerSessionAdapter({ peerId: 'guest-bob-3', peerFactory: mockFactory });
  await guest3.joinRoom('host-alice-3', 'Bob');

  let host3Error: any;
  host3.onError((err) => { host3Error = err; });

  let host3MatchStarted = false;
  host3.onMatchStart(() => { host3MatchStarted = true; });

  host3.setReady(true);
  guest3.setReady(true);
  await until(() => host3MatchStarted, 'Host3 entered BeastRush after countdown');

  // Guest disconnects mid-preparation
  guest3.disconnect();
  await until(() => host3Error !== undefined && host3Error.code === 'OPPONENT_LEFT', 'Host informed cleanly of OPPONENT_LEFT during preparation');
  host3.disconnect();

  // 7b. Disconnect / Forfeit during Battle
  const host4 = new PeerSessionAdapter({
    peerId: 'host-alice-4',
    peerFactory: mockFactory,
    scheduler: instantScheduler,
  });
  await host4.createRoom('Alice');
  const guest4 = new PeerSessionAdapter({ peerId: 'guest-bob-4', peerFactory: mockFactory });
  await guest4.joinRoom('host-alice-4', 'Bob');

  let host4BattleStarted = false;
  host4.onOnlineBattleStart(() => { host4BattleStarted = true; });

  let host4MatchStarted = false;
  host4.onMatchStart(() => { host4MatchStarted = true; });

  host4.setReady(true);
  guest4.setReady(true);
  await until(() => host4MatchStarted, 'Host4 countdown completed');
  host4.preparationReady('BeastRush');
  guest4.preparationReady('BeastRush');
  await until(() => host4.preparationPhase === 'EnergyRush', 'Energy phase');
  host4.preparationReady('EnergyRush');
  guest4.preparationReady('EnergyRush');
  await until(() => host4.preparationPhase === 'BattleSetup', 'Setup phase');

  host4.deployFormation([unitA], true);
  guest4.deployFormation([unitB], true);
  await until(() => host4BattleStarted, 'Battle started on host4');

  let host4MatchEndStatus = '';
  host4.onStatus((st) => { host4MatchEndStatus = st; });

  // Guest unexpectedly disconnects during Battle
  guest4.disconnect();
  await until(() => host4MatchEndStatus === 'Win', 'Host awarded Win on guest disconnect during Battle');
  host4.disconnect();

  // 7c. Backpressure: Throttling tick snapshots when data channel bufferedAmount is saturated
  const host5 = new PeerSessionAdapter({ peerId: 'host-alice-5', peerFactory: mockFactory });
  await host5.createRoom('Alice');
  const guest5 = new PeerSessionAdapter({ peerId: 'guest-bob-5', peerFactory: mockFactory });
  await guest5.joinRoom('host-alice-5', 'Bob');

  // Grab guest connection from host5
  const guestConn = (host5 as any).guestConnection as MockDataConnection;
  expect(guestConn !== undefined, 'Host holds guest connection');

  let receivedTicksOnGuest = 0;
  let receivedInventoryOnGuest = 0;
  guest5.onSnapshot(() => { receivedTicksOnGuest++; });
  guest5.onEnergyInventory(() => { receivedInventoryOnGuest++; });

  // Simulate high buffered amount on data channel (> 65536)
  guestConn.dataChannel.bufferedAmount = 70000;

  // Have host room broadcast a BATTLE_TICK and an ENERGY_INVENTORY
  (host5 as any).room.broadcast({
    type: 'BATTLE_TICK',
    tick: 99,
    snapshot: hostSnapshot,
    events: [],
  });
  (host5 as any).room.broadcast({
    type: 'ENERGY_INVENTORY',
    entries: [{ energyId: 'energy-a', charges: 1 }],
  });

  await new Promise((r) => setTimeout(r, 20));
  expect(receivedTicksOnGuest === 0, 'Tick snapshot dropped due to backpressure (>64KB buffer)');
  expect(receivedInventoryOnGuest === 1, 'Critical non-tick message preserved despite backpressure');

  // Clear buffer backpressure
  guestConn.dataChannel.bufferedAmount = 0;
  (host5 as any).room.broadcast({
    type: 'BATTLE_TICK',
    tick: 100,
    snapshot: hostSnapshot,
    events: [],
  });
  await until(() => receivedTicksOnGuest === 1, 'Tick snapshot delivered when buffer clears');

  guest5.disconnect();
  host5.disconnect();

  console.log('P2P connection, preparation phases, preview, commit lock, version mismatch, room full, timeout, interruption, backpressure and dispose checks passed.');
}

async function runReviewRegressionChecks(): Promise<void> {
  const factory = (id?: string) => new MockPeer(id);
  const mustReject = async (promise: Promise<unknown>, label: string) => {
    let failed = false;
    try { await promise; } catch { failed = true; }
    expect(failed, label);
  };
  const neverOpen = new PeerSessionAdapter({ peerFactory: id => {
    const peer = new MockPeer(id);
    const originalOn = peer.on.bind(peer);
    peer.on = (event, listener) => { if (event !== 'open') originalOn(event, listener); };
    return peer;
  }, connectTimeoutMs: 30 });
  await mustReject(neverOpen.createRoom('Timeout'), 'Signaling initialization has a deadline');
  neverOpen.disconnect();
  const partialHandshake = new PeerSessionAdapter({ peerFactory: id => {
    const peer = new MockPeer(id);
    peer.connect = () => {
      const conn = new MockDataConnection('no-join', id ?? '');
      setTimeout(() => { conn.open = true; conn.emit('open'); conn.emit('data', { type: 'PONG', timestamp: 0 }); }, 5);
      return conn;
    };
    return peer;
  }, connectTimeoutMs: 40 });
  await mustReject(partialHandshake.joinRoom('missing-handshake', 'Guest'), 'Early packet cannot cancel handshake deadline');
  partialHandshake.disconnect();
  const closedHandshake = new PeerSessionAdapter({ peerFactory: id => {
    const peer = new MockPeer(id);
    peer.connect = () => {
      const conn = new MockDataConnection('closing', id ?? '');
      setTimeout(() => { conn.open = true; conn.emit('open'); conn.close(); }, 5);
      return conn;
    };
    return peer;
  } });
  await mustReject(closedHandshake.joinRoom('closing', 'Guest'), 'Close before joined settles pending promise');
  closedHandshake.disconnect();
  const disposed = new PeerSessionAdapter({ peerFactory: factory });
  const initializing = disposed.connect();
  disposed.disconnect();
  await mustReject(initializing, 'Dispose during initialization rejects pending operation');

  let countdown: (() => void) | undefined;
  const scheduler: RoomScheduler = {
    setTimeout: fn => { countdown = fn; return 1; }, clearTimeout: () => {},
    setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: id => clearInterval(id),
  };
  const host = new PeerSessionAdapter({ peerId: 'review-host', peerFactory: factory, scheduler });
  const guest = new PeerSessionAdapter({ peerId: 'review-guest', peerFactory: factory });
  try {
    await host.createRoom('Host'); await guest.joinRoom('review-host', 'Guest');
    let match: MatchStartMessage | undefined;
    host.onMatchStart(message => { match = message; });
    host.setReady(true); guest.setReady(true);
    await until(() => Boolean(countdown), 'Review countdown'); countdown!();
    await until(() => Boolean(match), 'Review match identity');
    host.preparationReady('BeastRush'); guest.preparationReady('BeastRush');
    await until(() => guest.preparationPhase === 'EnergyRush', 'Review Energy phase');
    host.preparationReady('EnergyRush'); guest.preparationReady('EnergyRush');
    await until(() => guest.preparationPhase === 'BattleSetup', 'Review Setup phase');
    const a: DeployedFormationUnit = { unitId: 'a', beastId: 'beast-a', role: 'Tanker', star: 3, slotId: 'front-1', row: 'Front', column: 1, maxHp: 1000, currentHp: 500, damage: 1 };
    const b: DeployedFormationUnit = { ...a, unitId: 'b' };
    const controller = new RemoteBattleController(match!.initialSnapshot, guest);
    host.deployFormation([a], true);
    guest.deployFormation([b], true, [{ energyId: 'energy-c', charges: 3 }]);
    await until(() => controller.currentSnapshot.units.length === 1, 'Review real initial state');
    const room = (host as any).room;
    room.stopTicking();
    let charges = 3;
    guest.onEnergyInventory(message => { charges = message.entries.reduce((sum, entry) => sum + entry.charges, 0); });
    guest.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-c', commandId: 'first' });
    await until(() => charges === 2, 'First command acknowledged');
    let rejectedMessages = 0;
    guest.onError(error => { if (error.code === 'COMMAND_REJECTED') rejectedMessages++; });
    guest.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-c', commandId: 'first' });
    // Same ordered channel: second distinct ID acknowledges only after replay is processed.
    guest.sendCommand({ type: 'CastTacticalEnergy', tick: 0, energyId: 'energy-c', commandId: 'second' });
    await until(() => charges === 1, 'Two distinct IDs in same tick both accepted, replay not spent');
    expect(rejectedMessages === 0, 'Replay is ignored without rejecting valid second command');
    let snapshots = 0;
    guest.onSnapshot(() => { snapshots++; });
    const packet = { type: 'BATTLE_TICK', matchId: match!.matchId, tick: 50, snapshot: controller.currentSnapshot, events: [] };
    (guest as any).handleServerMessage(packet);
    (guest as any).handleServerMessage(packet);
    (guest as any).handleServerMessage({ ...packet, tick: 51, matchId: 'other-match' });
    expect(snapshots === 1, 'Duplicate tick and foreign match do not dispatch twice');
    const conn = (host as any).guestConnection as MockDataConnection;
    conn.dataChannel.bufferedAmount = 70000;
    let terminalBeforeStatus = false;
    guest.onStatus(status => { if (status === 'Win') terminalBeforeStatus = controller.currentSnapshot.status === 'Win'; });
    host.sendCommand({ type: 'Surrender', tick: 0 }); room.step();
    await until(() => terminalBeforeStatus, 'Terminal snapshot preserved under backpressure before result');
    controller.dispose();
  } finally { guest.disconnect(); host.disconnect(); }
  console.log('Review R2/R3/R5 regressions passed: signaling/handshake deadlines, close/dispose settlement, command identities, terminal state under backpressure.');

  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const windowHandlers = new Map<string, () => void>();
  const documentHandlers = new Map<string, () => void>();
  const fakeDocument = { hidden: false,
    addEventListener: (name: string, handler: () => void) => documentHandlers.set(name, handler),
    removeEventListener: (name: string) => documentHandlers.delete(name) };
  globalThis.window = { addEventListener: (name: string, handler: () => void) => windowHandlers.set(name, handler), removeEventListener: (name: string) => windowHandlers.delete(name) } as unknown as Window & typeof globalThis;
  globalThis.document = fakeDocument as unknown as Document;
  const backgroundHost = new PeerSessionAdapter({ peerId: 'hidden-host', peerFactory: factory });
  try {
    await backgroundHost.createRoom('Hidden host');
    (backgroundHost as any).room.state = 'BeastRush';
    let aborted = false;
    backgroundHost.onError(error => { aborted = error.code === 'HOST_BACKGROUND'; });
    fakeDocument.hidden = true; documentHandlers.get('visibilitychange')!();
    expect(aborted && !backgroundHost.isConnected, 'Hidden host aborts preparation and closes authority');
    expect(documentHandlers.size === 0 && windowHandlers.size === 0, 'Visibility and beforeunload handlers removed');
    expect((backgroundHost as any).monitors.size === 0, 'No watchdog timers after abort');
  } finally {
    backgroundHost.disconnect(); globalThis.window = originalWindow; globalThis.document = originalDocument;
  }

  let clock = 0;
  let countdownCallback = () => {};
  let intervalCallback = () => {};
  let intervalCleared = false;
  const deterministic = new BattleRoom('clock-room', 'clock', 'pvp', {
    now: () => clock, setTimeout: fn => { countdownCallback = fn; return 1; }, clearTimeout: () => {},
    setInterval: fn => { intervalCallback = fn; return 2; }, clearInterval: () => { intervalCleared = true; },
  });
  let lastTick = 0;
  const receive = (message: any) => { if (message.type === 'BATTLE_TICK') lastTick = message.tick; };
  deterministic.addPlayer('a', 'A', receive); deterministic.addPlayer('b', 'B', () => {});
  deterministic.setPlayerReady('a', true); deterministic.setPlayerReady('b', true); countdownCallback();
  deterministic.preparationReady('a', 'BeastRush'); deterministic.preparationReady('b', 'BeastRush');
  deterministic.preparationReady('a', 'EnergyRush'); deterministic.preparationReady('b', 'EnergyRush');
  const clockUnit: DeployedFormationUnit = { unitId: 'u', beastId: 'beast-a', role: 'Tanker', star: 3, slotId: 'front-1', row: 'Front', column: 1, maxHp: 1000, currentHp: 500, damage: 1 };
  deterministic.deployFormation('a', [clockUnit]); deterministic.deployFormation('b', [clockUnit]);
  clock = SIMULATION_STEP * 1000 * 2.5; intervalCallback(); expect(lastTick === 2, 'Fractional elapsed time is retained instead of rounded');
  clock = SIMULATION_STEP * 1000 * 3; intervalCallback(); expect(lastTick === 3, 'Accumulated remainder produces next fixed tick');
  clock += SIMULATION_STEP * 1000 * 25; intervalCallback(); expect(lastTick === 13, 'Catchup work bounded to ten steps');
  intervalCallback(); expect(lastTick === 23, 'Backlog retained after catchup cap');
  intervalCallback(); expect(lastTick === 28, 'Remaining backlog drained without time loss');
  deterministic.dispose(); expect(intervalCleared, 'Injected scheduler stopped on dispose');
  const watchdogHost = new PeerSessionAdapter({ peerId: 'watchdog-host', peerFactory: factory, heartbeatTimeoutMs: 30 });
  const watchdogGuest = new PeerSessionAdapter({ peerId: 'watchdog-guest', peerFactory: factory });
  try {
    await watchdogHost.createRoom('Watchdog'); await watchdogGuest.joinRoom('watchdog-host', 'Silent peer');
    (watchdogGuest as any).hostConnection.send = () => {};
    let connectionLost = false;
    watchdogHost.onError(error => { connectionLost = error.code === 'CONNECTION_LOST'; });
    await until(() => connectionLost && !watchdogHost.isConnected && !watchdogGuest.isConnected, 'Silent peer watchdog terminates both endpoints');
    expect((watchdogHost as any).monitors.size === 0, 'Watchdog interval cleaned on timeout');
  } finally { watchdogGuest.disconnect(); watchdogHost.disconnect(); }
  console.log('Review R4 regressions passed: hidden-host abort, visibility/unload cleanup and monotonic fixed-step accumulation.');
}

void runPeerSessionChecks().then(runReviewRegressionChecks).catch((err) => {
  console.error(err);
  process.exit(1);
});
