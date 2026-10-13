# Battle causality correction — 2026-10-09

Owner requested correction of movement, attacks and unexplained deaths. Combat semantics remain unchanged.

Resolved enemy actions now retain source ID, target ID, archetype, actual HP loss, shield absorption and lethal result. Snapshot copies isolate this metadata. Player presentation retains multiple actions from the same unit in one simulation step instead of overwriting them in a per-unit map. Resolved attacks face the actual event target.

Normal attacks render an immediate role-specific contact trace at the same tick as HP loss; there is no cosmetic projectile arriving 220–440ms after the victim loses HP or dies. Windup has a small preparation cue. Enemy Ranged stays planted. Delayed Ticking Bomb detonates on its victims without replaying a distant/dead caster attack or sending a new bomb after damage. Existing support/control markers remain.

KO displays the source of the final attack and allows the existing fall clip to remain visible before fade. Incoming hit reactions no longer move the world container. Movement only stops its own tween; authored walk follows model Moving state. Showcase packing no longer relocates combat X to a distant free grid cell: stable vertical insets are capped at 24px, include dead IDs and never reflow on KO. Dense groups may still overlap; spacing is no longer allowed to invent attack range.

Validation: source/target/actual-damage accounting through lethal enemy attacks; snapshot isolation; same-source multiple actions; bounded deterministic combat offsets; full existing regression suite and build. Golden master keeps the original 3264 scenario fingerprints, omitting only the added lastEnemyActions metadata, which has dedicated checks. No baseline regeneration or balancing. Live browser/mobile readability review remains open.
