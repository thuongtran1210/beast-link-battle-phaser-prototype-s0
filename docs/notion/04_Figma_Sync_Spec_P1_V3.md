---
mirror_type: notion_snapshot
notion_page_id: "3ec2674d-32c3-8166-b437-f44754ae4eb7"
notion_url: "https://app.notion.com/p/3ec2674d32c38166b437f44754ae4eb7?pvs=204"
notion_title: "04 — Figma Sync Spec — P1 Baseline + P1-V3 Boundary"
notion_last_edited_at: "2026-10-02T06:18:11.214Z"
last_synced: "2026-10-02"
source_of_truth: "Notion"
---

> **Mirror notice:** Git snapshot of the Notion page above. Notion remains authoritative unless project policy changes. Notion-native tags are preserved for fidelity.

# 04 — Figma Sync Spec — P1 Baseline + P1-V3 Boundary

> **Status:** Active sync target for the current project state. Figma remains **Needs Sync**. Direct canvas work is currently blocked by the Figma MCP Starter-plan tool-call limit; no 2026-10-02 canvas mutation has occurred yet.
**Target Figma file:** [https://www.figma.com/design/Yxh9JPjptanUgg65Ze7eSR](https://www.figma.com/design/Yxh9JPjptanUgg65Ze7eSR)
**Design Source:** <mention-page url="https://app.notion.com/p/3ec2674d32c3812296a8de866c65c434"/>
**P1 Decision:** <mention-page url="https://app.notion.com/p/3ec2674d32c381e3bdb8fe9d409516f0"/>
**Phaser Matrix:** <mention-page url="https://app.notion.com/p/3ec2674d32c381919709d2b17efb3f57"/>
## Why Sync Is Required
The current Figma file still presents the old P0 / Unity-oriented flow:
- Beast Preparation → Resolution,
- Resolution → Auto Battle,
- Energy puzzle during active Battle,
- +10 / max20 Energy gauge,
- active-Battle puzzle matching,
- old phase-separated comparison as the 'current prototype'.
These are no longer the current P1 design baseline.
## P1 Baseline to Show
**Beast Rush → Energy Rush → Battle Setup / Beast Arrangement → Autonomous Battle + Timed Energy Cast → Result**
Figma is a UX visualization. It must not override the Current Gameplay Spec or present Experimental values as adopted rules.
## Existing Frame Audit
### 2:2 — Gameplay UX Mockup — Beast Puzzle Phase
Current stale content:
- `BEAST PREPARATION`,
- annotation says Combo ends → Resolution.
Sync to:
- title: `Gameplay UX Mockup — Beast Rush`,
- phase label: `BEAST RUSH`,
- keep Beast-only 6×6 board, Combo 5.0 / +0.3 / cap5, Beast Queue,
- change final flow annotation to: `Combo end → Energy Rush`,
- make clear Beast Rush builds Beast Queue; role meaning is realized later at Battle Setup.
### 6:2 — Gameplay UX Mockup — Battle Queue / Resolution
Current stale content:
- `RESOLUTION`,
- individual Deploy actions,
- Start Battle resolves full queue,
- transition directly to Auto Battle.
Replace current meaning with:
**Gameplay UX Mockup — Battle Setup / Formation**
Required UI concepts:
- STAR-001 conversion 1 / 3 / 9,
- unit labels: Beast ID + Role + Star,
- Front / Mid / Back formation rows,
- Unplaced Units,
- Stored Energy summary,
- Start Battle disabled until all units are placed,
- Start Battle locks formation and begins autonomous Battle.
Do not show the old individual-deploy Resolution model as current.
### 8:2 — Gameplay UX Mockup — Auto Battle + Energy Puzzle
Current stale content:
- Energy puzzle board in Battle,
- Energy gauges,
- +10 / max20 Ready flow,
- Battle text says puzzle input remains enabled.
Replace current meaning with:
**Gameplay UX Mockup — Autonomous Battle + Timed Energy Cast**
Required UI concepts:
- no puzzle board,
- Enemy HP,
- locked formation with Beast ID + Role + Star + current/max HP,
- `CURRENT FRONTLINE`,
- Stored Energy by Energy ID,
- `CAST HEAL` for available charges,
- autonomous Battle status / tick,
- Battle progresses with zero player input,
- Experimental Frontline Heal may be shown only with an `Experimental` label.
### 9:2 — Mechanic Visual — Onet Rules to Resource Output
Current stale Energy branch:
`Auto Battle → +10 Energy → Register Combo → Gauge Full → Skill`
Sync resource flow to:
- Beast Rush valid match → +1 BeastQueue → Combo,
- Energy Rush valid match → +1 EnergyQueue charge **Experimental Variant A**,
- Battle Setup → BeastQueue through STAR-001 → role-readable units → formation,
- Active Battle → consume pre-collected Energy at chosen moment,
- no Energy matching during Battle.
Keep Onet path rules Straight / L / Z / U ≤2 turns.
### 10:2 — Design Evolution — Mixed Resource vs Phase-separated
Current stale 'Current Prototype' branch:
`Beast Preparation → Resolution → Auto Battle + Energy board`.
Change the comparison to:
- Earlier concept / P0: active-Battle Energy puzzle or mixed-resource direction,
- Current P1 baseline: `Beast Rush → Energy Rush → Battle Setup → Autonomous Battle + Timed Energy Cast`,
- evidence boundary: P1 structure is implemented as validation prototype; player evidence is still being collected.
Do not claim P1 is superior.
## New Separate Experimental Area — P1-V3
Create a separate frame/card after the P1 baseline mockups:
**Experimental P1-V3 — Extended Pre-Battle Timing**
Show only as Experimental:
- Beast Rush = 12.0s initial / +0.3s per valid Beast match / 12.0s cap,
- 1.0s `ENERGY RUSH / Collect Energy for Battle` transition cue,
- Energy Rush = 12.0s visible countdown,
- valid Energy pair → +1 stored charge,
- timeout → automatic Battle Setup with Stored Energy preserved,
- status: live-browser gate passed by project-owner confirmation; ready for P03 real-player validation.
Explicit label:
**EXPERIMENTAL — live verified for P03 — not adopted into Current Gameplay Spec**
Do not merge the 12s/1s/12s timing into the main P1 baseline mockups as if it were an adopted rule.
## Visual / Portfolio Boundary
- Main P1 frames = current intended structural baseline.
- Experimental P1-V3 = current validation build for P03, not an adopted timing rule.
- P1-V1 / P1-V2 may remain only as historical experimental evidence if clearly labeled Archive / Prior Variant.
- Old P0 frames may be archived or clearly labeled `Archive — P0`; they must not remain visually presented as current.
- Figma does not claim final art, final timing, or production balance.
## Completion Gate
Figma sync is complete when:
- [ ] Beast Rush frame no longer says Combo → Resolution,
- [ ] current Battle Setup frame shows role/star formation + Stored Energy,
- [ ] current Battle frame has no puzzle board / Energy gauge loop,
- [ ] resource-flow visual uses pre-Battle EnergyQueue,
- [ ] design-evolution frame identifies P1 as current baseline,
- [ ] P1-V3 appears separately and is labeled `Experimental · Live Verified for P03 · Not Adopted`,
- [ ] old P0 visuals are archived / marked historical,
- [ ] screenshots visually confirm no contradictory current-flow labels remain.
## Figma Sync Execution Attempt — 2026-10-02
- Target file confirmed: `Yxh9JPjptanUgg65Ze7eSR`.
- Connected account/team confirmed: Quang Thường · WCDi · Full seat · Starter tier.
- Direct metadata/canvas access was retried after the user reprioritized Figma sync.
- Figma MCP returned the Starter-plan tool-call limit before canvas structure could be read.
- **No Figma canvas mutation occurred in this attempt.**
- The sync spec has been advanced from the old P1-V1 boundary to the current P1-V3/P03-ready state so execution can resume directly when MCP access is available.
- Sync status remains **Blocked by Figma MCP access**, not Complete.
