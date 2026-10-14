/** Covers asset loading and scene creation; progress comes from Phaser's loader. */
export function showRunLoadingScreen(shell: HTMLElement): () => void {
  const root = document.createElement('section');
  root.className = 'run-loading-screen';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.innerHTML = `<div class="run-loading-content"><span class="run-loading-brand">LÀNG THÚ</span><div class="run-loading-paws" aria-hidden="true">${[0,1,2].map(() => '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="43" rx="17" ry="13"/><ellipse cx="12" cy="25" rx="7" ry="9" transform="rotate(-25 12 25)"/><ellipse cx="26" cy="15" rx="7" ry="9"/><ellipse cx="42" cy="17" rx="7" ry="9"/><ellipse cx="54" cy="30" rx="6" ry="8" transform="rotate(25 54 30)"/></svg>').join('')}</div><h1>Chuẩn bị chuyến đi</h1><p class="run-loading-status">Đang chuẩn bị sân đấu…</p><div class="run-loading-track" role="progressbar" aria-label="Tải màn chơi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="run-loading-fill"></div></div><span class="run-loading-hint">Một chuyến đi mới đang chờ đội thú của bạn.</span></div>`;
  shell.append(root);
  const fill = root.querySelector<HTMLElement>('.run-loading-fill')!;
  const track = root.querySelector<HTMLElement>('.run-loading-track')!;
  const status = root.querySelector<HTMLElement>('.run-loading-status')!;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const progress = (event: Event) => {
    const value = Math.round(Math.max(0, Math.min(1, (event as CustomEvent<number>).detail)) * 100);
    fill.style.width = `${value}%`; track.setAttribute('aria-valuenow', String(value));
    if (value === 100) status.textContent = 'Đang sắp xếp sân đấu…';
  };
  const dispose = () => {
    disposed = true;
    clearTimeout(timer);
    window.removeEventListener('beast-link-load-progress', progress);
    window.removeEventListener('beast-link-scene-ready', ready);
    root.remove();
  };
  const ready = () => {
    window.removeEventListener('beast-link-scene-ready', ready);
    progress(new CustomEvent('progress', { detail: 1 }));
    status.textContent = 'Sân đấu đã sẵn sàng';
    // Two frames allow the created scene to render underneath before revealing it.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (disposed) return;
      root.classList.add('is-ready');
      timer = setTimeout(dispose, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260);
    }));
  };
  window.addEventListener('beast-link-load-progress', progress);
  window.addEventListener('beast-link-scene-ready', ready);
  return dispose;
}
