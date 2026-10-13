import type { WebSocketClientAdapter } from './WebSocketClientAdapter';
import type { MatchStartMessage } from '../../network/protocol/NetworkMessages';
import { RemoteBattleController } from '../battle/controller/RemoteBattleController';

export interface ActiveOnlineSession {
  adapter: WebSocketClientAdapter;
  matchInfo: MatchStartMessage;
  controller: RemoteBattleController;
}

let activeSession: ActiveOnlineSession | null = null;

export function setOnlineBattleSession(
  adapter: WebSocketClientAdapter,
  matchInfo: MatchStartMessage,
): ActiveOnlineSession {
  // Dispose any stale session
  if (activeSession) {
    activeSession.controller.dispose();
  }

  const controller = new RemoteBattleController(matchInfo.initialSnapshot, adapter);
  activeSession = {
    adapter,
    matchInfo,
    controller,
  };
  return activeSession;
}

export function getOnlineBattleSession(): ActiveOnlineSession | null {
  return activeSession;
}

export function clearOnlineBattleSession(): void {
  if (activeSession) {
    activeSession.controller.dispose();
    activeSession.adapter.disconnect();
    activeSession = null;
  }
}
