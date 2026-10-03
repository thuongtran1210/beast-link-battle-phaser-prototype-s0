# P1-V14A — Multi-Wave Run Structure

Status: **Owner-confirmed structural flow PASS / Experimental / not adopted**

## Result

The multi-Wave structure is working correctly enough to continue:

```text
Wave 1
→ Wave Result
→ Wave 2
→ Wave Result
→ Wave 3
→ Final Result
```

This closes the structural Wave-flow question only.

It does **not** prove:
- Reserve strategy
- STAR consolidation
- Combo strategy
- Energy persistence
- persistent attrition

## Owner findings after V14A

Two blockers emerged immediately:

1. Start Battle requires all available units to be deployed, preventing intentional Reserve play.
2. returning units effectively regain full HP, preventing injured-vs-fresh deployment decisions.

These are now handled by:

`docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`

## Preserved V14A evidence target

Wave fixtures remain:
- Wave 1 — Frontline Pressure
- Wave 2 — Backline Dive
- Wave 3 — Protected Ranged

V14A mechanics should remain regression-protected while V14B is implemented.

## Adoption status

Multi-Wave remains Experimental.

Owner structural PASS is not the same as canonical design adoption.
