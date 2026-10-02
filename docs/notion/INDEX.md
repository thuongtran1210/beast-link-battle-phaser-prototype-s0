# Beast Link Battle — Notion Mirror Index

> **Purpose:** durable Git backup of the project's core Notion documentation.
>
> **Sync date:** 2026-10-02
>
> **Policy:** Notion remains the current design/documentation Source of Truth. Files in this folder are snapshots for recovery, version history, AI handoff, and offline access. Do not silently edit a mirror and assume Notion changed too.

## Recommended read order

1. [Current Project Handoff](./00.0_Current_Project_Handoff.md)
2. [Current Gameplay Spec v2](./00_Current_Gameplay_Spec_v2.md)
3. [New Chat Resume Prompt](./00.0.1_New_Chat_Resume_Prompt.md)
4. [P1 Dual-Queue Decision Record](./00.2_Decision_Record_P1_Dual_Queue_Core_Loop.md)
5. [Phaser Validation Prototype Spec — P1 Transition](./02_Phaser_Validation_Prototype_Spec_P1_Transition.md)
6. [Phaser Implementation Matrix](./02.1_Phaser_Implementation_Matrix.md)
7. [P1 Technical Scaffold](./02.4_P1_Technical_Scaffold.md)
8. [Validation Log](./03_Validation_Log.md)
9. [Playtest Protocol v2](./03.1_Playtest_Protocol_v2.md)
10. [Experimental P1-V3](./03.7_P1_V3_Extended_Pre_Battle_Timing.md)
11. [Playtest Session P03](./03.8_Playtest_Session_P03.md)
12. [Figma Sync Spec — P1 + P1-V3](./04_Figma_Sync_Spec_P1_V3.md)

## Sync discipline

- After a meaningful documentation/design session, update Notion first.
- Mirror only pages changed in that session, plus Handoff when its milestone/blocker/next action changed.
- Commit mirror updates with a clear message such as `docs: sync Notion snapshot YYYY-MM-DD`.
- Experimental values remain Experimental in Git exactly as in Notion.
- Do not use a stale mirror to override a newer Notion page.
- If Notion becomes inaccessible, this folder is the recovery baseline; compare Git history before making new design decisions.

## Current mirror set

- `00.0_Current_Project_Handoff.md`
- `00_Current_Gameplay_Spec_v2.md`
- `00.0.1_New_Chat_Resume_Prompt.md`
- `00.2_Decision_Record_P1_Dual_Queue_Core_Loop.md`
- `02_Phaser_Validation_Prototype_Spec_P1_Transition.md`
- `02.1_Phaser_Implementation_Matrix.md`
- `02.4_P1_Technical_Scaffold.md`
- `03_Validation_Log.md`
- `03.1_Playtest_Protocol_v2.md`
- `03.7_P1_V3_Extended_Pre_Battle_Timing.md`
- `03.8_Playtest_Session_P03.md`
- `04_Figma_Sync_Spec_P1_V3.md`
