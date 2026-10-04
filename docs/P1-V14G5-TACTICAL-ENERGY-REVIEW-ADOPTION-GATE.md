# P1-V14G.5 — Tactical Energy Review / Adoption Gate

Status: **ACTIVE REVIEW SPEC / OWNER DECISION REQUIRED / NO NEW GAMEPLAY IMPLEMENTATION AUTHORIZED / EXPERIMENTAL / NOT ADOPTED**.

## 1. Purpose

P1-V14G.5 is the decision gate for the full Tactical Energy experiment.

It does not add a new Energy mechanic.

It reviews whether the implemented V14G loop is clear, tactically meaningful, and stable enough to become part of the gameplay baseline.

Decision target:

```text
Energy Rush
→ collect MEND / RESCUE / BREAK / PIERCE
→ Battle Setup previews stored tactical Energy
→ Battle evaluates DISABLED / READY / SUGGESTED
→ player manually decides whether to cast
→ unused Energy persists across Waves
```

## 2. Current Evidence Entering This Gate

### V14G.1 — Tactical Energy Core
Status: **IMPLEMENTED / DETERMINISTIC PASS**.

Implemented:
- MEND;
- RESCUE;
- BREAK;
- PIERCE;
- deterministic target rules;
- effect-first charge consumption;
- no auto-cast.

### V14G.2 — Tactical Energy Player Surface
Status: **IMPLEMENTED / DETERMINISTIC PASS**.

Implemented:
- tactical Energy names;
- effect descriptions;
- DISABLED / READY / SUGGESTED;
- compact reason labels;
- actual-target cast feedback.

### V14G.3 — Battle Live Validation
Status: **OWNER-LIVE PASS**.

Accepted live Battle communication:
- tactical identity;
- tactical effect;
- activation state distinction;
- suggestion reason;
- actual-target feedback;
- SUGGESTED remains guidance rather than forced action.

### V14G.4A — Energy Rush Core Identity Surface
Status: **IMPLEMENTED / DETERMINISTIC PASS / LIVE PASS**.

Accepted live Energy Rush communication:
- board tiles use MEND / RESCUE / BREAK / PIERCE directly;
- normal Energy Rush no longer requires A/B/C/D memorization;
- tactical inventory shows all four types including zero counts;
- compact catalog effect hints are readable;
- carry-in counts remain visible.

### V14D / V14E Supporting Evidence
Existing implementation already provides:
- Run-scoped persistent Energy;
- unused charges persist across Waves;
- successful cast consumes exactly one selected charge;
- deterministic SAVE vs SPEND evidence exists;
- no cap / decay / passive refill baseline.

Cross-Wave save-vs-spend has deterministic evidence, while full real-player strategic evidence remains limited.

## 3. Adoption Question

The owner must decide whether this statement is now true:

> Tactical Energy adds understandable, useful player decisions without creating more complexity than value.

Adoption is not a reward for implementation completion.

A system can be implemented correctly and still remain Experimental.

## 4. What “ADOPT” Means

If V14G is adopted:

- MEND / RESCUE / BREAK / PIERCE become the canonical Tactical Energy baseline;
- A/B/C/D remain internal implementation IDs only;
- Energy Rush tactical identity presentation becomes baseline behavior;
- Setup preview and Battle activation grammar become baseline behavior;
- manual cast remains baseline;
- current persistent Energy relationship remains baseline;
- future systems must preserve these semantics unless explicitly changed by a later spec.

Adoption does NOT mean:
- final balance is locked forever;
- final art is complete;
- no future Energy type can ever be added;
- all V14 systems are automatically adopted.

## 5. Review Dimension A — Identity Clarity

PASS when a player can identify the four Energy types without internal IDs:

```text
MEND
RESCUE
BREAK
PIERCE
```

Evidence entering gate:
- Energy Rush live screenshot PASS;
- Setup tactical inventory readable;
- Battle tactical cards readable.

Current gate assessment: **PASS CANDIDATE**.

## 6. Review Dimension B — Effect Clarity

PASS when the player understands the broad purpose of each type:

```text
MEND   → heal frontline
RESCUE → heal backline
BREAK  → damage Frontliner
PIERCE → damage Ranged
```

The player does not need to memorize exact target tie-break rules during normal play.

Current gate assessment: **PASS CANDIDATE**.

## 7. Review Dimension C — Activation Grammar

PASS when the player can distinguish:

```text
DISABLED
READY
SUGGESTED
```

and understands:

```text
READY
= legal now

SUGGESTED
= legal + current battle state matches intended use

DISABLED
= no effective legal cast now
```

Current Battle live evidence: **OWNER-LIVE PASS**.

## 8. Review Dimension D — Player Agency

PASS when:
- Energy does not auto-cast;
- SUGGESTED does not force action;
- another READY Energy remains usable;
- no “BEST” ranking dictates play;
- target selection may be deterministic without removing the spend/save decision.

Current gate assessment: **PASS CANDIDATE**.

## 9. Review Dimension E — Tactical Differentiation

PASS when the four types answer meaningfully different tactical problems.

Required distinction:

```text
MEND
protect current frontline

RESCUE
stabilize damaged Mid / Back

BREAK
accelerate removal of frontline pressure

PIERCE
reach protected Ranged threats
```

Fail if the four types feel like cosmetic names for the same action.

Current code and Battle live evidence support differentiation.

Current gate assessment: **PASS CANDIDATE**.

## 10. Review Dimension F — Save Now vs Save Later

PASS when persistent finite charges create an understandable opportunity cost:

```text
cast now
vs
keep charge for a later Wave
```

Evidence available:
- V14D persistence implementation;
- V14E deterministic SAVE vs SPEND validation;
- live carry-in presentation;
- Battle manual casting.

Important:
real-player strategic depth is not fully proven by deterministic checks alone.

For adoption, owner may choose either:
1. accept current evidence as sufficient for baseline adoption; or
2. keep V14G Experimental until one short multi-Wave live run confirms this decision feels meaningful.

## 11. Review Dimension G — Cognitive Load

PASS when Tactical Energy is easier to understand than the value it adds.

Desired player mental model:

```text
collect a named tool
→ see when it can work
→ decide whether to spend it
```

Undesired model:

```text
memorize IDs
→ memorize hidden targeting rules
→ decode many statuses
→ obey recommendations
```

G.4A specifically closed the largest identity-load issue.

Current gate assessment: **PASS CANDIDATE**.

## 12. Review Dimension H — UI Continuity

PASS when the same vocabulary survives the full flow:

```text
Energy Rush
MEND / RESCUE / BREAK / PIERCE

Setup
MEND / RESCUE / BREAK / PIERCE

Battle
MEND / RESCUE / BREAK / PIERCE
```

There must be no player-facing translation back to A/B/C/D.

Current live evidence: **PASS CANDIDATE**.

## 13. Review Dimension I — Regression Safety

Adoption requires preserving:

- 6×6 Onet Energy Rush;
- first-valid-match 12s timing;
- one valid pair = +1 matching Energy;
- Run-scoped persistence;
- exact-one-charge successful consumption;
- failed/ineffective cast consumes 0;
- manual Battle casting;
- no cap / decay / passive refill baseline;
- owner-passed Battle behavior.

Existing check/build evidence supports this dimension.

## 14. G.4B NEXT THREAT Decision

G.4B NEXT THREAT is **not required for adoption by default**.

Do not add it merely because it was once proposed.

Only implement NEXT THREAT if the adoption review identifies a real live problem:

> Players understand each Energy, but cannot connect collection choices to the upcoming Battle context.

If that problem is not observed, leave G.4B unimplemented.

This keeps Energy Rush focused and avoids unnecessary UI noise.

## 15. Adoption Outcomes

The gate has exactly three legitimate outcomes.

### OUTCOME A — ADOPT

Use when:
- identity is clear;
- effects are differentiated;
- Battle activation grammar is understandable;
- manual agency is preserved;
- persistence creates enough value;
- complexity is acceptable;
- no blocker remains.

Result:

```text
P1-V14G
= ADOPTED BASELINE
```

### OUTCOME B — CONDITIONAL HOLD

Use when the system is promising and technically sound, but one specific live question remains unresolved.

Example:

```text
Need one multi-Wave run to confirm save-now-vs-later feels meaningful.
```

Result:

```text
P1-V14G
= EXPERIMENTAL
= ADOPTION HOLD
```

Only the named unresolved question may drive follow-up work.

### OUTCOME C — DO NOT ADOPT

Use when the system adds excessive complexity, weak differentiation, or poor player decisions despite working correctly.

Result:

```text
P1-V14G
= EXPERIMENTAL
= NOT ADOPTED
```

Do not automatically delete working code. A later cleanup/revert spec would be separate.

## 16. No Automatic Adoption

The following are NOT enough by themselves:

- code exists;
- deterministic checks pass;
- npm check passes;
- npm build passes;
- G.3 Battle live PASS;
- G.4A Energy Rush live PASS.

Adoption requires an explicit owner decision.

## 17. Recommended Decision Checklist

Before owner decision, review these seven statements:

1. I can identify all four Energy types immediately.
2. I understand what each broadly affects.
3. READY / SUGGESTED / DISABLED make sense during Battle.
4. SUGGESTED helps without controlling me.
5. Cast feedback makes the consequence obvious.
6. Carrying Energy across Waves is understandable.
7. The system adds more tactical value than cognitive load.

If 1–5 and 7 are clearly yes, but 6 is uncertain, use CONDITIONAL HOLD rather than adding new mechanics.

## 18. Current Evidence Summary

At entry to G.5:

```text
Identity clarity
→ strong evidence / live PASS

Effect clarity
→ strong evidence

Battle activation grammar
→ owner-live PASS

Actual-target cast feedback
→ live PASS evidence

Manual agency
→ implemented + live direction PASS

Energy Rush tactical identity
→ live PASS

Cross-Wave persistence
→ implemented + deterministic evidence + carry-in UI evidence

Real-player save-vs-later strategic value
→ not fully proven
```

Therefore the current evidence supports an adoption review now, but does not pre-decide the result.

## 19. No New Gameplay Implementation in G.5

During this gate do NOT add:

- new Energy types;
- Energy rarity;
- Energy upgrade;
- Energy cap;
- decay;
- cooldown;
- manual target selection;
- auto-cast;
- threat-based spawn weighting;
- G.4B NEXT THREAT unless a demonstrated live problem requires it;
- Squad Capacity changes.

This is a review/decision gate.

## 20. Exit Gate

P1-V14G.5 closes only when the owner explicitly selects one:

```text
ADOPT
CONDITIONAL HOLD
DO NOT ADOPT
```

After that decision:
- update repo-local status docs;
- do not update Notion unless explicitly requested;
- if ADOPT, record exactly which V14G semantics become baseline;
- if HOLD, record exactly one unresolved adoption question;
- if DO NOT ADOPT, preserve code until a separate cleanup decision.

## 21. Next Phase After ADOPT

If V14G is adopted, do not automatically open another Energy mechanic.

First choose the next gameplay problem from the broader project roadmap.

Likely candidates must be reviewed separately, including:
- unresolved Formation / movement depth;
- earlier live gates still open;
- Squad Capacity only if slot pressure evidence justifies it.

Do not infer the next mechanic from V14G adoption alone.
