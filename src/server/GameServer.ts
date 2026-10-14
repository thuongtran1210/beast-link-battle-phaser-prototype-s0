import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './RoomManager';
import { ONLINE_PROTOCOL_VERSION } from '../network/protocol/NetworkMessages';
import type { BattleRoom } from './BattleRoom';
import type {
  ClientMessage,
  ServerMessage,
  RoomJoinedMessage,
} from '../network/protocol/NetworkMessages';

export interface ServerOptions {
  port?: number;
}

export class GameServer {
  readonly roomManager = new RoomManager();
  private wss?: WebSocketServer;
  private clientRooms = new Map<WebSocket, { room: BattleRoom; playerId: string }>();
  get port(): number | undefined {
    const address = this.wss?.address();
    return address && typeof address !== 'string' ? address.port : undefined;
  }

  async start(port = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss = new WebSocketServer({ port }, () => {
        resolve();
      });

      this.wss.on('connection', (ws: WebSocket) => {
        this.handleConnection(ws);
      });
      this.wss.once('error', reject);
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }
      for (const binding of this.clientRooms.values()) this.roomManager.removeRoom(binding.room.roomId);
      this.clientRooms.clear();
      this.wss.clients.forEach(client => client.terminate());
      this.wss.close(() => {
        resolve();
      });
    });
  }

  private handleConnection(ws: WebSocket): void {
    const send = (msg: ServerMessage) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    };

    ws.on('message', (raw: Buffer | string) => {
      try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;
        this.handleClientMessage(ws, msg, send);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        send({
          type: 'ERROR',
          code: 'INVALID_PACKET',
          message: `Malformed message payload: ${message}`,
        });
      }
    });

    ws.on('close', () => {
      const binding = this.clientRooms.get(ws);
      if (binding) {
        binding.room.removePlayer(binding.playerId);
        this.clientRooms.delete(ws);
      }
    });
  }

  private handleClientMessage(
    ws: WebSocket,
    msg: ClientMessage,
    send: (msg: ServerMessage) => void,
  ): void {
    switch (msg.type) {
      case 'PING': {
        send({ type: 'PONG', timestamp: msg.timestamp });
        break;
      }

      case 'CREATE_ROOM': {
        const room = this.roomManager.createRoom(msg.mode);
        const playerId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const playerInfo = room.addPlayer(playerId, msg.playerName, send);

        this.clientRooms.set(ws, { room, playerId });

        const joinedMsg: RoomJoinedMessage = {
          protocolVersion: ONLINE_PROTOCOL_VERSION,
          type: 'ROOM_JOINED',
          roomId: room.roomId,
          roomCode: room.roomCode,
          mode: room.mode,
          playerId,
          teamId: playerInfo.teamId,
        };
        send(joinedMsg);
        break;
      }

      case 'JOIN_ROOM': {
        try {
          const playerId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const { room, playerInfo } = this.roomManager.joinRoom(
            msg.roomCode,
            playerId,
            msg.playerName,
            send,
          );

          this.clientRooms.set(ws, { room, playerId });

          const joinedMsg: RoomJoinedMessage = {
            protocolVersion: ONLINE_PROTOCOL_VERSION,
            type: 'ROOM_JOINED',
            roomId: room.roomId,
            roomCode: room.roomCode,
            mode: room.mode,
            playerId,
            teamId: playerInfo.teamId,
          };
          send(joinedMsg);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          send({
            type: 'ERROR',
            code: 'JOIN_FAILED',
            message: errorMsg,
          });
        }
        break;
      }

      case 'SET_READY': {
        const binding = this.clientRooms.get(ws);
        if (binding) {
          binding.room.setPlayerReady(binding.playerId, msg.isReady);
        }
        break;
      }

      case 'BATTLE_COMMAND': {
        const binding = this.clientRooms.get(ws);
        if (binding) {
          binding.room.receiveCommand(binding.playerId, msg.command);
        }
        break;
      }

      case 'DEPLOY_FORMATION': {
        const binding = this.clientRooms.get(ws);
        if (binding) {
          binding.room.deployFormation(binding.playerId, msg.units, msg.ready, msg.energy);
        }
        break;
      }
      case 'PREPARATION_READY': {
        const binding = this.clientRooms.get(ws);
        binding?.room.preparationReady(binding.playerId, msg.phase);
        break;
      }
      case 'NEXT_ROUND_READY': {
        const binding = this.clientRooms.get(ws);
        binding?.room.nextRoundReady(binding.playerId);
        break;
      }

      case 'LEAVE_ROOM': {
        const binding = this.clientRooms.get(ws);
        if (binding) {
          binding.room.removePlayer(binding.playerId);
          this.clientRooms.delete(ws);
        }
        break;
      }
    }
  }
}
