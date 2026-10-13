import { AutonomousBattleModel } from '../game/battle/AutonomousBattleModel';
import { BattleFormation } from '../game/battle/BattleFormation';
import { PrngService } from '../game/random/PrngService';
import {
  P1V13A_SIGNATURE_RULES,
  P1V11C_FIXTURE_A_FRONTLINE,
  SIMULATION_STEP,
} from '../game/battle/BattleConfig';
import type {
  GameMode,
  RoomState,
  RoomPlayerInfo,
  ServerMessage,
  DeployedFormationUnit,
} from '../network/protocol/NetworkMessages';
import type { BattleCommand } from '../game/battle/commands/BattleCommand';
import type { BattleEvent } from '../game/battle/events/BattleEvents';
import type { AutonomousBattleSnapshot, EnemyFixture } from '../game/battle/BattleTypes';

export interface PlayerConnection {
  info: RoomPlayerInfo;
  send: (msg: ServerMessage) => void;
}

export class BattleRoom {
  readonly roomId: string;
  readonly roomCode: string;
  readonly mode: GameMode;
  state: RoomState = 'WAITING';

  private players = new Map<string, PlayerConnection>();
  private playerFormations = new Map<string, DeployedFormationUnit[]>();
  private battleModel?: AutonomousBattleModel;
  private prng?: PrngService;
  private matchSeed: number = 0;
  private simulationInterval?: ReturnType<typeof setInterval>;

  constructor(roomId: string, roomCode: string, mode: GameMode = 'pvp') {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.mode = mode;
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

    const teamId = this.players.size === 0 ? 'TeamA' : 'TeamB';
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
      return;
    }

    this.players.delete(playerId);
    this.broadcastUpdate();
  }

  setPlayerReady(playerId: string, isReady: boolean): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.info.isReady = isReady;
    this.broadcastUpdate();

    if (this.allReady && this.state === 'WAITING') {
      this.startCountdown();
    }
  }

  receiveCommand(playerId: string, command: BattleCommand): boolean {
    if (this.state !== 'BATTLE' || !this.battleModel) return false;
    const player = this.players.get(playerId);
    if (!player) return false;

    // Stamp command with the player's team affiliation
    command.teamId = player.info.teamId;
    return this.battleModel.executeCommand(command);
  }

  deployFormation(playerId: string, units: DeployedFormationUnit[]): void {
    this.playerFormations.set(playerId, units);

    // Notify other players in the room
    for (const player of this.players.values()) {
      if (player.info.playerId !== playerId) {
        player.send({
          type: 'OPPONENT_FORMATION_READY',
          opponentPlayerId: playerId,
          opponentUnitCount: units.length,
        });
      }
    }

    // When both players have deployed, launch the real PvP battle!
    if (this.players.size >= 2 && this.playerFormations.size >= 2) {
      this.startOnlineBattle();
    }
  }

  startOnlineBattle(): void {
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
  }

  startCountdown(): void {
    this.state = 'COUNTDOWN';
    this.broadcastUpdate();
    setTimeout(() => {
      if (this.state === 'COUNTDOWN') {
        this.startMatch(false);
      }
    }, 1500);
  }

  startMatch(autoTick = false): void {
    this.state = 'BATTLE';
    this.matchSeed = Math.floor(Math.random() * 1000000);
    this.prng = new PrngService(this.matchSeed);

    const playerList = Array.from(this.players.values());
    const teamA = playerList.find((p) => p.info.teamId === 'TeamA') ?? playerList[0];
    const teamB = playerList.find((p) => p.info.teamId === 'TeamB') ?? playerList[1];

    // Setup default formations for the battle match
    const formation = new BattleFormation([
      { contentId: 'beast-a', star: 2 },
      { contentId: 'beast-b', star: 2 },
      { contentId: 'beast-c', star: 2 },
    ]);
    formation.place(formation.units[0].unitId, 'front-1');
    formation.place(formation.units[1].unitId, 'mid-1');
    formation.place(formation.units[2].unitId, 'back-1');

    this.battleModel = new AutonomousBattleModel(
      formation,
      P1V11C_FIXTURE_A_FRONTLINE,
      P1V13A_SIGNATURE_RULES,
    );

    // Broadcast MATCH_START with the common seed and initial snapshot
    this.broadcast({
      type: 'MATCH_START',
      seed: this.matchSeed,
      mode: this.mode,
      teamAPlayerId: teamA.info.playerId,
      teamBPlayerId: teamB?.info.playerId ?? 'ai-opponent',
      initialSnapshot: this.battleModel.snapshot,
    });

    this.broadcastUpdate();

    if (autoTick) {
      this.startTicking();
    }
  }

  step(deltaSeconds = SIMULATION_STEP): {
    snapshot: AutonomousBattleSnapshot;
    events: BattleEvent[];
  } | null {
    if (this.state !== 'BATTLE' || !this.battleModel) return null;

    const { snapshot, events } = this.battleModel.stepWithCommands(deltaSeconds);

    this.broadcast({
      type: 'BATTLE_TICK',
      tick: snapshot.elapsedTicks,
      snapshot,
      events,
    });

    if (snapshot.status !== 'Running') {
      this.state = 'ENDED';
      this.broadcast({
        type: 'MATCH_END',
        winnerTeamId: snapshot.status === 'Win' ? 'TeamA' : 'TeamB',
        reason: `Combat concluded with status ${snapshot.status}`,
      });
      this.broadcastUpdate();
    }

    return { snapshot, events };
  }

  startTicking(tickRateMs = Math.round(SIMULATION_STEP * 1000)): void {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      this.step(SIMULATION_STEP);
    }, tickRateMs);
  }

  stopTicking(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
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
    this.broadcast({
      type: 'ROOM_UPDATE',
      roomCode: this.roomCode,
      mode: this.mode,
      state: this.state,
      players: this.getPlayerInfos(),
      allReady: this.allReady,
    });
  }

  dispose(): void {
    this.stopTicking();
    this.players.clear();
    this.battleModel = undefined;
  }
}
