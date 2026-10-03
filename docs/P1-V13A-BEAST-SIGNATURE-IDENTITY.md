# P1-V13A — Beast Signature Identity

Status: **Experimental / not adopted / implementation exists / full live signature gate still open**.

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

The intended relationship is:

```text
formation
→ spatial condition
→ signature opportunity
→ combat consequence
```

## Verification status

Implementation and deterministic-check evidence exists.

Full manual Tank / Assassin / Ranger / Mage A/B live verification remains open.

Do not describe P1-V13A as adopted or fully live-verified solely because the code exists.

## Current priority relationship

P1-V13A.1D Setup UX remains unresolved, but the project owner has reprioritized a more fundamental question:

> Does the core loop provide enough future horizon for Queue, STAR, Combo, formation and Energy decisions to matter?

Therefore P1-V14 may proceed while the V13 live/UX gates remain explicitly open.

This is a priority change, not a PASS.

See:

- `docs/P1-V13A1-TEST-HARNESS.md`
- `docs/P1-V13A1D-DEPLOYMENT-WORKSPACE-UX.md`
- `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`

Do not start Tactical Energy expansion before the V14 resource-horizon experiments clarify whether Energy depth is missing because of effect variety or because the single-Battle structure provides no reason to save resources.
