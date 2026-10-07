# Beast Rush / Energy Rush — UI Style Lock

Status: **IMPLEMENTED / SHARED VISUAL SYSTEM / LIVE QA NEXT**

Date: 2026-10-07

## Direction

Beast Rush and Energy Rush must read as two phases of the same game, not two unrelated prototype screens.

Shared presentation language:

- dark navy / celestial background;
- neon pastel identity accents;
- rounded card-like hierarchy;
- high-contrast timer as the dominant right-rail element;
- glowing puzzle tiles;
- one shared board frame language;
- one shared right-rail hierarchy;
- player-facing labels only;
- no internal IDs / debug terminology in Showcase Mode.

The visual inspiration is broad casual-mobile readability:
- strong silhouette;
- compact hierarchy;
- vivid but controlled accent colors;
- immediate readability at 1280×720.

Do not copy any commercial game's specific characters, icons or UI composition.

---

## Shared hierarchy

```text
PHASE HEADER
→ DOMINANT TIMER
→ MATCH / STATE STATS
→ COLLECTED RESOURCES
→ RECENT ACTION
```

Both phases must use this order.

---

## Beast Rush

### Accent family
- Gold = timer / reward / positive recruit consequence
- Violet = phase chrome / celestial identity
- Beast-specific colors remain on tiles and recruited-unit rows

### Board
- 6×6 dark celestial board mat
- each Beast tile:
  - dark navy tile body;
  - Beast identity border;
  - soft matching-color halo;
  - portrait badge;
  - compact role label
- selected pair gets stronger glow, not a completely different visual language
- valid Onet path:
  - warm gold glow underlay
  - bright white core

### Right rail
- phase context: RECRUIT PHASE
- dominant timer / READY state
- Matches / Recruited
- Recruited Beasts
- single recent-action feedback line

---

## Energy Rush

### Accent family
- Cyan / electric blue = phase chrome / timer / valid Energy route
- individual Tactical Energy colors remain:
  - MEND = cyan
  - RESCUE = violet
  - BREAK = green
  - PIERCE = gold

### Board
Uses exactly the same board skeleton as Beast Rush.

Differences are identity-only:
- circular Energy medallions instead of Beast portrait badges;
- Energy name below each tile;
- valid match path uses cyan-blue glow underlay with bright white core.

### Right rail
- phase header: ENERGY RUSH
- dominant Energy timer
- READY / ACTIVE state
- total matches
- Stored Energy list
- recent action

Each Stored Energy row inherits its Energy identity color.

---

## Global HUD

The top HUD uses the same dark celestial chrome.

Phase accents:
- Beast Rush = gold
- Energy Rush = cyan
- Setup = violet
- Battle = green
- Wave Result = pink

Active phase receives a small neon marker.
Inactive phases stay muted.

---

## Guardrails

- Style changes must not alter puzzle rules.
- First-valid-match timer semantics remain unchanged.
- Energy identity semantics remain unchanged.
- Onet path validity remains ≤2 turns.
- No visual effect may obscure tile identity or route readability.
- Runtime art may later replace procedural Beast portraits, but layout and hierarchy should remain stable.

---

## Live QA checklist

At 1280×720:

### Beast Rush
- phase reads within 2 seconds;
- timer is the strongest right-rail focal point;
- six Beast identities remain readable;
- selected tile state is obvious;
- recruited queue does not look like a debug inventory;
- gold match route is readable over the board.

### Energy Rush
- immediately reads as a different phase without feeling like a different game;
- MEND / RESCUE / BREAK / PIERCE are distinguishable at tile scale;
- READY → MATCH TO START is readable;
- Stored Energy list matches board icon language;
- cyan match route is readable.

### Cross-phase consistency
- same spacing rhythm;
- same panel surfaces;
- same typography hierarchy;
- same board frame language;
- same interaction feedback quality.

## Next

1. Live capture Beast Rush.
2. Live capture Energy Rush.
3. Fix overflow / weak contrast only.
4. Freeze Rush UI.
5. Continue authored Beast/character art integration.
