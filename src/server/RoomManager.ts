import { BattleRoom } from './BattleRoom';
import type { GameMode, RoomPlayerInfo, ServerMessage } from '../network/protocol/NetworkMessages';

export class RoomManager {
  private roomsById = new Map<string, BattleRoom>();
  private roomsByCode = new Map<string, BattleRoom>();
  private nextRoomId = 1;

  createRoom(mode: GameMode = 'pvp'): BattleRoom {
    const roomId = `room-${this.nextRoomId++}`;
    const roomCode = this.generateRoomCode();

    const room = new BattleRoom(roomId, roomCode, mode);
    this.roomsById.set(roomId, room);
    this.roomsByCode.set(roomCode, room);

    return room;
  }

  getRoom(roomId: string): BattleRoom | undefined {
    return this.roomsById.get(roomId);
  }

  getRoomByCode(roomCode: string): BattleRoom | undefined {
    return this.roomsByCode.get(roomCode.toUpperCase().trim());
  }

  joinRoom(
    roomCode: string,
    playerId: string,
    playerName: string,
    send: (msg: ServerMessage) => void,
  ): { room: BattleRoom; playerInfo: RoomPlayerInfo } {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = this.roomsByCode.get(normalizedCode);

    if (!room) {
      throw new Error(`Room with code "${normalizedCode}" not found.`);
    }

    const playerInfo = room.addPlayer(playerId, playerName, send);
    return { room, playerInfo };
  }

  removeRoom(roomId: string): void {
    const room = this.roomsById.get(roomId);
    if (!room) return;

    room.dispose();
    this.roomsById.delete(roomId);
    this.roomsByCode.delete(room.roomCode);
  }

  private generateRoomCode(): string {
    let attempts = 0;
    while (attempts < 100) {
      const num = Math.floor(1000 + Math.random() * 9000);
      const code = `B-${num}`;
      if (!this.roomsByCode.has(code)) {
        return code;
      }
      attempts++;
    }
    return `B-${Date.now().toString().slice(-4)}`;
  }
}
