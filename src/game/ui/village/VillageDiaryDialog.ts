import { BATTLE_CHARACTER_ART } from '../art/BattleCharacterManifest';
import { beastDisplayName, type BeastId } from '../icons/UnitIconRegistry';
import { CAMP_DECOR, type CampState } from '../../run/CampState';

export function showVillageDiaryDialog(root: HTMLElement, state: CampState): void {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog village-diary-dialog';
  dialog.setAttribute('aria-labelledby', 'village-diary-title');

  const header = document.createElement('header');
  header.className = 'diary-panel-header';
  const heading = document.createElement('h2');
  heading.id = 'village-diary-title';
  heading.textContent = 'Nhật ký làng';
  header.append(heading);
  dialog.append(header);

  const close = document.createElement('button');
  close.className = 'diary-panel-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Đóng nhật ký');
  close.onclick = () => dialog.close();
  header.append(close);

  const hint = document.createElement('p');
  hint.className = 'diary-panel-hint';
  hint.textContent = state.diary.length
    ? `${state.diary.length} câu chuyện · Mới nhất ở trên`
    : 'Những câu chuyện nhỏ của làng';
  dialog.append(hint);

  const list = document.createElement('ol');
  list.className = 'diary-event-list';
  dialog.append(list);

  const iconSvg =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h4"/></svg>';

  for (const line of [...state.diary].reverse()) {
    const event = document.createElement('li');
    event.className = 'diary-event';

    const id = line.match(/beast-[a-j]/)?.[0] ?? CAMP_DECOR.find((decor) => decor.meme === line)?.favorite;
    const portrait = document.createElement('span');
    portrait.className = 'diary-event-portrait';

    if (id && BATTLE_CHARACTER_ART[id as BeastId]?.base) {
      const sprite = document.createElement('img');
      sprite.src = BATTLE_CHARACTER_ART[id as BeastId].base!;
      sprite.alt = '';
      portrait.append(sprite);
    } else {
      portrait.innerHTML = iconSvg;
    }

    const content = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = line.includes('vừa gia nhập')
      ? 'Bạn mới đến làng'
      : line.startsWith('Run thắng')
      ? 'Chuyến phiêu lưu'
      : id
      ? beastDisplayName(id)
      : 'Chuyện trong làng';

    const p = document.createElement('p');
    p.textContent = line.replace(/beast-[a-j]/g, (beastId) => beastDisplayName(beastId));
    content.append(label, p);
    event.append(portrait, content);
    list.append(event);
  }

  if (!state.diary.length) {
    const p = document.createElement('p');
    p.className = 'diary-empty';
    p.textContent =
      'Làng còn yên ắng. Đưa thú về làng và khám phá công việc của họ để có những câu chuyện đầu tiên.';
    list.append(p);
  }

  root.append(dialog);
  dialog.showModal();
  dialog.onclose = () => dialog.remove();
}
