import type { OnlineSessionAdapter } from './OnlineSessionAdapter';
import type { MatchStartMessage } from '../../network/protocol/NetworkMessages';
import { RemoteBattleController } from '../battle/controller/RemoteBattleController';
import { onlinePerspective } from './OnlinePerspective';

export interface ActiveOnlineSession {
  adapter: OnlineSessionAdapter;
  matchInfo: MatchStartMessage;
  controller: RemoteBattleController;
}

let activeSession: ActiveOnlineSession | null = null;

export function setOnlineBattleSession(
  adapter: OnlineSessionAdapter,
  matchInfo: MatchStartMessage,
): ActiveOnlineSession {
  // Dispose any stale session
  if (activeSession) {
    activeSession.controller.dispose();
  }

  const controller = new RemoteBattleController(onlinePerspective(matchInfo.initialSnapshot, adapter.teamId), adapter);
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
