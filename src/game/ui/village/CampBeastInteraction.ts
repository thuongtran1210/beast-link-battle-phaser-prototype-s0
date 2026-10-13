import { BATTLE_CHARACTER_ART } from '../art/BattleCharacterManifest';
import { beastDisplayName, type BeastId } from '../icons/UnitIconRegistry';
import { villageProfession } from '../../run/VillageCatalog';
import { CAMP_DECOR, type CampState } from '../../run/CampState';
import { villageWorkPercent } from '../../run/VillageSceneLayout';
import type { CampActivityController } from './CampActivityController';
import { getResidentBanter } from '../../run/VillageIncidents';

export const RESIDENT_DEFAULT_POSITIONS: readonly [number, number][] = [
  [36, 29], [52, 40], [22, 36], [60, 27], [36, 51],
  [56, 55], [13, 52], [60, 73], [47, 43], [54, 68],
];

export const RESIDENT_SPECIAL_HOMES: Readonly<Record<string, [number, number]>> = {
  'beast-e': [39, 48],
  'beast-c': [34, 58],
  'beast-b': [62, 70],
};

export interface CampBeastInteractionContext {
  state: CampState;
  ground: HTMLElement;
  garden: HTMLElement;
  fishing: HTMLElement;
  activities: CampActivityController;
  onStatus: (message: string) => void;
}

/**
 * Manages rendering, activity binding, speech bubbles, and banter interactions
 * for village residents inside the camp view.
 */
export class CampBeastInteractionManager {
  private activeBubbleTimer: number | null = null;
  private currentBubble: HTMLElement | null = null;

  constructor(private readonly ctx: CampBeastInteractionContext) {}

  public renderResidents(): void {
    const { state, ground, garden, fishing, activities, onStatus } = this.ctx;

    if (!state.residents.length) {
      const empty = document.createElement('p');
      empty.className = 'camp-empty';
      empty.textContent = 'Recruit Beasts in a Run to bring them home.';
      ground.append(empty);
      return;
    }

    state.residents.slice(0, 10).forEach((id, index) => {
      const beast = document.createElement('button');
      beast.className = 'camp-beast';

      const [x, y] = RESIDENT_SPECIAL_HOMES[id] ?? RESIDENT_DEFAULT_POSITIONS[index];
      beast.style.left = `${x}%`;
      beast.style.top = `${y}%`;
      beast.style.zIndex = String(Math.round(y));
      beast.style.animationDelay = `-${index * 1.7}s`;
      beast.dataset.beastId = id;
      beast.setAttribute('aria-label', `Interact with ${beastDisplayName(id)}`);

      const art = BATTLE_CHARACTER_ART[id as BeastId]?.base ?? '';
      beast.innerHTML = `<img src="${art}" alt=""><small>${beastDisplayName(id)}</small>`;

      // Visual tool decorations
      if (id === 'beast-c') {
        beast.insertAdjacentHTML(
          'beforeend',
          '<span class="village-water-tool" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M10 18 Q-2 18 4 35" fill="none" stroke="#3b4235" stroke-width="5"/><path d="M12 15 H40 V44 H12 Z M40 25 L64 16 L68 23 L40 36" fill="#81bca3" stroke="#3b4235" stroke-width="3"/><path d="M64 30 L70 43 M70 28 L77 40" stroke="#73bed0" stroke-width="3"/></svg></span>',
        );
      }
      if (id === 'beast-b') {
        beast.insertAdjacentHTML('beforeend', '<span class="village-rod" aria-hidden="true"></span>');
      }

      // Activity registration
      const favorite = CAMP_DECOR.find((d) => d.favorite === id && state.slots.includes(d.id));
      if (id === 'beast-c') {
        activities.add(beast, garden, 'garden', x, y, villageWorkPercent('garden'));
      } else if (id === 'beast-b') {
        activities.add(beast, fishing, 'fishing', x, y, villageWorkPercent('fishing'));
      } else if (favorite) {
        const station = ground.querySelector<HTMLElement>(`.camp-station[data-decor="${favorite.id}"]`);
        if (station) {
          activities.add(
            beast,
            station,
            favorite.id,
            x,
            y,
            favorite.id === 'anvil' ? villageWorkPercent('forge') : undefined,
          );
        }
      }

      // Interaction click handler: Status bar + Speech bubble banter
      beast.onclick = () => {
        const profession = favorite?.meme ?? villageProfession(id)?.name ?? 'Cư dân';
        const activity = beast.dataset.activity ?? 'Đang nghỉ';
        onStatus(`${beastDisplayName(id)}: ${activity} · ${profession}`);

        // Trigger humorous Gen Z speech bubble
        const banter = getResidentBanter(id);
        this.showSpeechBubble(beast, banter);
      };

      ground.append(beast);
    });
  }

  public showSpeechBubble(targetEl: HTMLElement, text: string): void {
    if (this.currentBubble) {
      this.currentBubble.remove();
      this.currentBubble = null;
    }
    if (this.activeBubbleTimer !== null) {
      window.clearTimeout(this.activeBubbleTimer);
      this.activeBubbleTimer = null;
    }

    const bubble = document.createElement('div');
    bubble.className = 'camp-speech-bubble';
    bubble.textContent = text;
    targetEl.append(bubble);
    this.currentBubble = bubble;

    // Pop animation trigger
    targetEl.classList.remove('camp-poke-anim');
    // Force reflow
    void targetEl.offsetWidth;
    targetEl.classList.add('camp-poke-anim');

    this.activeBubbleTimer = window.setTimeout(() => {
      bubble.remove();
      if (this.currentBubble === bubble) {
        this.currentBubble = null;
      }
    }, 3200);
  }

  public showIncidentNotification(targetEl: HTMLElement, icon: string, text: string): void {
    this.showSpeechBubble(targetEl, `${icon} ${text}`);
  }

  public dispose(): void {
    if (this.activeBubbleTimer !== null) {
      window.clearTimeout(this.activeBubbleTimer);
      this.activeBubbleTimer = null;
    }
    if (this.currentBubble) {
      this.currentBubble.remove();
      this.currentBubble = null;
    }
  }
}
