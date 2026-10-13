import { DECK_UNITS, validDeck } from '../run/RunDeck';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { roleForBeast, signatureForBeast } from '../battle/BeastRoles';
import { signatureTierTagline } from '../run/StarProfile';
import type { BeastId } from './icons/UnitIconRegistry';
import { isCompactLandscape } from './layout/MobilePresentation';
import { loadCamp } from '../run/CampState';
import { forgeGoal } from '../run/VillageGoal';

export function showDeckPicker(start: (deck: string[]) => void, back?: () => void, levelName?: string): void {
  let saved: string[] | undefined;
  try { saved = validDeck(JSON.parse(localStorage.getItem('beast-link-deck-v1') ?? 'null')); } catch { /* Default deck remains available. */ }
  const selected = new Set(saved ?? DECK_UNITS.slice(0, 6));
  const root = document.createElement('section');
  root.className = 'deck-picker';
  root.innerHTML = '<header class="deck-header"><button class="deck-back" aria-label="Back to menu">←</button><div class="deck-title"><h1>Build Your <em>Deck</em></h1><p>Choose 6 types · recruit and deploy during the Run</p></div><div class="deck-counter"><strong class="deck-count"></strong><span>selected<small>Locked across Waves</small></span></div></header><div class="deck-selected" aria-label="Selected squad"></div><div class="deck-cards"></div><footer><p class="deck-message" role="status" aria-live="polite"></p><button class="deck-start">Start Run →</button></footer>';
  const backButton = root.querySelector<HTMLButtonElement>('.deck-back')!;
  if (levelName) root.querySelector('.deck-title p')!.textContent = `${levelName} · Choose 6 types for this Run`;
  const camp=loadCamp(),needsIronclad=camp.trackedGoal==='forge'&&!forgeGoal(camp).resident;
  if(needsIronclad)root.querySelector('.deck-title p')!.textContent='Mục tiêu mở xưởng: chọn Ironclad để có thể chiêu mộ trong Beast Rush';
  backButton.setAttribute('aria-label', 'Back to level selection');
  backButton.hidden = !back;
  const cleanup = () => window.removeEventListener('resize', update);
  backButton.onclick = () => transitionScreen(root,()=>{cleanup();root.remove();back?.();});
  const cards = root.querySelector('.deck-cards')!;
  const count = root.querySelector('.deck-count')!;
  const button = root.querySelector<HTMLButtonElement>('.deck-start')!;
  const update = () => {
    count.textContent = `${selected.size}/6`;
    root.querySelector('.deck-message')!.textContent = selected.size === 6 ? 'Deck ready · unselect a card to swap a Beast' : `Choose ${6 - selected.size} more Beasts`;
    if(needsIronclad&&!selected.has('beast-e'))root.querySelector('.deck-message')!.textContent='Deck chưa có Ironclad · Bạn vẫn có thể thám hiểm tự do';
    const portrait = isCompactLandscape() && window.innerHeight > window.innerWidth;
    button.disabled = selected.size !== 6 || portrait;
    if (portrait && selected.size === 6) root.querySelector('.deck-message')!.textContent = 'Deck ready · rotate to landscape to start';
    const lineup = root.querySelector('.deck-selected')!;
    lineup.replaceChildren();
    for (const id of selected) {
      const chip = document.createElement('button'); chip.className = 'deck-selected-unit';
      chip.setAttribute('aria-label', `Remove ${beastDisplayName(id)}`);
      chip.innerHTML = `<img src="${BATTLE_CHARACTER_ART[id as BeastId].icon}" alt=""><span>×</span>`;
      chip.onclick = () => { selected.delete(id); root.querySelector(`[data-beast="${id}"]`)?.setAttribute('aria-pressed', 'false'); update(); };
      lineup.append(chip);
    }
  };
  DECK_UNITS.forEach(id => {
    const card = document.createElement('button');
    card.className = 'deck-card';
    card.dataset.beast = id;
    card.setAttribute('aria-pressed', String(selected.has(id)));
    card.innerHTML = `<i class="deck-check" aria-hidden="true">✓</i><img src="${BATTLE_CHARACTER_ART[id].icon}" alt=""><strong>${beastDisplayName(id)}</strong><span>${roleForBeast(id)}</span><small>3★ · ${signatureTierTagline(signatureForBeast(id), 3)}</small>`;
    card.onclick = () => {
      if (selected.has(id)) selected.delete(id); else if (selected.size < 6) selected.add(id);
      else { root.querySelector('.deck-message')!.textContent = 'Deck full — unselect a Beast first'; return; }
      card.setAttribute('aria-pressed', String(selected.has(id)));
      update();
    };
    cards.append(card);
  });
  button.onclick = () => {
    const deck = DECK_UNITS.filter(id => selected.has(id));
    if (!validDeck(deck)) return;
    try { localStorage.setItem('beast-link-deck-v1', JSON.stringify(deck)); } catch { /* Storage is optional. */ }
    transitionScreen(root,()=>{cleanup();root.remove();start(deck);});
  };
  document.getElementById('game-shell')!.append(root);
  update();
  window.addEventListener('resize', update);
}
import { transitionScreen } from './SceneTransition';
