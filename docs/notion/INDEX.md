# Beast Link Battle — Notion Mirror Index

> **Purpose:** durable Git backup of the project's core Notion documentation.
>
> **Sync date:** 2026-10-02
>
> **Policy:** Notion remains the current design/documentation Source of Truth. Files in this folder are snapshots for recovery, version history, AI handoff, and offline access. Do not silently edit a mirror and assume Notion changed too.

## Recommended read order

1. [Current Project Handoff](./00.0_Current_Project_Handoff.md)
2. [Current Gameplay Spec v2](./00_Current_Gameplay_Spec_v2.md)
3. [STAR-001 Decision Record](./00.1_Decision_Record_STAR001.md)
4. [P1 Dual-Queue Decision Record](./00.2_Decision_Record_P1_Dual_Queue_Core_Loop.md)
5. [New Chat Resume Prompt](./00.0.1_New_Chat_Resume_Prompt.md)
6. [Unity Implementation Audit](./01_Unity_Implementation_Audit.md)
7. [Repo Stabilization Checklist](./01.1_Repo_Stabilization_Checklist.md)
8. [Phaser Validation Prototype Spec — P1 Transition](./02_Phaser_Validation_Prototype_Spec_P1_Transition.md)
9. [Phaser Implementation Matrix](./02.1_Phaser_Implementation_Matrix.md)
10. [P0 Technical Scaffold](./02.2_P0_Technical_Scaffold.md)
11. [P0 Audit — Phaser Rule Sandbox](./02.3_P0_Audit_Phaser_Rule_Sandbox.md)
12. [P1 Technical Scaffold](./02.4_P1_Technical_Scaffold.md)
13. P1 implementation tasks: 02.5a → 02.11
14. [Validation Log](./03_Validation_Log.md)
15. [Designer Pre-Playtest Risk Review](./03.0_Designer_Pre_Playtest_Risk_Review.md)
16. [Playtest Protocol v2](./03.1_Playtest_Protocol_v2.md)
17. Validation history: P01 → P02 → F-001 / V2 → F-002 → P1-V3
18. [Playtest Session P03](./03.8_Playtest_Session_P03.md)
19. [Figma Sync Spec — P1 + P1-V3](./04_Figma_Sync_Spec_P1_V3.md)

## Recovery groups

### Current state / source-of-truth
- `00.0_Current_Project_Handoff.md`
- `00_Current_Gameplay_Spec_v2.md`
- `00.1_Decision_Record_STAR001.md`
- `00.2_Decision_Record_P1_Dual_Queue_Core_Loop.md`
- `00.0.1_New_Chat_Resume_Prompt.md`

### Implementation truth / history
- `01_Unity_Implementation_Audit.md`
- `01.1_Repo_Stabilization_Checklist.md`
- `02_Phaser_Validation_Prototype_Spec_P1_Transition.md`
- `02.1_Phaser_Implementation_Matrix.md`
- `02.2_P0_Technical_Scaffold.md`
- `02.3_P0_Audit_Phaser_Rule_Sandbox.md`
- `02.4_P1_Technical_Scaffold.md`
- `02.5a_P1_S0_Implementation_Task_Initial.md`
- `02.5b_P1_S0_Implementation_Result.md`
- `02.6_P1_S1_Energy_Pre_Collection.md`
- `02.7_P1_S2_Beast_Role_Arrangement.md`
- `02.8_P1_S3_Autonomous_Battle.md`
- `02.9_P1_S4_Timed_Energy_Cast.md`
- `02.10_P1_S5_Validation_Instrumentation.md`
- `02.11_P1_Exit_Audit_Structural_Prototype.md`

### Validation evidence / experiments
- `03_Validation_Log.md`
- `03.0_Designer_Pre_Playtest_Risk_Review.md`
- `03.1_Playtest_Protocol_v2.md`
- `03.2_Playtest_Session_P01.md`
- `03.3_P1_V1_Pre_Battle_Clarity.md`
- `03.3.1_P1_V1_Implementation_Task.md`
- `03.4_Playtest_Session_P02.md`
- `03.5_Finding_F001_Beast_Rush_Window_Too_Short.md`
- `03.5.1_P1_V2_Beast_Rush_Timing.md`
- `03.5.2_P1_V2_Implementation_Task.md`
- `03.6_Finding_F002_Energy_Rush_8s_Too_Short.md`
- `03.7_P1_V3_Extended_Pre_Battle_Timing.md`
- `03.7.1_P1_V3_Implementation_Task.md`
- `03.8_Playtest_Session_P03.md`

### UX / Figma sync
- `04_Figma_Sync_Spec_P1_V3.md`

## Sync discipline

- After a meaningful documentation/design session, update Notion first.
- Mirror only pages changed in that session, plus Handoff when its milestone/blocker/next action changed.
- Commit mirror updates with a clear message such as `docs: sync Notion snapshot YYYY-MM-DD`.
- Experimental values remain Experimental in Git exactly as in Notion.
- Do not use a stale mirror to override a newer Notion page.
- If Notion becomes inaccessible, this folder is the recovery baseline; compare Git history before making new design decisions.
