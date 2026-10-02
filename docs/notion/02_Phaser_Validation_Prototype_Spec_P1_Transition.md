---
mirror_type: notion_snapshot
notion_page_id: "3ec2674d-32c3-8155-a07e-c449ad9f9ea2"
notion_url: "https://app.notion.com/p/3ec2674d32c38155a07ec449ad9f9ea2?pvs=204"
notion_title: "02 — Phaser Validation Prototype Spec — P1 Transition"
notion_last_edited_at: "2026-10-01T09:51:13.715Z"
last_synced: "2026-10-02"
source_of_truth: "Notion"
---

> **Mirror notice:** Git snapshot of the Notion page above. Notion remains authoritative unless project policy changes. Notion-native tags are preserved for fidelity.

# 02 — Phaser Validation Prototype Spec — P1 Transition

> **Purpose:** lightweight web prototype for validating the current gameplay rules without turning Phaser into a second design source of truth.
**Design Source of Truth (nguồn sự thật thiết kế):** <mention-page url="https://app.notion.com/p/3ec2674d32c3812296a8de866c65c434"/>  
**Unity reference:** <mention-page url="https://app.notion.com/p/3ec2674d32c3811da2f7dc1c6528cb9b"/>
**Prototype type:** Phaser web validation prototype  
**P0 status:** completed and preserved as implementation history.  
**Current target:** synchronize Phaser to the adopted P1 loop: **Beast Rush → Energy Rush → Battle Setup / Beast Arrangement → Auto Battle + Timed Energy Cast → Result**.
## 1. Prototype Principle
Phaser is a **Validation Prototype (prototype kiểm chứng)**, not a replacement implementation.
**P1 transition rule:** the Current Gameplay Spec v2 is now authoritative. Existing P0 behavior remains valid implementation evidence, but any P0 behavior that conflicts with v2 must be marked **Needs Sync** until changed. See <mention-page url="https://app.notion.com/p/3ec2674d32c3817a908cfb59b0e6184f">02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle</mention-page> for the P1 technical plan.
It may simplify visuals, battle simulation, data structures, animation and meta systems. It must not silently redefine current gameplay rules.
If a Phaser experiment changes a rule temporarily, it must be labeled **Test Variant (biến thể thử nghiệm)** until that change is adopted in the Current Gameplay Spec.
## 2. P0 Historical In-Scope Mapping
> The table below is the original P0 planning snapshot. Use the Phaser Implementation Matrix for actual P0 implementation truth and the P1 Technical Scaffold for the current target.
<table fit-page-width="true" header-row="true">
<tr>
<td>Rule ID</td>
<td>Prototype Requirement</td>
<td>Phaser Status</td>
<td>Validation Purpose</td>
</tr>
<tr>
<td>FLOW-001</td>
<td>Preparation → Resolution → Auto Battle + Energy → Result / next cycle.</td>
<td>Planned</td>
<td>Can players understand the phase sequence?</td>
</tr>
<tr>
<td>PUZ-001</td>
<td>6×6 playable board.</td>
<td>Planned</td>
<td>Maintain the current prototype board baseline.</td>
</tr>
<tr>
<td>PUZ-002</td>
<td>Allow valid pathfinding through an outer logical border.</td>
<td>Planned</td>
<td>Preserve U-style path behavior.</td>
</tr>
<tr>
<td>PUZ-003</td>
<td>Generate board content in matching pairs.</td>
<td>Planned</td>
<td>Keep board generation compatible with Onet rules.</td>
</tr>
<tr>
<td>MATCH-001</td>
<td>Same-content pair + valid path with maximum 2 turns.</td>
<td>Planned</td>
<td>Core puzzle interaction.</td>
</tr>
<tr>
<td>PHASE-001</td>
<td>Preparation board uses Beast-only content.</td>
<td>Planned</td>
<td>Test readability of the preparation purpose.</td>
</tr>
<tr>
<td>COMBO-001</td>
<td>First valid match activates Combo.</td>
<td>Planned</td>
<td>Validate pacing pressure.</td>
</tr>
<tr>
<td>COMBO-002</td>
<td>Initial Combo = 5.0s.</td>
<td>Planned</td>
<td>Baseline timing test.</td>
</tr>
<tr>
<td>COMBO-003</td>
<td>Successful match adds +0.3s.</td>
<td>Planned</td>
<td>Baseline timing test.</td>
</tr>
<tr>
<td>COMBO-004</td>
<td>Combo cap = 5.0s.</td>
<td>Planned</td>
<td>Baseline timing test.</td>
</tr>
<tr>
<td>QUEUE-001</td>
<td>Valid Beast match → +1 count for that Beast.</td>
<td>Planned</td>
<td>Test Match → Consequence readability.</td>
</tr>
<tr>
<td>RES-001</td>
<td>Combo end → Resolution.</td>
<td>Planned</td>
<td>Test phase transition clarity.</td>
</tr>
<tr>
<td>RES-002</td>
<td>Support individual deploy and Start Battle.</td>
<td>Planned</td>
<td>Test Player Agency (quyền chủ động của người chơi).</td>
</tr>
<tr>
<td>STAR-001</td>
<td>Use 1 / 3 / 9 Queue → Star conversion.</td>
<td>Planned</td>
<td>Validate army growth and deploy-vs-save behavior.</td>
</tr>
<tr>
<td>PHASE-002</td>
<td>Auto Battle uses Energy-only puzzle content.</td>
<td>Planned</td>
<td>Test readability of the battle-support phase.</td>
</tr>
<tr>
<td>ENERGY-001</td>
<td>Valid Energy match → +10 Energy.</td>
<td>Planned</td>
<td>Validate skill charge frequency.</td>
</tr>
<tr>
<td>ENERGY-002</td>
<td>Energy max = 20.</td>
<td>Planned</td>
<td>Two same-Energy matches reach ready state.</td>
</tr>
<tr>
<td>ENERGY-003</td>
<td>Full gauge → Skill Ready → consume → reset to 0.</td>
<td>Planned</td>
<td>Test Match → Gauge → Skill comprehension.</td>
</tr>
<tr>
<td>DEADLOCK-001</td>
<td>If no valid pair exists, reshuffle automatically.</td>
<td>Planned</td>
<td>Prevent test sessions from being blocked by board state.</td>
</tr>
</table>
## 3. Out of Scope
The first Phaser prototype intentionally does **not** reproduce the full Unity project.
- Full Deck / Inventory / Shop flow.
- Real-time role-aware combat AI.
- Full enemy targeting / movement behaviors.
- Projectile, splash, Burn, Stun systems.
- Full Leader Pet implementation.
- Meta progression.
- Production art.
- Final VFX / animation.
- Final audio.
- Save system.
- Monetization.
- Full WaveData authoring.
- Exact Unity class architecture.
- Production networking / backend analytics.
These systems may be represented with simplified placeholders only when needed to make the validation flow understandable.
## 4. Simplified Battle Model
The battle layer should remain deliberately reduced, but P1 requires **autonomous combat consequence**.
**Player Army:** derived from converted Beast units, their role, star tier and battlefield position.  
**Enemy:** must deal damage / pressure over time without waiting for player puzzle input.  
**Energy Skills:** finite charges collected before Battle and consumed at a chosen moment during combat.
The first P1 build does not need Unity combat parity. It only needs enough role/position difference to test arrangement and enough autonomous combat to make Energy timing meaningful.
## 5. Prototype State Flow
**P1 target:**
Beast Rush — Beast-only Onet collection  
→ Energy Rush — Energy-only Onet collection  
→ Battle Setup — STAR conversion + Beast arrangement + stored Energy preview  
→ Auto Battle — no puzzle board; combat progresses autonomously  
→ Timed Energy Cast — consume pre-collected charges during Battle  
→ Result / Next Cycle  
→ Beast Rush
**P0 historical flow:** Preparation → Resolution → Battle + Energy puzzle → Result. This remains verified history, not the current design target.
## 6. P0 Historical System Structure
- GameState: Preparation / Resolution / Battle / Result
- PuzzleBoard
- OnetMatcher
- ComboSystem
- BattleQueue
- StarConverter
- EnergySystem
- SimpleBattleModel
- SessionMetrics
- RuleConfig
**RuleConfig** should contain values copied from the Current Gameplay Spec, not invented independently inside scene code.
Current baseline mapping:
- boardSize = 6
- maxPathTurns = 2
- comboInitial = 5.0
- comboBonus = 0.3
- comboCap = 5.0
- queuePerBeastMatch = 1
- star1Cost = 1
- star2Cost = 3
- star3Cost = 9
- energyPerMatch = 10
- energyMax = 20
## 7. Source-of-Truth Rule
Recommended mapping:
- PUZ-001 → boardSize
- MATCH-001 → maxPathTurns
- COMBO-002 → comboInitial
- COMBO-003 → comboBonus
- COMBO-004 → comboCap
- QUEUE-001 → queuePerMatch
- STAR-001 → starCosts
- ENERGY-001 → energyPerMatch
- ENERGY-002 → energyMax
When an adopted design rule changes:
1. Update **Current Gameplay Spec** first.
2. Mark Phaser mapping **Needs Sync (cần đồng bộ)**.
3. Update Phaser config.
4. Record the change in the Validation Log.
When testing an unadopted variant, label it explicitly, for example:
**COMBO-003-VARIANT-A** — +0.5s per successful match — **Experimental (thử nghiệm)**.
The Current Gameplay Spec remains unchanged until the variant is adopted.
## 8. P0 Historical Session Metrics (dữ liệu phiên chơi)
<table fit-page-width="true" header-row="true">
<tr>
<td>Metric</td>
<td>Meaning</td>
<td>Related Question</td>
</tr>
<tr>
<td>timeToFirstMatch</td>
<td>Seconds before first valid pair.</td>
<td>Initial puzzle readability.</td>
</tr>
<tr>
<td>validMatches</td>
<td>Total successful matches.</td>
<td>General puzzle throughput.</td>
</tr>
<tr>
<td>invalidAttempts</td>
<td>Invalid pair selections.</td>
<td>Rule/path comprehension.</td>
</tr>
<tr>
<td>maxCombo</td>
<td>Highest matches within one Combo window.</td>
<td>Combo pacing.</td>
</tr>
<tr>
<td>queueAtResolution</td>
<td>Queue size when preparation ends.</td>
<td>Army generation rate.</td>
</tr>
<tr>
<td>individualDeployCount</td>
<td>Manual deploy actions before Start Battle.</td>
<td>Resolution agency.</td>
</tr>
<tr>
<td>star1 / star2 / star3Created</td>
<td>Units generated by tier.</td>
<td>STAR-001 economy.</td>
</tr>
<tr>
<td>timeToStartBattle</td>
<td>Time spent in Resolution.</td>
<td>Resolution clarity / hesitation.</td>
</tr>
<tr>
<td>energyMatches</td>
<td>Successful Energy matches.</td>
<td>Battle-support engagement.</td>
</tr>
<tr>
<td>timeToFirstSkillReady</td>
<td>Seconds until first full Energy gauge.</td>
<td>Energy pacing.</td>
</tr>
<tr>
<td>skillCasts</td>
<td>Total Energy skill activations.</td>
<td>Skill frequency.</td>
</tr>
</table>
No metric should be presented as player evidence until an actual playtest session exists.
## 9. P1 Validation Questions
1. Can fast/lucky Beast matching still produce an army the player can understand and arrange meaningfully?
2. Are Tanker / Assassin / Ranger / Mage roles readable enough to influence placement?
3. Does Energy Rush clearly communicate that Energy is being stored for later Battle use?
4. Does Battle progress and create visible danger with **zero player input**?
5. Does the player understand that Energy is finite and pre-collected rather than generated during Battle?
6. Is there a meaningful reason to cast now versus save a charge for later?
7. Does STAR-001 interact with formation/role choice in a way the player can understand?
Avoid testing visual polish, retention, monetization, long-term progression or final production combat balance in this prototype.
## 10. Playable Milestones
**Milestone P0 — Rule Sandbox: Complete / Historical Baseline**
Required:
- 6×6 Beast board.
- valid Onet matching up to 2 turns.
- automatic deadlock recovery.
- Combo timer.
- Beast Queue.
- Resolution screen.
- 1 / 3 / 9 conversion.
- simplified battle screen.
- Energy-only board.
- Energy gauge + one simple skill.
- Session Summary screen.
Not required:
- final visuals,
- multiple waves,
- meta,
- polished combat,
- account/backend systems.
## 11. Session Summary
At the end of a test session, show a small summary containing:
- Valid Matches
- Invalid Attempts
- Max Combo
- Queue at Resolution
- Manual Deploys
- 1★ / 2★ / 3★ Created
- Energy Matches
- First Skill Ready
- Skill Casts
This is a **Test Instrument (công cụ đo kiểm thử)**, not a player-facing final UI.
## 12. Implementation Status Vocabulary
- **Planned** — not built yet.
- **Implemented** — exists and works in the Phaser validation flow.
- **Partially Integrated** — code exists but the validation flow is incomplete.
- **Experimental** — temporary Test Variant.
- **Needs Sync** — Phaser no longer matches the Current Gameplay Spec.
- **Needs Validation** — implementation exists, but no playtest evidence supports a design conclusion yet.
## 13. Exit Criteria for P0
- [x] The full Preparation → Resolution → Battle/Energy flow can be completed in-browser.
- [x] All in-scope P0 baseline Rule IDs are mapped to Phaser config or logic.
- [x] STAR-001 uses 1 / 3 / 9.
- [x] Deadlock / board exhaustion cannot permanently block a test session.
- [x] Session Metrics are captured locally.
- [x] Session Summary is visible after the run.
- [x] No Unity production-only subsystem is required to run the validation prototype.
- [x] The prototype clearly identifies itself as a **Gameplay Validation Prototype (prototype kiểm chứng gameplay)**.
**Next implementation gate:** <mention-page url="https://app.notion.com/p/3ec2674d32c3817a908cfb59b0e6184f">02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle</mention-page>.
## 14. Next Artifact
After P0 scope is accepted, create a **Phaser Implementation Matrix (ma trận triển khai Phaser)** with:
**Rule ID → Phaser File/System → Status → Test Variant → Notes**
That matrix becomes the source of truth for what the web prototype actually implements.
<page url="https://app.notion.com/p/3ec2674d32c381919709d2b17efb3f57">02.1 — Phaser Implementation Matrix</page>
<page url="https://app.notion.com/p/3ec2674d32c3816abfafd06eb023e38f">02.2 — P0 Technical Scaffold</page>
<page url="https://app.notion.com/p/3ec2674d32c3814ab38ac952829289fa">02.3 — P0 Audit — Phaser Rule Sandbox</page>
<page url="https://app.notion.com/p/3ec2674d32c3817a908cfb59b0e6184f">02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle</page>
<page url="https://app.notion.com/p/3ec2674d32c381d3927dd0b568c16648">02.5 — P1-S0 Implementation Task — State Migration</page>
<page url="https://app.notion.com/p/3ec2674d32c381e39f99d71e6b36aa9a">02.5 — P1-S0 Implementation Task — State Migration</page>
<page url="https://app.notion.com/p/3ec2674d32c3819bac5cc00c9bc64825">02.6 — P1-S1 Implementation Task — Energy Pre-Collection</page>
<page url="https://app.notion.com/p/3ec2674d32c3814495fcf3f9c76f8473">02.7 — P1-S2 Implementation Task — Beast Role + Arrangement</page>
<page url="https://app.notion.com/p/3ec2674d32c381bbbf45fbcc6f86355a">02.8 — P1-S3 Implementation Task — Autonomous Battle</page>
<page url="https://app.notion.com/p/3ec2674d32c381d98988c4069f1521dc">02.9 — P1-S4 Implementation Task — Timed Energy Cast</page>
<page url="https://app.notion.com/p/3ec2674d32c381afb693eece8472f94a">02.10 — P1-S5 Implementation Task — Validation Instrumentation</page>
<page url="https://app.notion.com/p/3ec2674d32c3810daf83fb66890a64ea">02.11 — P1 Exit Audit — Structural Prototype</page>
