AI_INSTRUCTIONS.md — Beast Link Battle Phaser Prototype
Purpose
This repository is the Phaser gameplay validation prototype for Beast Link Battle.
This file is only a bootstrap / guardrail for AI-assisted development. It is not a gameplay specification and must not duplicate or redefine canonical rules from Notion.
Canonical Source Priority
Before changing gameplay behavior, read these Notion sources in this order:
1. 00 — Beast Link Battle — Current Gameplay Spec v2
   https://app.notion.com/p/3ec2674d32c3812296a8de866c65c434?pvs=204
2. 00.2 — Decision Record — P1 Dual-Queue Core Loop
   https://app.notion.com/p/3ec2674d32c381e3bdb8fe9d409516f0?pvs=204
3. 02 — Phaser Validation Prototype Spec — P1 Transition
   https://app.notion.com/p/3ec2674d32c38155a07ec449ad9f9ea2?pvs=204
4. 02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle
   https://app.notion.com/p/3ec2674d32c3817a908cfb59b0e6184f?pvs=204
5. 02.1 — Phaser Implementation Matrix
   https://app.notion.com/p/3ec2674d32c381919709d2b17efb3f57?pvs=204
6. Current code.
Use 02.2 — P0 Technical Scaffold only as historical implementation context.
Current Project State
- P0 is complete and verified as a historical baseline.
- Current Gameplay Spec is now v2 / P1.
- Existing P0 Phaser behavior may intentionally be Needs Sync with v2.
- Do not preserve P0 behavior merely because it already works if it conflicts with the current design source.
- Current implementation task: P1-S0 — State Migration from the P1 Technical Scaffold.
Mandatory Guardrails
- If Notion is inaccessible, stop. Do not implement from memory.
- If canonical sources conflict, report the conflict. Do not silently choose one.
- Do not invent missing values, timings, conversion rates, role stats, skill effects, slot layouts, or other open design decisions.
- If a temporary value is required only to make an implementation slice runnable, label it explicitly as Experimental / prototype-only fixture / not an adopted design rule and report it.
- Do not edit the Current Gameplay Spec from code.
- Do not treat Unity implementation as the Design Source of Truth.
- Do not copy Unity architecture into Phaser.
- Keep Phaser validation-oriented and small.
- Work on one P1 slice at a time.
- Do not expand into later P1 slices until the current slice is verified.
- Reuse existing P0 systems only when they still satisfy the current canonical rules.
- Do not refactor unrelated working P0 code without a requirement from the active slice.
Implementation Workflow
For every slice:
1. Read the canonical sources above.
2. State the exact Rule IDs / design requirements affected.
3. Inspect current code before editing.
4. Report any P0 → P1 conflict found.
5. Implement only the active slice.
6. Add deterministic checks for new behavior.
7. Run all still-relevant regression checks.
8. Run the production build.
9. Perform live-browser verification when visible flow changes.
10. Update 02.1 — Phaser Implementation Matrix with actual implementation status.
Do not mark a rule Implemented because code exists. It must work in the current Phaser validation flow.
Current Immediate Task
Read 02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle and implement only:
P1-S0 — State Migration
Do not implement P1-S1 or later slices in the same change unless explicitly requested after P1-S0 verification.