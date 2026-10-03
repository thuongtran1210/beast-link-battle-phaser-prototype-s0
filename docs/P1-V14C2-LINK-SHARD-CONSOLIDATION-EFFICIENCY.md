# P1-V14C.2 — Combo Quality → Consolidation Efficiency (Link Shard Experiment)

Status: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL (NOT ADOPTED)**

## 1. Context & Purpose

In **P1-V14C.1**, Combo was decoupled from phase time and Beast quantity:
- Fixed 12.0s Beast Rush phase duration.
- Independent 1.5s Combo window.
- MATCH COUNT strictly equals Beast quantity (1 match = 1 recruited Beast).
- COMBO QUALITY (`bestStreak`) acts as an independent skill signal.

In **P1-V14C.2**, we test the hypothesis:
> Does better Combo quality create better STAR consolidation efficiency, without extending phase time, inflating Beast quantity, or increasing Squad Capacity?

To test this, we introduce a single Run-owned resource: **Link Shard**.

## 2. Experimental Resource — Link Shard

- **Purpose**: Substitutes for **ONE** missing same-STAR Beast copy during manual Reserve consolidation.
- **Ownership**: Run-scoped via `RunLinkShardPool`. Not stored in UI, BattleQueue, or ComboQualityTracker.
- **Wave Persistence**: Persists across Waves in the same Run. Resets only on Restart / new Run.
- **Hard Resource Cap**: `LINK_SHARD_MAX = 3`. Overflow awards are strictly clamped at 3.
- **Restrictions**: Link Shards do NOT deploy, fight, heal, add BeastQueue count, add Rush duration, increase Squad Capacity, or enlarge the Formation Grid.

## 3. Combo Quality Reward Thresholds

Link Shards are earned from **best streak** during Beast Rush (evaluated once at phase end):

| Best Streak | Link Shards Awarded |
|---|---|
| 0 – 3 | 0 |
| 4 – 6 | +1 |
| 7+ | +2 (max per Beast Rush) |

- Awarded exactly once when Beast Rush ends from `ComboQualityTracker.bestStreak`.
- Not awarded per streak, and not directly determined by total match count.
- **Quantity Invariant**: Two players with 6 matches both recruit 6 Beasts; only the player with higher streak earns shard efficiency.

## 4. Consolidation Rules

### 4.1 Normal Consolidation (B.3 Preserved)
- 3 ready Reserve copies of same `beastId` and `star` → 1 copy of next STAR.
- Costs **0 Link Shards**.
- **Strict Priority**: If 3 eligible copies exist, normal consolidation is automatically used (0 shards consumed). Shard-assisted consolidation cannot be chosen when 3 copies are ready.

### 4.2 Shard-Assisted Consolidation (C.2 Optional Path)
- 2 ready Reserve copies of same `beastId` and `star` + **1 Link Shard** → 1 copy of next STAR.
- Costs **1 Link Shard**.
- Consumes the 1 Link Shard and 1 secondary real copy, keeping the deterministic primary instance ID (lowest run serial).

### 4.3 Hard Constraints
- **One Shard Max**: Minimum 2 real Beast bodies required. Never allows 1 copy + 2 shards.
- **KO & Deployed Excluded**: KO units and deployed/active units cannot be ingredients.
- **Max STAR**: 3★ units cannot be consolidated further, even with shards.

### 4.4 Attrition & Zero-Phantom-HP Math
- The Link Shard contributes **0 current HP and 0 max HP** (never acts as a virtual full-health unit).
- Health ratio is computed strictly from the 2 real ingredient bodies:
  $$\text{healthRatio} = \frac{\text{hp}_A + \text{hp}_B}{\text{max}_A + \text{max}_B}$$
  $$\text{targetCurrentHp} = \text{round}(\text{targetMaxHp} \times \text{healthRatio})$$
- Example: 80/80 and 40/80 with 1 shard → $(80 + 40) / 160 = 75\%$. Target 2★ max HP 144 $\times 0.75 = 108/144$. No phantom HP or free heal.

## 5. UI Integration

- **Battle Setup Global Badge**: Displays `◆ LINK ×{count}` compactly in the top-right of the Setup panel.
- **Reserve Inspector**:
  - When 2 copies + 1 shard: shows `SAME COPY 2 / 3  ·  ◆ LINK ×1`, button `[CONSOLIDATE → ★★]` with subtext `2 COPIES + ◆1`.
  - When 3 copies: shows `SAME COPY 3 / 3`, button `[CONSOLIDATE → ★★]` with subtext `3 COPIES` (no shard cost shown).
  - When 1 copy + shards: button disabled `NEED 2 MORE ★`, subtext `Minimum 2 copies required`.
- **Beast Rush End Feedback**: Compact floating toast `BEST ×{streak}  ·  +{n} LINK SHARD(S)` if earned; no negative prose if 0.

## 6. Deterministic Validation (38 Checks)

All 38 checks in `src/game/run/P1V14C2Checks.ts` pass:
- **Reward (1–11)**: Streaks 0, 3, 4, 6, 7, 20; single evaluation; total match count decoupling; cap at 3; overflow clamp.
- **Normal Consolidation (12–15)**: 3 copies + 0 shard succeeds; 3 copies + shards consumes 0 shards; B.3 HP behavior preserved; primary ID preserved.
- **Shard Assist (16–27)**: 2 copies + 0 shard fails; 2 copies + 1 shard succeeds; 1 shard consumed; 1 secondary consumed; primary retained; 1 copy + 2 shards fails; mixed beastId fails; mixed STAR fails; KO fails; deployed fails; 2×2★ + shard → 3★ succeeds; 3★ cannot upgrade.
- **HP Attrition (28–33)**: Full-health input produces full-health target; injured two-body ratio (75% -> 108/144); 0 phantom HP; no free heal; clamping; persistence across Waves.
- **Run Resource (34–38)**: Wave 1 → Wave 2 persistence; single-decrement spend; earn after spend; Restart clears pool; no leakage between Runs.

## 7. Status & Boundaries

- `MATCH COUNT STILL CONTROLS BEAST QUANTITY.`
- `COMBO QUALITY NOW CONTROLS CONSOLIDATION EFFICIENCY.`
- `LINK SHARD DOES NOT INCREASE SQUAD CAPACITY.`
- `P1-V14D ENERGY PERSISTENCE NOT STARTED.`
- C.1 and B.3 owner-live gates remain OPEN.
- Experimental / not adopted.
