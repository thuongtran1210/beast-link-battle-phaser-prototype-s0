---
mirror_type: notion_snapshot
notion_page_id: "3ec2674d-32c3-81da-8c14-df447e09cb92"
notion_url: "https://app.notion.com/p/3ec2674d32c381da8c14df447e09cb92?pvs=204"
notion_title: "03 — Validation Log — Beast Link Battle"
notion_last_edited_at: "2026-10-01T11:55:55.681Z"
last_synced: "2026-10-02"
source_of_truth: "Notion"
---

> **Mirror notice:** Git snapshot of the Notion page above. Notion remains authoritative unless project policy changes. Notion-native tags are preserved for fidelity.

# 03 — Validation Log — Beast Link Battle

> **Validation Source of Truth (nguồn sự thật kiểm chứng).** Record real playtest evidence, findings, proposals, variants and decisions here. This page does not redefine the Current Gameplay Spec until a change is explicitly adopted.
**Design Source:** <mention-page url="https://app.notion.com/p/3ec2674d32c3812296a8de866c65c434"/>
**P0 Audit:** <mention-page url="https://app.notion.com/p/3ec2674d32c3814ab38ac952829289fa"/>
**Phaser Prototype:** <mention-page url="https://app.notion.com/p/3ec2674d32c38155a07ec449ad9f9ea2"/>
## Evidence Rules
- Do not convert one player's reaction into a design conclusion.
- Separate **Observed Behavior**, **Player Statement**, **Metric**, and **Designer Interpretation**.
- Metrics from the prototype are evidence only when attached to a real tester session.
- A repeated issue becomes a **Validation Finding** only after the supporting sessions are referenced.
- A finding does not change the gameplay spec automatically.
- Design change flow remains:
	**Validation Finding → Design Proposal → Test Variant → Decision → Adopt / Reject**.
- If Adopted, update the Current Gameplay Spec first, then mark affected implementations **Needs Sync** until corrected.
## Active Validation Questions
<table fit-page-width="true" header-row="true">
<tr>
<td>ID</td>
<td>Question</td>
<td>Related Rules</td>
<td>Status</td>
</tr>
<tr>
<td>VQ-01</td>
<td>Can fast/lucky Beast Rush output still produce an army the player can understand and arrange meaningfully?</td>
<td>PHASE-001, QUEUE-001, ROLE-001, BATTLE-002</td>
<td>Open · P1</td>
</tr>
<tr>
<td>VQ-02</td>
<td>Are Beast roles readable enough in Battle Setup to influence placement rather than feeling like interchangeable units?</td>
<td>ROLE-001, BATTLE-002</td>
<td>Open · P1</td>
</tr>
<tr>
<td>VQ-03</td>
<td>Does Energy Rush clearly communicate that Energy is being stored for later Battle use?</td>
<td>PHASE-002, ENERGY-001, ENERGY-002</td>
<td>Open · P1</td>
</tr>
<tr>
<td>VQ-04</td>
<td>Does autonomous Battle create a clear consequence when the player gives no input?</td>
<td>BATTLE-001, FAIL-001</td>
<td>Open · P1</td>
</tr>
<tr>
<td>VQ-05</td>
<td>Does finite pre-collected Energy create a meaningful cast-now vs save-for-later timing decision?</td>
<td>ENERGY-001/002/003, BATTLE-001</td>
<td>Open · P1</td>
</tr>
<tr>
<td>VQ-06</td>
<td>Does STAR 1 / 3 / 9 interact with role/formation choice in a way the player can understand?</td>
<td>STAR-001, ROLE-001, RES-002, BATTLE-002</td>
<td>Open · P1</td>
</tr>
</table>
## Session Register
Create one session record per real tester.
<table fit-page-width="true" header-row="true">
<tr>
<td>Session</td>
<td>Date</td>
<td>Tester</td>
<td>Build</td>
<td>Completed?</td>
<td>Moderator Help?</td>
<td>Key Evidence</td>
</tr>
<tr>
<td><mention-page url="https://app.notion.com/p/3ec2674d32c381048288f33c8c133cd8">03.2 — Playtest Session P01 — P1 Baseline</mention-page></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>Pilot complete — pre-Battle pacing / signaling issues</td>
</tr>
<tr>
<td><mention-page url="https://app.notion.com/p/3ec2674d32c381899d10efdc4ffaf214">03.4 — Playtest Session P02 — P1-V1 Phase Clarity</mention-page></td>
<td></td>
<td></td>
<td>P1-V1 Experimental</td>
<td></td>
<td></td>
<td>P02 qualitative complete — Beast + Energy countdowns felt too short</td>
</tr>
<tr>
<td>P03</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>P04</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>P05</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
</table>
## Session Evidence Template
For each P1 session record:
### Setup
- Tester ID:
- Date:
- Build / commit:
- Device / browser:
- Puzzle experience: None / Low / Medium / High
- Played Onet before: Yes / No
- Auto-battler / formation-game experience: Yes / No
- Moderator intervention: None / Minimal / Required
### P1 Prototype Metrics
- Beast Matches:
- Beast Queue at Setup — Total / Per ID:
- Energy Matches:
- Energy Charges at Battle Start — Total / Per ID:
- Role Counts:
- Star Tier Counts:
- Formation Repositions:
- Time in Battle Setup:
- Battle Outcome:
- Battle Duration:
- First Cast Time:
- Casts Used:
- Army HP at First Cast:
- Enemy HP at First Cast:
- Unused Energy at Result — Total / Per ID:
### Observed Behavior
Record concrete actions only.
### Player Statements
Record short verbatim or close paraphrases and clearly label them as player statements.
### Moderator Notes
Record interventions and context that could affect interpretation.
### Session-level Interpretation
Do not generalize beyond this tester.
## Finding Register
Do not create a finding until evidence is linked to one or more sessions.
<table fit-page-width="true" header-row="true">
<tr>
<td>Finding ID</td>
<td>Validation Question</td>
<td>Evidence</td>
<td>Frequency</td>
<td>Severity</td>
<td>Impact on Core Loop</td>
<td>Status</td>
</tr>
<tr>
<td><mention-page url="https://app.notion.com/p/3ec2674d32c3816c9958d5e133f90645">03.5 — Finding F-001 — Beast Rush Window Too Short</mention-page></td>
<td>VQ-01</td>
<td>P01 + P02</td>
<td>2 / 2 relevant sessions</td>
<td>Medium</td>
<td>High</td>
<td>Confirmed · Variant P1-V2 proposed</td>
</tr>
</table>
## Decision Pipeline
For each confirmed finding:
1. **Finding** — what repeated evidence shows.
2. **Design Proposal** — smallest change that addresses it.
3. **Test Variant** — implementation used to test the proposal; status = Experimental.
4. **Retest Evidence** — compare against baseline.
5. **Decision** — Adopt / Reject / More Evidence Needed.
6. **Sync** — if Adopted, update Current Gameplay Spec, then Unity / Phaser status.
## Current Evidence State
**P01 pilot / diagnostic session is complete.** It produced qualitative evidence about pre-Battle pacing and phase communication, but no Session Summary metric values were supplied. Do not treat P01 alone as a cross-player Validation Finding.
Automated checks and developer browser verification remain implementation evidence, not player validation.
The P1 structural change is an adopted designer decision, not a validation finding. P01 is now the first active P1 baseline session.
## Next Action
Implement/test <mention-page url="https://app.notion.com/p/3ec2674d32c3816e9a9df8905a0bb94b"/>: Beast Rush 8.0s initial / +0.3s / 8.0s cap while keeping the P1-V1 Energy cue and 8.0s EnergyRush unchanged. Use P03 to isolate Beast timing. If EnergyRush 8.0s is again too short in P03, create a separate repeated-evidence Energy timing finding.
<page url="https://app.notion.com/p/3ec2674d32c38161a1f5f997d8e64f27">03.1 — Playtest Protocol v2 — P1 Structural Loop</page>
<page url="https://app.notion.com/p/3ec2674d32c381048288f33c8c133cd8">03.2 — Playtest Session P01 — P1 Baseline</page>
<page url="https://app.notion.com/p/3ec2674d32c381689176c36e6b830f1e">03.0 — Designer Pre-Playtest Risk Review</page>
<page url="https://app.notion.com/p/3ec2674d32c3816bb4f5eedcbc1b64b9">03.3 — Experimental Variant P1-V1 — Pre-Battle Phase Clarity</page>
<page url="https://app.notion.com/p/3ec2674d32c381899d10efdc4ffaf214">03.4 — Playtest Session P02 — P1-V1 Phase Clarity</page>
<page url="https://app.notion.com/p/3ec2674d32c3816c9958d5e133f90645">03.5 — Finding F-001 — Beast Rush Window Too Short</page>
<page url="https://app.notion.com/p/3ec2674d32c38148866bcfe13d90810c">03.6 — Finding F-002 — Energy Rush 8s Window Too Short</page>
<page url="https://app.notion.com/p/3ec2674d32c3812f8df1f04f601dba43">03.7 — Experimental Variant P1-V3 — Extended Pre-Battle Timing</page>
## P1-V3 Preparation — 2026-10-01
- <mention-page url="https://app.notion.com/p/3ec2674d32c3812f8df1f04f601dba43">03.7 — Experimental Variant P1-V3 — Extended Pre-Battle Timing</mention-page> created for the Experimental 12s / 12s pre-Battle timing variant.
- <mention-page url="https://app.notion.com/p/3ec2674d32c381fd8be8f4effca90c4b"/> records the implemented P1-V3 task and automated/build pass.
- Do not start P03 until live-browser verification passes.
- F-002 Energy timing remains provisional until an independent P03 session confirms it.
<page url="https://app.notion.com/p/3ed2674d32c38139a940c678e6bdd4bf">03.8 — Playtest Session P03 — P1-V3 Extended Timing</page>
