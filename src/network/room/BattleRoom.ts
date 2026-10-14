import { AutonomousBattleModel } from '../../game/battle/AutonomousBattleModel';
import { BattleFormation } from '../../game/battle/BattleFormation';
import { PrngService } from '../../game/random/PrngService';
import {
  P1V13A_SIGNATURE_RULES,
  SIMULATION_STEP,
} from '../../game/battle/BattleConfig';
import type {
  GameMode,
  RoomState,
  RoomPlayerInfo,
  ServerMessage,
  DeployedFormationUnit,
  PreparationPhase,
} from '../protocol/NetworkMessages';
import type { BattleCommand } from '../../game/battle/commands/BattleCommand';
import type { BattleEvent } from '../../game/battle/events/BattleEvents';
import type { AutonomousBattleSnapshot, EnemyFixture } from '../../game/battle/BattleTypes';
import { EnergyQueue } from '../../game/energy/EnergyQueue';
import { tacticalEnergyDefinition } from '../../game/energy/TacticalEnergyCatalog';
import { roleForBeast } from '../../game/battle/BeastRoles';
import { validBattleResult } from '../../game/network/BattleResultValidation';

export interface RoomScheduler {
  now?: () => number;
  setTimeout: (fn: () => void, ms: number) => any;
  clearTimeout: (id: any) => void;
  setInterval: (fn: () => void, ms: number) => any;
  clearInterval: (id: any) => void;
}

export const defaultRoomScheduler: RoomScheduler = {
  now: () => performance.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
};

export interface PlayerConnection {
  info: RoomPlayerInfo;
  send: (msg: ServerMessage) => void;
}

export class BattleRoom {
  readonly roomId: string;
  readonly roomCode: string;
  readonly mode: GameMode;
  state: RoomState = 'WAITING';

  private scheduler: RoomScheduler;
  private players = new Map<string, PlayerConnection>();
  private playerFormations = new Map<string, DeployedFormationUnit[]>();
  private deployedPlayers = new Set<string>();
  private phaseReadyPlayers = new Set<string>();
  private energyByPlayer = new Map<string, EnergyQueue>();
  private countdownTimeout?: any;
  private battleModel?: AutonomousBattleModel;
  private prng?: PrngService;
  private matchSeed: number = 0;
  private simulationInterval?: any;
  private processedCommands = new Set<string>();
  private matchId = "";
  private revealCountdown = 0;
  private revealTimer?: any;
  private hearts = { TeamA: 4, TeamB: 4 };
  private round = 0;
  private nextRoundPlayers = new Set<string>();
  private surrenderedTeam?: 'TeamA' | 'TeamB';

  constructor(
    roomId: string,
    roomCode: string,
    mode: GameMode = 'pvp',
    scheduler: RoomScheduler = defaultRoomScheduler,
  ) {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.mode = mode;
    this.scheduler = scheduler;
  }

  get playerCount(): number {
    return this.players.size;
  }

  get isFull(): boolean {
    return this.players.size >= 2;
  }

  get allReady(): boolean {
    if (this.players.size < 2) return false;
    for (const player of this.players.values()) {
      if (!player.info.isReady) return false;
    }
    return true;
  }

  getPlayerInfos(): RoomPlayerInfo[] {
    return Array.from(this.players.values()).map((p) => ({ ...p.info }));
  }

  addPlayer(
    playerId: string,
    playerName: string,
    send: (msg: ServerMessage) => void,
  ): RoomPlayerInfo {
    if (this.isFull && !this.players.has(playerId)) {
      throw new Error(`Room ${this.roomCode} is full.`);
    }

    if (this.players.has(playerId)) {
      const existing = this.players.get(playerId)!;
      existing.send = send;
      existing.info.connected = true;
      return existing.info;
    }

    const teamId = [...this.players.values()].some(player => player.info.teamId === 'TeamA') ? 'TeamB' : 'TeamA';
    const playerInfo: RoomPlayerInfo = {
      playerId,
      playerName,
      teamId,
      isReady: false,
      connected: true,
    };

    this.players.set(playerId, { info: playerInfo, send });
    this.broadcastUpdate();
    return playerInfo;
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    if (this.state === 'BATTLE') {
      player.info.connected = false;
      this.broadcastUpdate();
      const remainingConnected = [...this.players.values()].find((p) => p.info.connected);
      if (remainingConnected) {
        this.battleModel?.executeCommand({ type: 'Surrender', tick: this.battleModel.snapshot.elapsedTicks, teamId: player.info.teamId });
        this.hearts[player.info.teamId] = 0;
        this.state = 'ENDED';
        this.broadcast({
          type: 'MATCH_END',
          endReason: 'disconnect',
          matchId: this.matchId,
          snapshot: this.battleModel?.snapshot,
          hearts: { ...this.hearts }, round: this.round, matchFinished: true,
          winnerTeamId: remainingConnected.info.teamId,
          reason: `Đối thủ (${player.info.playerName}) đã ngắt kết nối.`,
        });
        this.broadcastUpdate();
        this.stopTicking();
      }
      return;
    }

    this.players.delete(playerId);
    if (this.state === 'BattleCountdown' && this.revealTimer !== undefined) this.scheduler.clearTimeout(this.revealTimer);
    this.playerFormations.delete(playerId);
    this.deployedPlayers.delete(playerId);
    this.phaseReadyPlayers.delete(playerId);
    this.energyByPlayer.delete(playerId);
    if (this.state === 'COUNTDOWN') {
      if (this.countdownTimeout !== undefined) {
        this.scheduler.clearTimeout(this.countdownTimeout);
        this.countdownTimeout = undefined;
      }
      this.state = 'WAITING';
    } else if (this.state !== 'WAITING' && this.state !== 'ENDED') {
      this.state = 'ENDED';
      this.broadcast({ type: 'ERROR', code: 'OPPONENT_LEFT', message: 'Đối thủ đã rời trận. Hãy trở về sảnh.' });
    }
    this.broadcastUpdate();
  }

  setPlayerReady(playerId: string, isReady: boolean): void {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.state !== 'WAITING' && this.state !== 'COUNTDOWN') return;

    player.info.isReady = isReady;
    if (this.state === 'COUNTDOWN' && !isReady) {
      if (this.countdownTimeout !== undefined) {
        this.scheduler.clearTimeout(this.countdownTimeout);
        this.countdownTimeout = undefined;
      }
      this.state = 'WAITING';
    }
    this.broadcastUpdate();

    if (this.allReady && this.state === 'WAITING') {
      this.startCountdown();
    }
  }

  receiveCommand(playerId: string, command: BattleCommand): boolean {
    if (this.state !== 'BATTLE' || !this.battleModel) return false;
    const player = this.players.get(playerId);
    if (!player) return false;

    if (command.matchId && command.matchId !== this.matchId) return false;
    const cmdKey = command.commandId ? `${playerId}:${command.commandId}` : `${playerId}:${command.type}:${command.tick}:${(command as any).energyId ?? ''}`;
    if (this.processedCommands.has(cmdKey)) return false;

    // Stamp command with the player's team affiliation
    command.teamId = player.info.teamId;
    const queue = this.energyByPlayer.get(playerId);
    const accepted = this.battleModel.executeCommand(command, queue);
    if (accepted && command.type === 'Surrender') this.surrenderedTeam = player.info.teamId;
    if (accepted) {
      this.processedCommands.add(cmdKey);
    }
    if (queue) player.send({ type: 'ENERGY_INVENTORY', entries: queue.getAll() });
    if (!accepted) player.send({ type: 'ERROR', code: 'COMMAND_REJECTED', message: 'Không thể dùng Energy lúc này.' });
    return accepted;
  }

  preparationReady(playerId: string, phase: PreparationPhase): void {
    if (!this.players.has(playerId) || this.state !== phase || phase === 'BattleSetup') return;
    this.phaseReadyPlayers.add(playerId);
    if (this.players.size !== 2 || this.phaseReadyPlayers.size !== 2) return;
    this.phaseReadyPlayers.clear();
    this.state = phase === 'BeastRush' ? 'EnergyRush' : 'BattleSetup';
    this.broadcast({ type: 'PREPARATION_PHASE', phase: this.state });
    this.broadcastUpdate();
  }

  deployFormation(playerId: string, units: DeployedFormationUnit[], ready = true, energy: Array<{ energyId: string; charges: number }> = []): void {
    const owner = this.players.get(playerId);
    if (!owner || this.state !== 'BattleSetup' || this.deployedPlayers.has(playerId)) return;
    const invalid = units.length > 5 || (ready && units.length === 0)
      || new Set(units.map(unit => unit.unitId)).size !== units.length
      || new Set(units.map(unit => unit.slotId)).size !== units.length
      || units.some(unit => !unit.unitId || !/^beast-[a-j]$/.test(unit.beastId)
        || unit.role !== roleForBeast(unit.beastId)
        || ![1, 2, 3].includes(unit.star) || !Number.isFinite(unit.maxHp) || unit.maxHp <= 0
        || !Number.isFinite(unit.currentHp) || unit.currentHp <= 0 || unit.currentHp > unit.maxHp
        || !Number.isFinite(unit.damage) || unit.damage < 0
        || !['Front', 'Mid', 'Back'].includes(unit.row) || !Number.isInteger(unit.column) || unit.column < 1 || unit.column > 6
        || unit.slotId !== `${unit.row.toLowerCase()}-${unit.column}`);
    if (invalid || !Array.isArray(energy) || energy.some(entry => !tacticalEnergyDefinition(entry.energyId) || !Number.isSafeInteger(entry.charges) || entry.charges <= 0)) {
      owner.send({ type: 'ERROR', code: 'INVALID_FORMATION', message: 'Đội hình hoặc Energy không hợp lệ.' });
      return;
    }
    const canonical = units.map(unit => ({ ...unit, unitId: `${playerId}:${unit.unitId}` }));
    this.playerFormations.set(playerId, canonical);
    if (ready) {
      this.deployedPlayers.add(playerId);
      const queue = new EnergyQueue();
      energy.forEach(entry => queue.addCharge(entry.energyId, entry.charges));
      this.energyByPlayer.set(playerId, queue);
      owner.send({ type: 'ENERGY_INVENTORY', entries: queue.getAll() });
    }

    // Notify other players in the room
    for (const player of this.players.values()) {
      if (player.info.playerId !== playerId) {
        player.send({
          type: 'OPPONENT_FORMATION_READY',
          opponentPlayerId: playerId,
          opponentUnitCount: canonical.length,
          units: [],
          placements: canonical.map(unit => ({ slotId: unit.slotId, row: unit.row, column: unit.column })),
          ready,
        });
      }
    }

    // When both players have deployed, launch the real PvP battle!
    if (this.players.size === 2 && this.deployedPlayers.size === 2) {
      this.state = 'BattleCountdown';
      this.revealCountdown = 5;
      this.advanceRevealCountdown();
    }
  }

  startOnlineBattle(): void {
    if (this.state !== 'BattleCountdown' || this.revealCountdown !== 0 || this.deployedPlayers.size !== 2) return;
    this.state = 'BATTLE';

    const playerList = Array.from(this.players.values());
    const teamAPlayer = playerList.find((p) => p.info.teamId === 'TeamA') ?? playerList[0];
    const teamBPlayer = playerList.find((p) => p.info.teamId === 'TeamB') ?? playerList[1];

    const teamAUnits = this.playerFormations.get(teamAPlayer.info.playerId) ?? [];
    const teamBUnits = this.playerFormations.get(teamBPlayer.info.playerId) ?? [];

    const formationA = new BattleFormation(
      teamAUnits.map((u) => ({
        contentId: u.beastId,
        star: u.star,
        instanceId: u.unitId,
      })),
    );
    teamAUnits.forEach((u) => {
      formationA.place(u.unitId, u.slotId);
    });

    const teamBFixtures: EnemyFixture[] = teamBUnits.map((u) => ({
      enemyId: u.unitId,
      slotId: u.slotId,
      row: u.row,
      column: u.column,
      maxHp: u.maxHp,
      currentHp: u.currentHp,
      damage: u.damage,
      archetype:
        u.role === 'Tanker'
          ? 'Frontliner'
          : u.role === 'Assassin'
            ? 'Diver'
            : 'Ranged',
      beastId: u.beastId,
      role: u.role,
      star: u.star,
    }));

    this.battleModel = new AutonomousBattleModel(
      formationA,
      teamBFixtures,
      P1V13A_SIGNATURE_RULES,
      Object.fromEntries(teamAUnits.map((u) => [u.unitId, u.currentHp])),
    );

    this.broadcast({
      type: 'ONLINE_BATTLE_START',
      snapshot: this.battleModel.snapshot,
      teamAPlayerId: teamAPlayer.info.playerId,
      teamBPlayerId: teamBPlayer.info.playerId,
    });

    this.startTicking();
    this.broadcastUpdate();
  }

  startCountdown(): void {
    this.state = 'COUNTDOWN';
    this.broadcastUpdate();
    if (this.countdownTimeout !== undefined) {
      this.scheduler.clearTimeout(this.countdownTimeout);
    }
    this.countdownTimeout = this.scheduler.setTimeout(() => {
      if (this.state === 'COUNTDOWN' && this.allReady) {
        this.startMatch(false);
      }
    }, 1500);
  }

  startMatch(autoTick = false): void {
    if (this.players.size !== 2 || !this.allReady || this.state !== 'COUNTDOWN') return;
    if (this.countdownTimeout !== undefined) {
      this.scheduler.clearTimeout(this.countdownTimeout);
      this.countdownTimeout = undefined;
    }
    this.state = 'BeastRush';
    this.round++;
    this.playerFormations.clear(); this.deployedPlayers.clear(); this.phaseReadyPlayers.clear(); this.energyByPlayer.clear(); this.nextRoundPlayers.clear();
    this.surrenderedTeam = undefined;
    this.battleModel = undefined;
    this.matchId = `${this.roomId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.processedCommands.clear();
    this.matchSeed = Math.floor(Math.random() * 1000000);
    this.prng = new PrngService(this.matchSeed);

    const playerList = Array.from(this.players.values());
    const teamA = playerList.find((p) => p.info.teamId === 'TeamA') ?? playerList[0];
    const teamB = playerList.find((p) => p.info.teamId === 'TeamB') ?? playerList[1];

    // Broadcast MATCH_START with the common seed and initial snapshot
    this.broadcast({
      type: 'MATCH_START',
      round: this.round, hearts: { ...this.hearts },
      seed: this.matchSeed,
      mode: this.mode,
      teamAPlayerId: teamA.info.playerId,
      teamBPlayerId: teamB?.info.playerId ?? 'ai-opponent',
      matchId: this.matchId,
      initialSnapshot: { status: 'Running', enemyHp: 0, enemyMaxHp: 0, enemyDamage: 0, elapsedTicks: 0, units: [], enemies: [] },
    });

    this.broadcastUpdate();
  }

  step(deltaSeconds = SIMULATION_STEP): {
    snapshot: AutonomousBattleSnapshot;
    events: BattleEvent[];
  } | null {
    if (this.state !== 'BATTLE' || !this.battleModel) return null;

    const { snapshot, events } = this.battleModel.stepWithCommands(deltaSeconds);

    this.broadcast({
      type: 'BATTLE_TICK',
      matchId: this.matchId,
      tick: snapshot.elapsedTicks,
      snapshot,
      events,
    });

    if (snapshot.status !== 'Running') {
      const reason = this.surrenderedTeam ? 'surrender' as const : 'elimination' as const;
      if (!validBattleResult({ type: 'MATCH_END', snapshot, winnerTeamId: snapshot.status === 'Win' ? 'TeamA' : 'TeamB', reason, endReason: reason })) {
        this.stopTicking(); this.state = 'ENDED';
        this.broadcast({ type: 'ERROR', code: 'INVALID_BATTLE_RESULT', message: 'Kết quả không khớp HP cuối vòng. Phiên đã dừng để tránh tính sai tim.' });
        return { snapshot, events };
      }
      const loser = snapshot.status === 'Win' ? 'TeamB' : 'TeamA';
      this.hearts[loser] = this.surrenderedTeam ? 0 : Math.max(0, this.hearts[loser] - 1);
      const finished = this.hearts[loser] === 0;
      this.state = finished ? 'ENDED' : 'RoundResult';
      this.broadcast({
        type: 'MATCH_END',
        endReason: reason,
        matchId: this.matchId,
        snapshot: this.battleModel?.snapshot,
        round: this.round, hearts: { ...this.hearts }, matchFinished: finished,
        winnerTeamId: snapshot.status === 'Win' ? 'TeamA' : 'TeamB',
        reason: `Combat concluded with status ${snapshot.status}`,
      });
      this.broadcastUpdate();
      this.stopTicking();
    }

    return { snapshot, events };
  }

  nextRoundReady(playerId: string): void {
    if (this.state !== 'RoundResult' || !this.players.has(playerId)) return;
    this.nextRoundPlayers.add(playerId);
    if (this.nextRoundPlayers.size !== 2) return;
    this.state = 'COUNTDOWN';
    this.startMatch();
  }

  startTicking(tickRateMs = Math.round(SIMULATION_STEP * 1000)): void {
    if (this.simulationInterval !== undefined) {
      this.scheduler.clearInterval(this.simulationInterval);
    }
    const now = this.scheduler.now ?? (() => performance.now());
    let lastTime = now();
    let accumulator = 0;
    this.simulationInterval = this.scheduler.setInterval(() => {
      const current = now();
      accumulator += Math.max(0, (current - lastTime) / 1000);
      lastTime = current;
      let steps = 0;
      while (accumulator + 1e-9 >= SIMULATION_STEP && steps < 10 && this.state === 'BATTLE') {
        accumulator -= SIMULATION_STEP;
        this.step(SIMULATION_STEP);
        steps++;
      }
    }, tickRateMs);
  }

  stopTicking(): void {
    if (this.simulationInterval !== undefined) {
      this.scheduler.clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
  }

  broadcast(message: ServerMessage): void {
    for (const player of this.players.values()) {
      if (player.info.connected) {
        player.send(message);
      }
    }
  }

  broadcastUpdate(): void {
    for (const player of this.players.values()) {
      if (!player.info.connected) continue;
      const opponent = [...this.players.values()].find(candidate => candidate.info.playerId !== player.info.playerId);
      player.send({
      type: 'ROOM_UPDATE',
      roomCode: this.roomCode,
      mode: this.mode,
      state: this.state,
      players: this.getPlayerInfos(),
      allReady: this.allReady,
      ...(this.state === 'BattleCountdown' ? { battleCountdown: {
        remainingSeconds: this.revealCountdown,
        placements: (this.playerFormations.get(opponent?.info.playerId ?? '') ?? []).map(unit => ({ slotId: unit.slotId, row: unit.row, column: unit.column })),
      } } : {}),
    });
    }
  }

  private advanceRevealCountdown(): void {
    if (this.state !== 'BattleCountdown') return;
    if (this.revealCountdown === 0) { this.startOnlineBattle(); return; }
    this.broadcastUpdate();
    this.revealTimer = this.scheduler.setTimeout(() => {
      this.revealCountdown--;
      this.advanceRevealCountdown();
    }, 1000);
  }

  dispose(): void {
    if (this.revealTimer !== undefined) this.scheduler.clearTimeout(this.revealTimer);
    if (this.countdownTimeout !== undefined) {
      this.scheduler.clearTimeout(this.countdownTimeout);
      this.countdownTimeout = undefined;
    }
    this.stopTicking();
    this.players.clear();
    this.playerFormations.clear();
    this.deployedPlayers.clear();
    this.phaseReadyPlayers.clear();
    this.energyByPlayer.clear();
    this.battleModel = undefined;
  }
}
