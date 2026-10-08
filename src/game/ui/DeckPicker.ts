import { DECK_UNITS, validDeck } from '../run/RunDeck';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { roleForBeast, signatureForBeast } from '../battle/BeastRoles';
import { signatureTierTagline } from '../run/StarProfile';

export function showDeckPicker(start: (deck: string[]) => void): void {
  let saved: string[] | undefined;
  try { saved = validDeck(JSON.parse(localStorage.getItem('beast-link-deck-v1') ?? 'null')); } catch { /* Default deck remains available. */ }
  const selected = new Set(saved ?? DECK_UNITS.slice(0, 6));
  const root = document.createElement('section');
  root.className = 'deck-picker';
  root.innerHTML = '<header><h1>Build your deck</h1><p>Choose exactly 6 Beast types for this Run. Deploy up to 4 recruited units per Wave.</p></header><div class="deck-cards"></div><footer><span class="deck-count"></span><button class="deck-start">Start Run</button></footer>';
  const cards = root.querySelector('.deck-cards')!;
  const count = root.querySelector('.deck-count')!;
  const button = root.querySelector<HTMLButtonElement>('.deck-start')!;
  const update = () => {
    count.textContent = `${selected.size}/6 selected · deck stays locked across Waves`;
    button.disabled = selected.size !== 6;
  };
  DECK_UNITS.forEach(id => {
    const card = document.createElement('button');
    card.className = 'deck-card';
    card.setAttribute('aria-pressed', String(selected.has(id)));
    card.innerHTML = `<img src="${BATTLE_CHARACTER_ART[id].icon}" alt=""><strong>${beastDisplayName(id)}</strong><span>${roleForBeast(id)}</span><small>3★ · ${signatureTierTagline(signatureForBeast(id), 3)}</small>`;
    card.onclick = () => {
      if (selected.has(id)) selected.delete(id); else if (selected.size < 6) selected.add(id);
      card.setAttribute('aria-pressed', String(selected.has(id)));
      update();
    };
    cards.append(card);
  });
  button.onclick = () => {
    const deck = DECK_UNITS.filter(id => selected.has(id));
    if (!validDeck(deck)) return;
    try { localStorage.setItem('beast-link-deck-v1', JSON.stringify(deck)); } catch { /* Storage is optional. */ }
    root.remove(); start(deck);
  };
  document.getElementById('game-shell')!.append(root);
  update();
}
