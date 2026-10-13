import { WebSocketClientAdapter } from '../../network/WebSocketClientAdapter';
import type { GameMode, RoomPlayerInfo, MatchStartMessage } from '../../../network/protocol/NetworkMessages';

export interface OnlineLobbyOptions {
  serverUrl?: string;
  defaultPlayerName?: string;
  onMatchStart?: (adapter: WebSocketClientAdapter, matchInfo: MatchStartMessage) => void;
  onClose?: () => void;
}

export function showOnlineLobbyDialog(options: OnlineLobbyOptions = {}): void {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog online-lobby-dialog';
  dialog.setAttribute('aria-labelledby', 'online-lobby-title');

  const adapter = new WebSocketClientAdapter(options.serverUrl ?? 'ws://localhost:3000');

  const container = document.createElement('div');
  container.className = 'online-lobby-container';
  dialog.append(container);

  let currentRoomCode: string | null = null;
  let isReadyState = false;

  const renderInitialView = () => {
    container.innerHTML = `
      <header class="diary-panel-header">
        <h2 id="online-lobby-title">⚔️ Đấu Trực Tuyến (Online Match)</h2>
        <button class="diary-panel-close" aria-label="Đóng">×</button>
      </header>
      <div class="lobby-content" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
          <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 6px;">Tên của bạn:</label>
          <input type="text" id="online-player-name" value="${options.defaultPlayerName ?? 'Chiến Binh'}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #71717a; background: #27272a; color: #fff; font-size: 14px;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <!-- Tạo phòng -->
          <div style="background: rgba(39, 39, 42, 0.6); padding: 14px; border-radius: 8px; border: 1px solid #3f3f46; display: flex; flex-direction: column; gap: 10px;">
            <strong style="color: #f6d675; font-size: 15px;">Tạo Phòng Mới</strong>
            <p style="font-size: 12px; color: #a1a1aa; margin: 0;">Lấy mã phòng để mời bạn bè tham gia</p>
            <label style="font-size: 12px;">Chế độ:</label>
            <select id="online-mode-select" style="padding: 6px 10px; border-radius: 6px; background: #18181b; color: #fff; border: 1px solid #52525b;">
              <option value="pvp">Solo 1v1 PvP (Đối kháng)</option>
              <option value="coop">Đồng Đội Co-op (Diệt Boss)</option>
            </select>
            <button id="btn-create-room" style="margin-top: auto; padding: 10px; background: #eab308; color: #000; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">Tạo Phòng</button>
          </div>

          <!-- Vào phòng -->
          <div style="background: rgba(39, 39, 42, 0.6); padding: 14px; border-radius: 8px; border: 1px solid #3f3f46; display: flex; flex-direction: column; gap: 10px;">
            <strong style="color: #60a5fa; font-size: 15px;">Vào Phòng Có Sẵn</strong>
            <p style="font-size: 12px; color: #a1a1aa; margin: 0;">Nhập mã phòng bạn bè đã gửi</p>
            <input type="text" id="online-room-code-input" placeholder="Ví dụ: B-1234" style="text-transform: uppercase; padding: 8px 10px; border-radius: 6px; background: #18181b; color: #fff; border: 1px solid #52525b; font-size: 14px;" />
            <button id="btn-join-room" style="margin-top: auto; padding: 10px; background: #3b82f6; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">Tham Gia</button>
          </div>
        </div>

        <div id="lobby-status-msg" style="color: #ef4444; font-size: 13px; text-align: center; min-height: 20px;"></div>
      </div>
    `;

    container.querySelector('.diary-panel-close')?.addEventListener('click', () => {
      adapter.disconnect();
      dialog.close();
      options.onClose?.();
    });

    const nameInput = container.querySelector('#online-player-name') as HTMLInputElement;
    const modeSelect = container.querySelector('#online-mode-select') as HTMLSelectElement;
    const statusDiv = container.querySelector('#lobby-status-msg') as HTMLElement;

    container.querySelector('#btn-create-room')?.addEventListener('click', async () => {
      const name = nameInput.value.trim() || 'Người chơi 1';
      const mode = modeSelect.value as GameMode;
      statusDiv.textContent = 'Đang kết nối server...';
      try {
        const joined = await adapter.createRoom(name, mode);
        currentRoomCode = joined.roomCode;
        renderWaitingRoomView(joined.roomCode, mode, name);
      } catch (err: unknown) {
        statusDiv.textContent = err instanceof Error ? err.message : String(err);
      }
    });

    const codeInput = container.querySelector('#online-room-code-input') as HTMLInputElement;
    container.querySelector('#btn-join-room')?.addEventListener('click', async () => {
      const name = nameInput.value.trim() || 'Người chơi 2';
      const code = codeInput.value.trim();
      if (!code) {
        statusDiv.textContent = 'Vui lòng nhập mã phòng!';
        return;
      }
      statusDiv.textContent = 'Đang tham gia...';
      try {
        const joined = await adapter.joinRoom(code, name);
        currentRoomCode = joined.roomCode;
        renderWaitingRoomView(joined.roomCode, joined.mode, name);
      } catch (err: unknown) {
        statusDiv.textContent = err instanceof Error ? err.message : String(err);
      }
    });
  };

  const renderWaitingRoomView = (roomCode: string, mode: GameMode, playerName: string) => {
    container.innerHTML = `
      <header class="diary-panel-header">
        <h2>Phòng Đấu: <span style="color: #f6d675; letter-spacing: 1px;">${roomCode}</span></h2>
        <button class="diary-panel-close" aria-label="Rời phòng">×</button>
      </header>
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 6px;">
          <span>Chế độ: <strong>${mode === 'pvp' ? 'Solo 1v1 Đối Kháng' : 'Đồng Đội Co-op'}</strong></span>
          <button id="btn-copy-code" style="padding: 4px 10px; background: #4b5563; color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">📋 Sao chép mã</button>
        </div>

        <div style="background: rgba(24, 24, 27, 0.8); border: 1px solid #3f3f46; border-radius: 8px; padding: 12px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #a1a1aa;">Danh Sách Người Chơi (2 Tối đa)</h4>
          <div id="player-list-container" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="padding: 8px; background: #27272a; border-radius: 6px; display: flex; justify-content: space-between;">
              <span>${playerName} (Bạn)</span>
              <span style="color: #eab308;">Chưa sẵn sàng</span>
            </div>
          </div>
        </div>

        <div id="countdown-banner" style="text-align: center; color: #22c55e; font-weight: bold; font-size: 16px; min-height: 24px;"></div>

        <button id="btn-toggle-ready" style="padding: 12px; background: #22c55e; color: #000; font-weight: bold; font-size: 15px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;">SẴN SÀNG (READY)</button>
      </div>
    `;

    container.querySelector('.diary-panel-close')?.addEventListener('click', () => {
      adapter.disconnect();
      dialog.close();
      options.onClose?.();
    });

    container.querySelector('#btn-copy-code')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(roomCode);
      const btn = container.querySelector('#btn-copy-code') as HTMLElement;
      btn.textContent = '✓ Đã sao chép!';
      setTimeout(() => { btn.textContent = '📋 Sao chép mã'; }, 2000);
    });

    const readyBtn = container.querySelector('#btn-toggle-ready') as HTMLButtonElement;
    readyBtn.addEventListener('click', () => {
      isReadyState = !isReadyState;
      adapter.setReady(isReadyState);
      readyBtn.textContent = isReadyState ? 'HỦY SẴN SÀNG' : 'SẴN SÀNG (READY)';
      readyBtn.style.background = isReadyState ? '#ef4444' : '#22c55e';
      readyBtn.style.color = isReadyState ? '#fff' : '#000';
    });

    // Listen for room updates
    adapter.onRoomUpdate((update) => {
      const listDiv = container.querySelector('#player-list-container');
      if (listDiv) {
        listDiv.innerHTML = update.players.map((p) => `
          <div style="padding: 8px 12px; background: #27272a; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${p.playerName}</strong>
              <span style="font-size: 11px; color: #a1a1aa; margin-left: 6px;">[${p.teamId}]</span>
            </div>
            <span style="font-size: 12px; font-weight: bold; color: ${p.isReady ? '#22c55e' : '#f59e0b'};">
              ${p.isReady ? '✓ Sẵn sàng' : 'Chưa sẵn sàng'}
            </span>
          </div>
        `).join('');
      }

      const banner = container.querySelector('#countdown-banner');
      if (banner && update.state === 'COUNTDOWN') {
        banner.textContent = '⏳ Cả 2 đã sẵn sàng! Chuẩn bị vào trận...';
      }
    });

    // Listen for match start
    adapter.onMatchStart((matchInfo) => {
      dialog.close();
      options.onMatchStart?.(adapter, matchInfo);
    });
  };

  renderInitialView();
  document.body.append(dialog);
  dialog.showModal();
}
