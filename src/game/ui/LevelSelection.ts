import { RUN_LEVELS, completedRunLevels, type RunLevelId } from '../run/RunLevels';

export function showLevelSelection(choose: (id: RunLevelId) => void, back: () => void): void {
  const root = document.createElement('section'); root.className = 'level-selection';
  root.innerHTML = '<header class="deck-header"><button class="deck-back" aria-label="Back to menu">←</button><div><h1>Choose your adventure</h1><p>3 Waves per Run · choose a region, then build your deck</p></div></header><div class="level-cards"></div><footer>All regions available · progress saved on this device</footer>';
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick = () => { root.remove(); back(); };
  const completed = completedRunLevels();
  for (const level of RUN_LEVELS) {
    const card = document.createElement('button'); card.className = `level-card level-${level.id}`;
    card.innerHTML = `<div class="level-art"><span class="level-number">${level.label}</span><img src="${level.portrait}" alt=""><span class="level-complete">${completed.includes(level.id) ? '✓ CLEARED' : '3 WAVES'}</span></div><div class="level-copy"><h2>${level.name}</h2><strong>${level.theme}</strong><p>${level.description}</p><span class="level-enter">Build deck →</span></div>`;
    card.onclick = () => { root.remove(); choose(level.id); };
    root.querySelector('.level-cards')!.append(card);
  }
  document.getElementById('game-shell')!.append(root);
}
