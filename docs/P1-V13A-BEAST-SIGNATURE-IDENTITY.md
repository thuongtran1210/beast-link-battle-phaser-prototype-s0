# P1-V13A — Beast Signature Identity

Status: **Experimental / not adopted / implementation exists / live signature gate still open**.

Commit:

`7f7af78598e99cb18bbabb76c9cadc9c95de470f`

## Purpose

P1-V13A adds deterministic automatic signatures so Beast identity can create tactical playstyle beyond Role + base stats.

The signature source belongs to Beast identity, not directly to the Role enum.

## Current signature mapping

- beast-a / beast-e → **Guardian Brace**
- beast-b → **Ambush Strike**
- beast-c / beast-f → **Focus Shot**
- beast-d → **Arcane Bloom**

These mappings are Experimental. They are not canonical Beast kits.

## Design intent

- **Guardian Brace** rewards useful Tank interception.
- **Ambush Strike** rewards clean Assassin access to a deep target.
- **Focus Shot** rewards protected uninterrupted Ranger HOLD time.
- **Arcane Bloom** rewards Mage access to clustered enemies.

The intent is to connect:

```text
formation
→ spatial condition
→ signature opportunity
→ combat consequence
```

rather than adding four generic timed damage abilities.

## Implementation boundary

Signatures use the existing deterministic fixed-step combat timeline.

P1-V13A does not introduce:

- mana
- ultimate bars
- player skill buttons
- traits
- items
- economy
- a generic RPG ability framework

`P1V13A_SIGNATURE_FIXTURE` contains Experimental values. Current Gameplay Spec values are unchanged.

Arcane Bloom evaluates its cluster at normal cast resolution in the current implementation.

## Verification status

Agent report for the P1-V13A implementation stated:

- deterministic V13A checks passed
- historical checks passed under `npm run check`
- TypeScript compilation passed during the reported build run
- the environment terminated the build before final Vite bundle completion
- manual Tank / Assassin / Ranger / Mage live A/B observations were not performed at that point

Therefore do **not** describe P1-V13A as fully live-verified solely from the implementation report.

## Current validation blocker

P1-V13A live testing is currently blocked by Battle Setup / Test Harness usability.

The owner needs to be able to deliberately create favorable and unfavorable conditions for each signature without source edits:

- Tank interception corridor for Guardian Brace
- aligned vs delayed deep access for Ambush Strike
- protected HOLD vs forced KITE for Focus Shot
- clustered vs spread enemies for Arcane Bloom

P1-V13A.1 and P1-V13A.2 added enemy-level and drag/deployment tooling, but the current Setup UI has not passed owner UX review.

See:

- `docs/P1-V13A1-TEST-HARNESS.md`
- `docs/P1-V13A1D-DEPLOYMENT-WORKSPACE-UX.md`

Do not start P1-V13B Tactical Energy until this live-testability blocker is closed.
