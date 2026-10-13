import { rushSfx } from './feedback/RushSfx';
import { bgmManager } from '../audio/BgmManager';
import { getFullscreenCapabilities, toggleFullscreen, requestLandscapeFullscreen } from './layout/MobileDisplayManager';

export function showSettingsDialog(onClose?: () => void): void {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog settings-dialog';
  dialog.setAttribute('aria-labelledby', 'settings-dialog-title');

  const header = document.createElement('header');
  header.className = 'diary-panel-header settings-header';

  const heading = document.createElement('h2');
  heading.id = 'settings-dialog-title';
  heading.textContent = 'Cài đặt & Hiển thị';
  header.append(heading);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'diary-panel-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Đóng cài đặt');
  closeBtn.onclick = () => dialog.close();
  header.append(closeBtn);
  dialog.append(header);

  const body = document.createElement('div');
  body.className = 'settings-body';

  // 1. Audio Section
  const audioRow = document.createElement('div');
  audioRow.className = 'settings-row';
  audioRow.innerHTML = `
    <div class="settings-row-info">
      <strong>Âm thanh (SFX)</strong>
      <p>Hiệu ứng âm thanh khi ghép cặp và chiến đấu</p>
    </div>
  `;
  const audioBtn = document.createElement('button');
  audioBtn.className = 'settings-toggle-btn';
  const updateAudioText = () => {
    audioBtn.textContent = rushSfx.enabled ? 'Đang Bật' : 'Đang Tắt';
    audioBtn.setAttribute('aria-pressed', String(rushSfx.enabled));
    audioBtn.classList.toggle('active', rushSfx.enabled);
  };
  updateAudioText();
  audioBtn.onclick = () => {
    rushSfx.setEnabled(!rushSfx.enabled);
    rushSfx.unlock();
    updateAudioText();
  };
  audioRow.append(audioBtn);
  body.append(audioRow);

  // 1.1 BGM Section
  const bgmRow = document.createElement('div');
  bgmRow.className = 'settings-row';
  bgmRow.innerHTML = `
    <div class="settings-row-info">
      <strong>Nhạc nền (BGM)</strong>
      <p>Giai điệu sảnh chờ và làng thú</p>
    </div>
  `;
  const bgmBtn = document.createElement('button');
  bgmBtn.className = 'settings-toggle-btn';
  const updateBgmText = () => {
    bgmBtn.textContent = bgmManager.enabled ? 'Đang Bật' : 'Đang Tắt';
    bgmBtn.setAttribute('aria-pressed', String(bgmManager.enabled));
    bgmBtn.classList.toggle('active', bgmManager.enabled);
  };
  updateBgmText();
  bgmBtn.onclick = () => {
    bgmManager.setEnabled(!bgmManager.enabled);
    updateBgmText();
  };
  bgmRow.append(bgmBtn);
  body.append(bgmRow);

  // 2. Fullscreen & Landscape Section
  const screenRow = document.createElement('div');
  screenRow.className = 'settings-row';
  screenRow.innerHTML = `
    <div class="settings-row-info">
      <strong>Toàn màn hình & Xoay ngang</strong>
      <p>Mở rộng toàn màn hình và ưu tiên hướng ngang trên điện thoại</p>
    </div>
  `;
  const screenBtn = document.createElement('button');
  screenBtn.className = 'settings-toggle-btn';
  const updateScreenText = () => {
    const isFull = getFullscreenCapabilities().isFullscreen;
    screenBtn.textContent = isFull ? 'Thoát Toàn Màn Hình' : 'Toàn Màn Hình (Ngang)';
    screenBtn.setAttribute('aria-pressed', String(isFull));
    screenBtn.classList.toggle('active', isFull);
  };
  updateScreenText();
  screenBtn.onclick = async () => {
    await toggleFullscreen();
    updateScreenText();
  };
  screenRow.append(screenBtn);
  body.append(screenRow);

  // 3. Quick Tips for Mobile
  const tipBox = document.createElement('div');
  tipBox.className = 'settings-tip-box';
  tipBox.innerHTML = `
    <span>💡 <em>Mẹo:</em> Trên điện thoại, bạn có thể xoay ngang màn hình và nhấn vào "Toàn Màn Hình" để ẩn thanh địa chỉ trình duyệt, giúp góc nhìn rộng và thao tác mượt mà hơn.</span>
  `;
  body.append(tipBox);

  dialog.append(body);
  document.getElementById('game-shell')?.append(dialog);
  dialog.showModal();

  dialog.onclose = () => {
    dialog.remove();
    onClose?.();
  };
}
