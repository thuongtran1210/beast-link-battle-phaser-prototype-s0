# P1-V15A — Unit Identity & STAR Evolution

Status: **IMPLEMENTED / DETERMINISTIC PASS / BUILD PASS / LIVE VISUAL QA OPEN / EXPERIMENTAL**

Date: 2026-10-07

## Design problem

The current Battle loop had meaningful formation/resource structure, but individual units still felt too interchangeable in motion.

Observed player-facing problem:
- role labels alone did not create enough unit fantasy;
- Mage did not visually read as a spell caster;
- the two Tankers and two Rangers shared too much behavior;
- STAR 1★ / 2★ / 3★ mostly changed stat magnitude rather than the way a Beast played.

V15A asks:

> **Can each Beast own one readable combat identity, while STAR consolidation changes the behavior of that identity rather than only increasing numbers?**

## Guardrails

- Six existing Beasts only.
- One Signature identity per Beast.
- No mana bar, skill tree, equipment, ultimate system or new progression layer.
- STAR evolution must stay deterministic.
- Role identity remains the broad combat function.
- Beast identity defines **how that role is expressed**.
- This slice is Experimental until live visual/readability QA passes.

## Identity matrix

| Beast | Role | Signature | 1★ | 2★ | 3★ |
|---|---|---|---|---|---|
| **SNOWGUARD** | Tanker | Guardian Brace | Shields first intercept | Can Brace a second intercept | Shares part of Brace with the most pressured ally |
| **SHADOWCLAW** | Assassin | Ambush Strike | Burst first deep target | Can re-arm for a second deep target | Ambush kill chains one follow-up strike |
| **WINDSTRIDER** | Ranger | Focus Shot | Safe Hold charges Focus | Focus charges faster | Focus pierces one extra target |
| **STARCALLER** | Mage | Arcane Bloom | Cluster triggers splash | Larger radius / more splash targets | Bloom adds an Echo impact |
| **IRONCLAD** | Tanker | Iron Ram | Opening Ram knocks Frontliner back | Ram also staggers recovery | Ram cleaves one nearby enemy |
| **SWIFTWING** | Ranger | Twin Volley | Every 3rd shot fires a second arrow | Every 2nd shot triggers Volley | Every shot can hit two extra targets |

## Role vs Beast identity

```text
ROLE = broad battlefield responsibility
BEAST = unique way that responsibility is expressed
STAR = evolution of that Beast's signature behavior
```

Examples:

**Tanker**
- Snowguard = protection / barrier / ally preservation.
- Ironclad = disruption / knockback / stagger / cleave.

**Ranger**
- Windstrider = patient precision / charged Focus.
- Swiftwing = cadence / multi-target pressure.

## STAR trade-off

The consolidation decision should become more than raw power density.

```text
3 × 1★ bodies
→ breadth
→ more bodies / coverage / reserve resilience

1 × higher-STAR body
→ fewer bodies
→ stronger or behaviorally upgraded Signature
→ more value per Active Squad slot
```

This reinforces the existing V14B.3 breadth-vs-density experiment.

## Implemented combat behavior

### Snowguard — Guardian Brace
- Uses existing interception relationship.
- 1★ has one Brace activation.
- 2★ can Brace a second intercept.
- 3★ shares 45% of the Brace shield with the lowest-health-ratio living ally.
- Shared shield records Guardian Brace as its source.

### Shadowclaw — Ambush Strike
- Prefers deep targets.
- STAR controls the number of Ambush re-arms: 1 / 2 / 3.
- 3★ converts an Ambush kill into one deterministic follow-up strike against another living enemy.

### Windstrider — Focus Shot
- Safe Hold time charges Focus.
- 1★ threshold: 1.6s.
- 2★ threshold: 1.25s.
- 3★ threshold: 1.0s and the focused shot can pierce one extra target.

### Starcaller — Arcane Bloom
- Clustered enemies activate Bloom.
- STAR increases Bloom footprint / target count.
- 3★ adds one Echo impact to the lowest-HP living enemy after Bloom.
- Mage remains the primary readable area-pressure identity.

### Ironclad — Iron Ram
- Own Signature distinct from Snowguard.
- Opening Ram gains STAR-scaled impact damage and deterministic knockback.
- 2★ adds recovery stagger.
- 3★ adds one nearby cleave target.

### Swiftwing — Twin Volley
- Own Signature distinct from Windstrider.
- 1★ volleys every 3rd attack.
- 2★ volleys every 2nd attack.
- 3★ volleys every attack and can hit two secondary targets.

## Player-facing presentation

Battle presentation now receives Signature activation events.

Runtime VFX grammar:
- Guardian Brace → blue/gold barrier rings.
- Ambush Strike → rose slash/trail feedback.
- Focus Shot → green precision line / impact.
- Arcane Bloom → purple multi-target pulse.
- Iron Ram → cyan impact trail / knockback punctuation.
- Twin Volley → pink multi-target projectile trails.

Battle Setup Reserve cards expose:
- Beast identity;
- role + STAR;
- Fresh / Injured / KO state;
- Signature tier label;
- one-line STAR behavior summary;
- HP bar.

## Deterministic evidence

`src/game/battle/P1V15AChecks.ts` verifies:
- six Beasts map to six unique Signature identities;
- each Signature communicates different 1★ / 2★ / 3★ behavior;
- 2★ / 3★ behavioral modifiers are wired;
- Iron Ram activates in deterministic combat;
- 3★ Swiftwing triggers Volley more often than 1★;
- Arcane Bloom produces multi-target consequence;
- identical V15A fixtures repeat deterministically.

CI:
- `npm run check` — PASS after V15A wiring.
- `npm run build` — PASS after V15A wiring.

## Readability / capture pass — 2026-10-07

Implemented after the first V15A behavior pass:

- Battle showcase labels now use **Beast name + STAR** rather than role-only labels.
- Player unit borders use each Beast's identity color instead of only shared role color.
- Guardian Brace / Ambush / Focus expose a temporary readiness ring when their state is visually relevant.
- Signature activation labels include the actual tier, e.g. `ARCANE BLOOM III`.
- 3★ Arcane Bloom adds a delayed **ECHO** punctuation in presentation.
- Battle Setup Signature copy was shortened to one-line card-safe taglines.
- Showcase Mode now also removes Battle Setup harness controls.
- Portfolio capture controls are wired:
  - `O` → toggle Showcase Mode;
  - `P` → pause / resume Battle while in Showcase Mode;
  - `C` → toggle Clean Frame (hide global top HUD while preserving Battle / Tactical Energy evidence).
  - `K` → from any phase, reset directly into the capture-only V15A Battle Setup roster:
  - `L` → reset the same fixture and immediately start the **V15A Hero Battle** for screenshot/video capture. Starcaller 3★, Ironclad 2★, Swiftwing 2★, Snowguard 1★ active; Windstrider 1★ and Shadowclaw 3★ in Reserve; Tactical Energy seeded for presentation.
    The capture fixture also uses a low-damage capture threat with clustered Frontliner/Diver targets plus a Ranged target, giving Arcane Bloom, Iron Ram, Twin Volley, BREAK and PIERCE readable windows without changing normal gameplay fixtures.
- Showcase pause now stops model ticking rather than changing UI state only.

This pass changes presentation/readability only; it does not add a seventh Beast, another skill system, mana, cooldown resources, or meta progression.

## Final combat presentation pass — 2026-10-07

Evidence from live capture confirmed:
- V15A capture fixture is active at **4 enemies / 1180 total HP**.
- `FOCUS SHOT I` is readable in a paused frame.
- `TWIN VOLLEY II` is readable with multi-target trails.
- `ARCANE BLOOM III` is triggering at runtime, but the first live capture showed its visual emphasis was weaker than Twin Volley.

Final Mage presentation changes:
- Starcaller receives a visible purple caster aura/core at Bloom activation.
- Arcane links connect the caster to affected targets.
- Target explosion discs are brighter, larger and remain readable longer.
- `ARCANE BLOOM III` banner holds longer than generic Signature labels.
- 3★ `ECHO` receives its own gold impact disc + label.

CI after the final Mage presentation pass: **PASS**.

**Freeze rule:** no more combat-presentation expansion after this pass unless the final live Arcane Bloom capture reveals a clear readability defect. The next production focus is authored unit/character art.

## Live QA gate

Do not call V15A portfolio-ready until a live 1280×720 Battle confirms:

1. **Starcaller reads as Mage without reading the role label.**
   - Bloom must visibly hit multiple enemies.
   - 3★ Echo must be visually distinguishable enough to explain in a showcase.

2. **Snowguard vs Ironclad read as different Tankers.**
   - Snowguard = protect.
   - Ironclad = disrupt.

3. **Windstrider vs Swiftwing read as different Rangers.**
   - Windstrider = charged precision.
   - Swiftwing = repeated multi-target cadence.

4. STAR progression is understandable from the Setup card and observable during Battle.

5. VFX do not obscure HP, target state or Tactical Energy controls.

## Adoption status

**Experimental / not automatically adopted.**

V15A can be:
- ADOPTED as the unit-identity baseline;
- simplified if cognitive load is too high;
- partially retained if only some Signature evolutions improve readability.

Implementation success is not adoption evidence.
