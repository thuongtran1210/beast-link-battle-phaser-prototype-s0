import { CAMP_DECOR, parseCamp, saveCamp, type CampState } from '../../run/CampState';
import { commitCampDecor } from '../../run/VillageGoal';
import { beastDisplayName } from '../icons/UnitIconRegistry';

export interface VillageWorkshopPanelContext {
  workshop: HTMLElement;
  state: CampState;
  slot: number;
  props: Record<string, string>;
  onSlotChange: (newSlot: number) => void;
  onStateChange: () => void;
  onClose: () => void;
  onStatus: (message: string) => void;
}

export const WORKSHOP_DECOR_NAMES: Record<string, string> = {
  bath: 'Bồn tắm vịt',
  carrot: 'Cà rốt khổng lồ',
  anvil: 'Xưởng đồ chơi',
};

/**
 * Renders the furniture/decor building workshop panel in the village camp.
 */
export function renderVillageWorkshopPanel(ctx: VillageWorkshopPanelContext): void {
  const { workshop, state, slot, props, onSlotChange, onStateChange, onClose, onStatus } = ctx;
  workshop.replaceChildren();

  const header = document.createElement('header');
  header.className = 'build-panel-header';

  const heading = document.createElement('strong');
  heading.className = 'village-build-heading';
  heading.textContent = 'Xây dựng';
  header.append(heading);

  const balance = document.createElement('span');
  balance.className = 'build-balance';
  balance.textContent = `Gỗ ${state.wood}`;
  header.append(balance);

  const closeWorkshop = document.createElement('button');
  closeWorkshop.className = 'village-build-close';
  closeWorkshop.textContent = '×';
  closeWorkshop.setAttribute('aria-label', 'Đóng xây dựng');
  closeWorkshop.onclick = onClose;
  header.append(closeWorkshop);
  workshop.append(header);

  const slots = document.createElement('div');
  slots.className = 'build-slot-tabs';
  slots.setAttribute('aria-label', 'Chọn vị trí trang trí');
  state.slots.forEach((item, index) => {
    const tab = document.createElement('button');
    tab.textContent = `${index + 1} · ${item ? 'Đã đặt' : 'Trống'}`;
    tab.setAttribute('aria-pressed', String(slot === index));
    tab.onclick = () => onSlotChange(index);
    slots.append(tab);
  });
  workshop.append(slots);

  const list = document.createElement('div');
  list.className = 'build-card-list';
  workshop.append(list);

  CAMP_DECOR.forEach((decor) => {
    const button = document.createElement('button');
    button.className = 'build-decor-card';
    const owned = state.crafted.includes(decor.id);
    const placed = state.slots[slot] === decor.id;
    const action = placed ? 'Đã đặt' : owned ? 'Đặt' : `Chế tạo · ${decor.cost} Gỗ`;
    const note = placed
      ? `Ở vị trí ${slot + 1}`
      : owned
      ? 'Đã sở hữu'
      : state.wood < decor.cost
      ? `Thiếu ${decor.cost - state.wood} Gỗ`
      : 'Chế tạo và đặt vào vị trí đã chọn';

    const previewSvg = props[decor.id]?.replaceAll('camp-furniture', 'build-furniture') ?? '';
    button.innerHTML = `<span class="build-decor-preview">${previewSvg}</span><span class="build-decor-info"><strong>${
      WORKSHOP_DECOR_NAMES[decor.id] ?? decor.name
    }</strong><span>${note}</span><small>${beastDisplayName(decor.favorite)}</small></span><span class="build-decor-action">${action}</span>`;
    button.disabled = placed || (!owned && state.wood < decor.cost);
    button.setAttribute('aria-label', `${WORKSHOP_DECOR_NAMES[decor.id] ?? decor.name} · ${note} · ${action}`);

    button.onclick = () => {
      if (commitCampDecor(state, decor.id, slot)) {
        onStatus(`Đã đặt ${WORKSHOP_DECOR_NAMES[decor.id]} ở vị trí ${slot + 1}`);
        onStateChange();
      } else {
        onStatus('Chưa lưu được xây dựng. Vui lòng thử lại.');
      }
    };
    list.append(button);
  });

  const clear = document.createElement('button');
  clear.className = 'build-clear-slot';
  clear.textContent = state.slots[slot]
    ? `Cất ${WORKSHOP_DECOR_NAMES[state.slots[slot]!] ?? 'đạo cụ'} vào kho`
    : 'Vị trí đang trống';
  clear.disabled = !state.slots[slot];
  clear.onclick = () => {
    const candidate = parseCamp(state);
    candidate.slots[slot] = null;
    if (saveCamp(candidate)) {
      Object.assign(state, candidate);
      onStateChange();
    } else {
      onStatus('Chưa lưu được thay đổi.');
    }
  };
  workshop.append(clear);
}
