# AGENTS.md — Beast Link Battle Repository Routing

This file routes AI agents to the correct source of truth.

## Task routing

### Gameplay / code / systems / validation

Read and obey:

1. `AI_INSTRUCTIONS.md`
2. the canonical Notion sources listed there
3. the active slice document in `docs/`
4. current code

Do not infer gameplay rules from art documentation.

### Art / visual assets / image generation / character design

Read and obey:

1. Notion: **05 — Art Direction & AI Asset Style Lock — Cute Tactical Chibi**
2. `ART_AGENT_INSTRUCTIONS.md`
3. `art/style/STYLE_BIBLE.md`
4. `art/style/STYLE_LOCK_PROMPT.md`
5. `art/style/BEAST_VISUAL_GRAMMAR.md` or `art/style/ENEMY_VISUAL_GRAMMAR.md`
6. `art/style/ASSET_QA_CHECKLIST.md`
7. `art/style/ASSET_MANIFEST.md`

Do not generate a full roster before a Master Reference is explicitly owner-approved.

### Mixed implementation + art task

Read both `AI_INSTRUCTIONS.md` and `ART_AGENT_INSTRUCTIONS.md`.

Gameplay rules remain owned by the gameplay sources. Art may communicate gameplay but must not silently invent new mechanics, roles, stats, STAR rules, skills, elements, or enemy behaviors.

## Current project split

- GAME = player-facing experience.
- TEST HARNESS = internal validation tooling.
- P1-V14A = current gameplay implementation slice.
- Cute Tactical Chibi = current art direction.
- Snowguard / Tanker = first Master Reference target.

## Status discipline

Never treat any of these as equivalent:

- generated
- reviewed
- STYLE APPROVED
- GAME READY

Likewise, never treat code existence as gameplay validation or design adoption.
