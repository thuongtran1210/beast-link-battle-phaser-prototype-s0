import { BATTLE_CHARACTER_ART } from '../art/BattleCharacterManifest';
import { beastDisplayName, type BeastId } from '../icons/UnitIconRegistry';
import { villageProfession } from '../../run/VillageCatalog';
import type { CampState } from '../../run/CampState';

export function showVillageResidentDialog(
  root: HTMLElement,
  state: CampState,
  viewport: HTMLElement,
  status: HTMLElement,
): void {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog village-resident-dialog';

  const header = document.createElement('header');
  header.className = 'resident-panel-header';
  const heading = document.createElement('h2');
  heading.id = 'village-residents-title';
  heading.textContent = `Cư dân · ${state.residents.length}`;
  header.append(heading);
  dialog.setAttribute('aria-labelledby', heading.id);

  const close = document.createElement('button');
  close.className = 'resident-panel-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Đóng danh sách cư dân');
  close.onclick = () => dialog.close();
  header.append(close);
  dialog.append(header);

  const hint = document.createElement('p');
  hint.className = 'resident-panel-hint';
  hint.textContent = 'Chạm một cư dân để tìm trên bản đồ';
  dialog.append(hint);

  const list = document.createElement('div');
  list.className = 'resident-card-list';
  dialog.append(list);

  const refreshers: Array<() => void> = [];
  for (const id of state.residents) {
    const line = document.createElement('button');
    line.className = 'resident-card';
    line.setAttribute('aria-label', `Tìm ${beastDisplayName(id)} trên bản đồ`);

    const portrait = document.createElement('span');
    portrait.className = 'resident-portrait';
    const sprite = document.createElement('img');
    sprite.src = BATTLE_CHARACTER_ART[id as BeastId]?.base ?? '';
    sprite.alt = '';
    sprite.draggable = false;
    portrait.append(sprite);
    line.append(portrait);

    const info = document.createElement('span');
    info.className = 'resident-card-info';
    const name = document.createElement('strong');
    name.textContent = beastDisplayName(id);
    const profession = document.createElement('span');
    profession.className = 'resident-profession';
    profession.textContent = villageProfession(id)?.name ?? 'Cư dân';
    const activity = document.createElement('span');
    activity.className = 'resident-activity';

    const findBeast = () =>
      [...root.querySelectorAll<HTMLElement>('.camp-beast')].find((b) => b.dataset.beastId === id);

    const refresh = () => {
      const beast = findBeast();
      activity.textContent = `${beast?.dataset.activity ?? 'Đang nghỉ'} · ${
        state.economy.life.hungry.includes(id) ? 'Thiếu ăn · Chậm 25%' : 'Đủ bữa'
      }`;
      activity.dataset.working = String(!!beast?.classList.contains('camp-working'));
    };
    refreshers.push(refresh);
    refresh();

    info.append(name, profession, activity);
    line.append(info);
    const arrow = document.createElement('span');
    arrow.className = 'resident-find';
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    line.append(arrow);

    line.onclick = () => {
      const beast = findBeast();
      dialog.close();
      if (beast) {
        viewport.dispatchEvent(
          new CustomEvent('village-focus', {
            detail: {
              x: (parseFloat(beast.style.left) * 1536) / 100 + 46,
              y: (parseFloat(beast.style.top) * 1024) / 100 + 54,
            },
          }),
        );
        beast.focus({ preventScroll: true });
        status.textContent = `${beastDisplayName(id)} · ${beast.dataset.activity ?? 'Đang nghỉ'}`;
      }
    };
    list.append(line);
  }

  if (!state.residents.length) {
    const line = document.createElement('p');
    line.className = 'resident-empty';
    line.textContent =
      'Làng đang chờ những người bạn mới. Tuyển thú trong chuyến phiêu lưu để đưa họ về làng.';
    list.append(line);
  }

  const observer = new MutationObserver(() => refreshers.forEach((refresh) => refresh()));
  const world = root.querySelector('.village-world');
  if (world) {
    observer.observe(world, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-activity', 'data-food', 'class'],
    });
  }

  dialog.onclose = () => {
    observer.disconnect();
    dialog.remove();
  };
  root.append(dialog);
  dialog.showModal();
}
