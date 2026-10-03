# AGENTS.md — Beast Link Battle Repository Routing

This file routes AI agents to the correct repository-local source of truth.

## Gameplay / code / systems / validation

**Do not call Notion MCP during normal coding work.**

Read:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. `AI_INSTRUCTIONS.md`
3. active slice document under `docs/`
4. current code/tests

Notion is synchronized separately only when the user explicitly requests it.

Current gameplay slice:

**P1-V14B.1/B.2 — Run Roster, Partial Deployment & Attrition**

## Art / visual assets / image generation

Use repository-local art sources:

1. `ART_AGENT_INSTRUCTIONS.md`
2. `art/style/STYLE_BIBLE.md`
3. `art/style/STYLE_LOCK_PROMPT.md`
4. relevant Beast/Enemy grammar
5. `art/style/ASSET_QA_CHECKLIST.md`
6. `art/style/ASSET_MANIFEST.md`

Do not mass-generate a roster before owner approval of the Master Reference.

## Mixed code + art task

Read both coding and art instructions.

Gameplay facts must come from gameplay docs/code.
Art docs may communicate mechanics but must not invent them.

## Project split

- GAME = player-facing.
- TEST HARNESS = internal validation.
- V14B.1/B.2 = active gameplay implementation.
- Cute Tactical Chibi = art direction.
- Snowguard / Tanker = first art Master Reference target.

## Status discipline

Do not equate:
- code exists
- checks pass
- live pass
- adopted design

For art, do not equate:
- generated
- reviewed
- STYLE APPROVED
- GAME READY
