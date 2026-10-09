import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { showCamp } from './CampView';

/** DOM navigation stays separate from the pre-run deck and gameplay scene. */
export function showMainMenu(play: () => void): void {
  const root = document.createElement('section');
  root.className = 'main-menu';
  root.innerHTML = `<div class="menu-copy"><span class="menu-eyebrow">A LITTLE SQUAD. A BIG ADVENTURE.</span><h1>Beast Link<br><em>Battle</em></h1><p>Match Beasts. Build your squad.<br>Turn a tiny team into a ridiculous legend.</p><div class="menu-actions"><button class="menu-play">Play <span>Choose a region →</span></button><button class="menu-help">How to play</button><button class="menu-fullscreen">Full screen</button></div><small class="menu-footnote">6 Beast types · 3 Waves · one Run</small></div><div class="menu-party" aria-hidden="true">${(['beast-e', 'beast-d', 'beast-f'] as const).map(id => `<img src="${BATTLE_CHARACTER_ART[id].base}" alt="">`).join('')}</div>`;
  root.querySelector<HTMLButtonElement>('.menu-play')!.onclick = () => { root.remove(); play(); };
  const camp = document.createElement('button'); camp.textContent='Camp & Dorm';
  camp.onclick=()=>{root.remove();showCamp(()=>showMainMenu(play));};
  root.querySelector('.menu-actions')!.append(camp);
  root.querySelector<HTMLButtonElement>('.menu-help')!.onclick = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    dialog.innerHTML = '<h2>Your next adventure</h2><ol><li><strong>Build your deck</strong><p>Choose 6 Beast types before the Run.</p></li><li><strong>Match pairs</strong><p>Beast Rush recruits units. Energy Rush stores tactical skills. The first pair starts the timer.</p></li><li><strong>Arrange & merge</strong><p>Tap a unit, then a board slot. Merge eligible copies or spend 2 Link Shards to deploy a fifth unit.</p></li><li><strong>Watch & cast</strong><p>Your squad fights automatically. Tap an Energy button to help; hold it to read the effect.</p></li></ol><button class="dialog-close">Got it</button>';
    root.append(dialog); dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')!.onclick = () => dialog.close();
    dialog.onclose = () => dialog.remove();
  };
  const fullscreen = root.querySelector<HTMLButtonElement>('.menu-fullscreen')!;
  fullscreen.onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { fullscreen.textContent = 'Full screen unavailable'; }
  };
  document.getElementById('game-shell')!.append(root);
}
