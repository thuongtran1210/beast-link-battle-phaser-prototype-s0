# Battle Sprite Integration Plan — Authored Character Art

Status: **M2 IMPLEMENTED / CI PASS / STARCALLER LIVE VISUAL QA NEXT / GAMEPLAY FROZEN**

Date: 2026-10-07

## Goal

Replace temporary rectangular Battle tokens with authored full-body chibi characters while preserving all current combat semantics, STAR behavior and Signature logic.

The integration must be reversible and fallback-safe.

```text
AUTHORED ART AVAILABLE
→ use authored battle sprite / pose

AUTHORED ART MISSING
→ use current procedural portrait fallback

GAMEPLAY LOGIC
→ unchanged
```

---

# 1. Scope

## In scope

- authored Beast battle character assets;
- pose-based battle presentation;
- asset loading and fallback;
- Battle unit visual container refactor;
- HP / STAR / Signature anchors;
- character facing;
- simple idle / hit / attack / Signature / KO pose swaps;
- runtime QA at 1280×720;
- portfolio capture after art integration.

## Out of scope

- new gameplay mechanics;
- new Beast identities;
- balance changes;
- new Signature rules;
- skeletal animation framework;
- complex animation state machine;
- equipment visuals;
- skins;
- production-grade frame animation;
- enemy AI changes.

---

# 2. Implementation strategy

## Phase 1 — Pose-swap integration

Use one authored transparent image per important pose.

Minimum states:

```text
idle
move
attack
signature
hit
ko
```

State changes are presentation-only.

Recommended first implementation:
- image swap;
- small Phaser tweens;
- squash/stretch;
- opacity/tint hit feedback;
- existing Signature VFX layered above the character.

Do not introduce a full animation system until pose-swap quality has been evaluated in runtime.

## Phase 2 — Optional spritesheet upgrade

Only if the static-pose approach is visibly insufficient.

Potential later upgrade:
- idle 2–4 frames;
- move 4–6 frames;
- attack 3–5 frames;
- Signature 3–5 frames;
- KO 3–5 frames.

This is not required for the portfolio vertical slice.

---

# 3. Asset contract

## Directory structure

```text
public/assets/beasts/
  starcaller/
    portrait.png
    battle_idle.png
    battle_move.png
    battle_attack.png
    battle_signature.png
    battle_hit.png
    battle_ko.png

  snowguard/
  ironclad/
  windstrider/
  swiftwing/
  shadowclaw/
```

Enemy art:

```text
public/assets/enemies/
  frontliner/
  diver/
  ranged/
```

## File requirements

- PNG with transparent background.
- One consistent canvas size per asset family.
- Character feet / ground point aligned to the same anchor.
- Safe padding around props, ears, wings and VFX.
- No baked UI, text, HP bar or STAR badge.
- No baked glow that makes recoloring / effect stacking difficult.

## Recommended working canvas

For Beast pose assets:

```text
512 × 512 source
transparent
feet anchor around 75–82% of canvas height
```

Runtime can downscale aggressively.

Do not create tiny source art only for the current runtime size.

---

# 4. Asset manifest

Create:

`src/game/ui/art/BattleCharacterManifest.ts`

Responsibilities:
- Beast ID → art directory;
- pose → asset key/path;
- character scale;
- ground offset;
- optional VFX anchor offsets;
- optional portrait path;
- authored/fallback availability.

Suggested interface:

```ts
export type BattlePose =
  | 'idle'
  | 'move'
  | 'attack'
  | 'signature'
  | 'hit'
  | 'ko';

export interface BattleCharacterArtDefinition {
  beastId: string;
  slug: string;
  scale: number;
  groundOffsetY: number;
  effectAnchorY: number;
  poses: Partial<Record<BattlePose, string>>;
}
```

Do not encode gameplay stats in this manifest.

---

# 5. Asset loading

Create:

`src/game/ui/art/BattleCharacterLoader.ts`

Responsibilities:
- preload known authored assets;
- use deterministic texture keys;
- expose availability checks.

Example texture naming:

```text
battle-beast-d-idle
battle-beast-d-attack
battle-beast-d-signature
```

Loader behavior:

```text
path exists / loaded
→ authored texture

missing / load error
→ no exception in gameplay
→ fallback portrait remains available
```

The loader must never prevent the scene from starting because one art file is missing.

---

# 6. Battle visual abstraction

Create:

`src/game/ui/art/BattleCharacterView.ts`

This should own the authored-art presentation for one combat unit.

Responsibilities:
- authored image or fallback image;
- pose changes;
- facing direction;
- scale;
- anchor;
- temporary tint;
- idle bob;
- simple death pose;
- effect source point.

Suggested API:

```ts
setPose(pose: BattlePose): void
setFacing(direction: 'left' | 'right'): void
setAlive(alive: boolean): void
playHit(): void
playAttack(): void
playSignature(): void
getEffectPoint(): { x: number; y: number }
destroy(): void
```

It must not:
- calculate damage;
- choose targets;
- know role AI;
- know Energy state;
- decide Signature activation.

---

# 7. BattleActionView refactor

Current `BattleActionView` mixes:
- unit card body;
- portrait;
- label;
- HP bar;
- Signature effects;
- positioning.

Refactor target:

```text
UnitVisual
  container
  characterView
  hpBar
  optional STAR marker
  state VFX
```

The current rectangular body becomes fallback-only.

## Keep

- HP bars;
- visual position offsets;
- Signature VFX;
- damage numbers;
- enemy separation;
- showcase mode;
- deterministic Battle model.

## Remove from authored-sprite mode

- permanent rectangular card body;
- permanent name/role label;
- portrait-in-card battlefield token.

---

# 8. Pose mapping

Presentation events should drive poses.

## Idle

Default whenever:
- alive;
- not moving;
- no temporary action pose.

## Move

When position changes materially.

May initially be:
- idle pose + horizontal bob / lean.

Authored `battle_move.png` optional in first pass.

## Attack

Triggered when a normal attack action is presented.

Return to idle after a short presentation window.

## Signature

Triggered from existing `SignatureFxPresentation`.

Important:
- Starcaller must visibly enter cast pose before / during Arcane Bloom.
- Ironclad must lean/charge for Iron Ram.
- Swiftwing must visibly open split-shot pose.
- Windstrider must use a clear Focus posture.
- Snowguard must brace.
- Shadowclaw must use a forward slash / lunge pose.

## Hit

Short pose/tint only.

Must not override Signature for too long.

## KO

Persistent until unit removed/reset.

---

# 9. Facing

Player Beast:
- faces toward enemy side.

Enemy:
- faces toward player side.

Use horizontal flip where the art style supports it.

Do not maintain separate left/right files unless asymmetric design makes flipping unacceptable.

---

# 10. HP / STAR presentation

## HP

Keep current compact HP bar.

Anchor:
- above character head;
- consistent vertical offset from art manifest.

## STAR

Battle should not use large role/name labels.

Options:
1. tiny STAR row below HP;
2. one small STAR badge;
3. omit STAR if Setup already communicates tier and Signature VFX communicates evolution.

Recommended:
- retain compact STAR indicator for portfolio capture;
- remove permanent unit name text once authored character identity is proven readable.

---

# 11. VFX anchors

Current Signature VFX use container coordinates.

After integration:

`BattleCharacterView.getEffectPoint()`

should be the source for:
- Arcane Bloom aura;
- Focus Shot line;
- Twin Volley trails;
- Guardian Brace;
- Iron Ram impact;
- Ambush trail.

This prevents VFX from being visually anchored to the feet / old card center.

---

# 12. First vertical slice — Starcaller

Starcaller is the integration benchmark.

## Required assets

```text
portrait.png
battle_idle.png
battle_attack.png
battle_signature.png
battle_hit.png
battle_ko.png
```

`battle_move.png` optional in first pass.

## Runtime acceptance

Starcaller passes when:

1. authored sprite appears automatically if assets are present;
2. procedural fallback appears if assets are absent;
3. sprite faces enemies;
4. HP bar remains aligned;
5. normal attack uses attack pose;
6. Arcane Bloom uses signature pose;
7. caster aura / links / explosions anchor correctly;
8. Hit does not permanently break pose state;
9. KO uses KO pose;
10. gameplay checks remain unchanged.

## Visual acceptance

Without label:
- viewer identifies it as magic/caster unit;
- silhouette does not resemble Ranger;
- purple celestial motif reads at screenshot size;
- Arcane Bloom hero frame is stronger than the previous portrait-card version.

---

# 13. Rollout order

After Starcaller is accepted:

## Wave A — Tank contrast

1. Snowguard
2. Ironclad

Acceptance:
- protector vs disruptor immediately readable.

## Wave B — Ranger contrast

3. Windstrider
4. Swiftwing

Acceptance:
- precision vs volley immediately readable.

## Wave C

5. Shadowclaw

Acceptance:
- Assassin/deep-strike fantasy immediately readable.

## Wave D — Enemies

6. Frontliner
7. Diver
8. Ranged

Enemies use the same renderer concept but less visual detail than player Beasts.

---

# 14. Technical milestones

## M1 — Art infrastructure

Status: **COMPLETE / CI PASS**

Implemented:
- `BattleCharacterManifest.ts`
- `BattleCharacterLoader.ts`
- `BattleCharacterView.ts`
- `ValidationScene.preload()` manifest loader hook
- `BattleActionView` character-view adapter
- attack / hit / Signature / KO pose event hooks
- authored effect anchor support
- permanent procedural fallback

M1 deliberately declares no authored pose paths, so it performs zero missing-asset requests.

Gate:
- deterministic checks PASS;
- production build PASS;
- GitHub Actions run 76 PASS;
- gameplay semantics unchanged.

## M2 — Starcaller authored integration

Status: **IMPLEMENTED / CI PASS / LIVE VISUAL QA OPEN**

Implemented:
- authored Starcaller idle / attack / signature / hit / KO vector poses;
- authored portrait source;
- SVG-aware manifest loader;
- Starcaller pose paths registered;
- attack / Signature / hit / KO event mapping through `BattleCharacterView`;
- authored HP/effect anchors;
- fallback retained for every other Beast;
- deterministic Starcaller art-contract checks wired into CI and startup.

Evidence:
- GitHub Actions run 89 PASS.

Remaining gate:
- live Battle screenshot confirming scale, ground anchor, HP anchor and Arcane Bloom alignment.

Do not begin Snowguard rollout until this live visual gate passes.

## M3 — Remaining Beast rollout

Integrate five remaining Beasts using the same manifest.

Gate:
- 6-Beast lineup + Battle QA.

## M4 — Enemy rollout

Frontliner / Diver / Ranged.

Gate:
- player and enemy silhouettes readable without labels.

## M5 — Cleanup

- remove battle-card chrome in authored mode;
- keep fallback code;
- confirm no debug labels;
- run checks/build.

## M6 — Portfolio capture

Capture:
- unit lineup;
- STAR Setup;
- Signature Hero;
- Tactical Energy;
- multi-wave consequence.

---

# 15. Regression gates

After each milestone:

```text
npm run check
npm run build
```

Also manually verify:

- Beast Rush unaffected;
- Energy Rush unaffected;
- Setup card unaffected;
- formation placement unaffected;
- target selection unchanged;
- STAR behavior unchanged;
- Tactical Energy unchanged;
- Wave transition unchanged.

Art bugs must not be fixed by changing gameplay semantics.

---

# 16. Fallback policy

Fallback is permanent, not temporary throwaway code.

Reasons:
- prevents broken runtime when one file is missing;
- enables incremental rollout Beast-by-Beast;
- keeps tests/assets decoupled;
- allows GitHub reviewers to run prototype before every art asset is complete.

Fallback priority:

```text
Authored battle pose
→ authored idle
→ procedural Beast portrait
```

---

# 17. Definition of Done

Battle sprite integration is complete when:

- six Beast authored battle sprites are active;
- three enemy archetypes are active;
- no player Beast uses rectangular Battle card chrome in normal showcase;
- all six Signature poses are readable;
- HP / STAR UI remains aligned;
- fallback works;
- deterministic checks pass;
- production build passes;
- final screenshots are portfolio-ready;
- no gameplay or balance rule changed during art integration.

---

# 18. Immediate next task

**M2 Live Visual QA — Starcaller**

1. refresh the latest build;
2. press `L` to enter the V15A Hero Battle;
3. confirm Starcaller appears as the authored full-body chibi Mage rather than a rectangular portrait token;
4. inspect HP-bar height and feet/ground anchor;
5. wait for `ARCANE BLOOM III`;
6. press `P` while the signature pose + Bloom VFX are visible;
7. capture the frame.

Acceptance:
- no visible card body behind Starcaller;
- Starcaller reads as Mage without a name/role label;
- cast pose and purple aura are aligned;
- HP bar does not intersect head/halo;
- Bloom originates from the upper-body/orb area;
- KO/hit pose does not jump the ground anchor.

Only after this gate: **M3A Snowguard authored rollout**.
