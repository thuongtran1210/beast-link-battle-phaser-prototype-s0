import { WebSocketClientAdapter } from '../../network/WebSocketClientAdapter';
import { PeerSessionAdapter } from '../../network/PeerSessionAdapter';
import { isOnlineExperimentAvailable } from '../../config/OnlineAvailability';
import type { OnlineSessionAdapter } from '../../network/OnlineSessionAdapter';
import type { GameMode, RoomPlayerInfo, MatchStartMessage } from '../../../network/protocol/NetworkMessages';

export interface OnlineLobbyOptions {
  serverUrl?: string;
  defaultPlayerName?: string;
  transport?: 'p2p' | 'websocket';
  initialRoomCode?: string;
  adapter?: OnlineSessionAdapter;
  onMatchStart?: (adapter: OnlineSessionAdapter, matchInfo: MatchStartMessage) => void;
  onClose?: () => void;
}

export function showOnlineLobbyDialog(options: OnlineLobbyOptions = {}): void {
  if (!isOnlineExperimentAvailable()) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog online-lobby-dialog';
  dialog.setAttribute('aria-labelledby', 'online-lobby-title');
  const transport = options.transport ?? (options.serverUrl ? 'websocket' : 'p2p');
  const adapter: OnlineSessionAdapter = options.adapter ?? (
    transport === 'websocket'
      ? new WebSocketClientAdapter(options.serverUrl ?? 'ws://localhost:3000')
      : new PeerSessionAdapter()
  );
  let disposed = false;
  let transferred = false;
  let busy = false;
  let ready = false;
  let selfId = '';
  let latestPlayers: RoomPlayerInfo[] = [];
  const subscriptions: Array<() => void> = [];
  const close = () => dialog.close();
  dialog.addEventListener('close', () => {
    disposed = true;
    subscriptions.forEach(unsubscribe => unsubscribe());
    if (!transferred) {
      adapter.disconnect();
      options.onClose?.();
    }
    dialog.remove();
  });
  const header = (title: string, subtitle: string) => `
    <header class="online-header">
      <div><span class="online-eyebrow">LÀNG THÚ · SẢNH ĐẤU</span><h2 id="online-lobby-title">${title}</h2><p>${subtitle}</p></div>
      <button type="button" class="online-close" aria-label="Đóng sảnh đấu">×</button>
    </header>`;
  const bindClose = () => dialog.querySelector('.online-close')?.addEventListener('click', close);
  const status = (message: string, error = false) => {
    const element = dialog.querySelector<HTMLElement>('#lobby-status-msg');
    if (element) {
      element.textContent = message;
      element.classList.toggle('is-error', error);
    }
  };

  const renderPlayers = (players: RoomPlayerInfo[]) => {
    const list = dialog.querySelector('#online-players');
    if (!list) return;
    list.replaceChildren();
    for (const player of players) {
      const row = document.createElement('div');
      row.className = 'online-player';
      const avatar = document.createElement('span');
      avatar.className = 'online-avatar';
      avatar.textContent = player.teamId === 'TeamA' ? '🛡️' : '⚔️';
      avatar.setAttribute('aria-hidden', 'true');
      const name = document.createElement('strong');
      name.textContent = player.playerName + (player.playerId === selfId ? ' (Bạn)' : '');
      const badge = document.createElement('span');
      badge.className = `online-player-state${player.isReady ? ' is-ready' : ''}`;
      badge.textContent = player.isReady ? '✓ Sẵn sàng' : 'Chưa sẵn sàng';
      row.append(avatar, name, badge);
      list.append(row);
    }
    if (players.length < 2) {
      const empty = document.createElement('div');
      empty.className = 'online-player online-player-empty';
      empty.textContent = '＋ Đang chờ bạn vào phòng…';
      list.append(empty);
    }
  };

  const waiting = (roomCode: string, mode: GameMode, playerName: string, teamId: RoomPlayerInfo['teamId']) => {
    dialog.innerHTML = header('Phòng chờ', 'Mời một người bạn và cùng chuẩn bị vào trận.') + `
      <div class="online-body">
        <section class="online-room-ticket" aria-label="Mã mời bạn">
          <div><span class="online-eyebrow">MÃ PHÒNG</span><strong id="online-room-code"></strong><span>${mode === 'pvp' ? 'Đối kháng 1v1' : 'Đồng đội Co-op'}</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button type="button" class="online-secondary" id="btn-copy-code">Sao chép mã</button>
            <button type="button" class="online-secondary" id="btn-copy-link">Sao chép link mời</button>
          </div>
        </section>
        <section class="online-roster"><h3>Người chơi <span>2 vị trí</span></h3><div id="online-players"></div></section>
        <p class="online-countdown" id="countdown-banner" role="status">Trận đấu bắt đầu khi cả hai đã sẵn sàng.</p>
        <button type="button" class="online-primary online-ready" id="btn-toggle-ready">Sẵn sàng</button>
        <p id="lobby-status-msg" class="online-status" role="status" aria-live="polite"></p>
      </div>`;
    bindClose();
    dialog.querySelector('#online-room-code')!.textContent = roomCode;
    renderPlayers(latestPlayers.length ? latestPlayers : [{ playerId: selfId, playerName, teamId, isReady: false, connected: true }]);
    dialog.querySelector('#btn-copy-code')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(roomCode);
        if (!disposed) status('✓ Đã sao chép mã phòng. Gửi mã này cho bạn của bạn.');
      } catch {
        if (!disposed) status('Không thể sao chép tự động. Bạn có thể chọn và sao chép mã phía trên.', true);
      }
    });
    dialog.querySelector('#btn-copy-link')?.addEventListener('click', async () => {
      try {
        const link = adapter instanceof PeerSessionAdapter
          ? adapter.getInviteLink()
          : `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;
        await navigator.clipboard.writeText(link);
        if (!disposed) status('✓ Đã sao chép link mời! Gửi link này cho bạn để vào thẳng phòng.');
      } catch {
        if (!disposed) status('Không thể sao chép tự động link mời.', true);
      }
    });
    const button = dialog.querySelector<HTMLButtonElement>('#btn-toggle-ready')!;
    button.addEventListener('click', () => {
      if (!adapter.isConnected) { status('Mất kết nối. Hãy rời phòng và kết nối lại.', true); return; }
      ready = !ready;
      adapter.setReady(ready);
      button.textContent = ready ? 'Hủy sẵn sàng' : 'Sẵn sàng';
      button.classList.toggle('is-ready', ready);
    });
    button.focus();
  };

  subscriptions.push(adapter.onRoomUpdate(update => {
    if (disposed) return;
    latestPlayers = update.players;
    renderPlayers(update.players);
    const banner = dialog.querySelector('#countdown-banner');
    if (banner) banner.textContent = update.state === 'COUNTDOWN'
      ? '✓ Cả hai đã sẵn sàng! Chuẩn bị vào trận…'
      : 'Trận đấu bắt đầu khi cả hai đã sẵn sàng.';
  }));
  subscriptions.push(adapter.onMatchStart(matchInfo => {
    if (disposed) return;
    transferred = true;
    dialog.close();
    options.onMatchStart?.(adapter, matchInfo);
  }));
  subscriptions.push(adapter.onError(error => { if (!disposed) status(error.message, true); }));
  subscriptions.push(adapter.onStatus(() => {
    if (!disposed) {
      status('Kết nối đã đóng. Hãy rời sảnh và thử lại.', true);
      const button = dialog.querySelector<HTMLButtonElement>('#btn-toggle-ready');
      if (button) button.disabled = true;
    }
  }));

  dialog.innerHTML = header('Đấu Online', 'Tạo phòng mời bạn hoặc nhập mã để cùng vào trận.') + `
    <div class="online-body">
      <div class="online-identity"><label for="online-player-name">Tên của bạn</label><input id="online-player-name" type="text" autocomplete="nickname" maxlength="40" placeholder="Nhập tên người chơi"></div>
      <div class="online-tabs" role="tablist" aria-label="Cách vào trận">
        <button type="button" id="online-create-tab" role="tab" aria-selected="true" aria-controls="online-create-panel" tabindex="0">Tạo phòng</button>
        <button type="button" id="online-join-tab" role="tab" aria-selected="false" aria-controls="online-join-panel" tabindex="-1">Vào phòng</button>
      </div>
      <div class="online-panels" data-active="create">
        <form class="online-card" id="online-create-panel" aria-labelledby="online-create-heading">
          <h3 id="online-create-heading">Tạo phòng mới</h3><p>Chọn chế độ, lấy mã và mời bạn.</p>
          <label for="online-mode-select">Chế độ chơi</label><select id="online-mode-select"><option value="pvp">Đối kháng 1v1</option><option value="coop">Đồng đội Co-op</option></select>
          <button type="submit" class="online-primary" id="btn-create-room">Tạo phòng</button>
        </form>
        <form class="online-card" id="online-join-panel" aria-labelledby="online-join-heading">
          <h3 id="online-join-heading">Vào phòng của bạn</h3><p>Nhập mã phòng bạn đã nhận được.</p>
          <label for="online-room-code-input">Mã phòng</label><input id="online-room-code-input" type="text" placeholder="B-1234" autocapitalize="characters" autocomplete="off" spellcheck="false" required>
          <button type="submit" class="online-secondary" id="btn-join-room">Tham gia</button>
        </form>
      </div>
      <p id="lobby-status-msg" class="online-status" role="status" aria-live="polite"></p>
    </div>`;
  bindClose();
  const nameInput = dialog.querySelector<HTMLInputElement>('#online-player-name')!;
  nameInput.value = options.defaultPlayerName ?? 'Chiến Binh';
  const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const activate = (index: number) => {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    dialog.querySelector<HTMLElement>('.online-panels')!.dataset.active = index === 0 ? 'create' : 'join';
  };
  if (options.initialRoomCode) {
    const codeInput = dialog.querySelector<HTMLInputElement>('#online-room-code-input');
    if (codeInput) codeInput.value = options.initialRoomCode;
    activate(1);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
        activate(next); tabs[next].focus();
      }
    });
  });
  const submit = async (create: boolean) => {
    if (busy || disposed) return;
    busy = true;
    dialog.querySelectorAll<HTMLButtonElement>('.online-card button').forEach(button => { button.disabled = true; });
    dialog.querySelector('.online-body')?.setAttribute('aria-busy', 'true');
    status(create ? 'Đang tạo phòng…' : 'Đang tham gia phòng…');
    try {
      const name = nameInput.value.trim() || 'Chiến Binh';
      const rawCode = dialog.querySelector<HTMLInputElement>('#online-room-code-input')!.value.trim();
      const code = /^b-\d+$/i.test(rawCode) ? rawCode.toUpperCase() : rawCode;
      const joined = create
        ? await adapter.createRoom(name, dialog.querySelector<HTMLSelectElement>('#online-mode-select')!.value as GameMode)
        : await adapter.joinRoom(code, name);
      if (disposed) { adapter.disconnect(); return; }
      selfId = joined.playerId;
      waiting(joined.roomCode, joined.mode, name, joined.teamId);
    } catch (error) {
      if (!disposed) status(error instanceof Error ? error.message : String(error), true);
    } finally {
      busy = false;
      if (!disposed) {
        dialog.querySelector('.online-body')?.removeAttribute('aria-busy');
        dialog.querySelectorAll<HTMLButtonElement>('.online-card button').forEach(button => { button.disabled = false; });
      }
    }
  };
  dialog.querySelector('#online-create-panel')?.addEventListener('submit', event => { event.preventDefault(); void submit(true); });
  dialog.querySelector('#online-join-panel')?.addEventListener('submit', event => { event.preventDefault(); void submit(false); });
  document.body.append(dialog);
  dialog.showModal();
}
