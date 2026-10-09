# Clean ranged projectiles and fun props

Owner request: visible Mage/Ranger ammunition and simple humorous skill effects, avoiding complex layered effects.

Ranger/Mage projectile emission uses `BattleTickPresentation.attackers` and its explicit resolved target IDs. Rangers emit outlined arrows; damaging Mages emit eyed magic orbs. Flights last 220–440ms according to presentation distance, with up to three unique targets per attacker and at most 18 simultaneous projectiles. Flights are visual only: damage, targeting, cooldowns and hit timing in the model are unchanged. HP/KO can therefore update before the visual projectile arrives. No homing retarget or collision simulation is introduced.

Support/control Signature events emit a heart to healing recipients, a toy box to shield recipients, a bubble to controlled enemies or a bomb to the planted target. They do not emit the generic damaging orb too. A four-stroke impact replaces extra ranged damage rings; old Focus/TwinVolley/ArcaneBloom aura/beam stacks are suppressed. Persistent Duck/Carrot/Bubble props remain tied to actual control state, with bobbing duck, short QUACK/YUM text and a larger translucent bubble. Toy shield recipients show a small robot holding a shield. Bomb countdown uses three beats and emits one smoke puff when the recorded model fuse expires; projectile arrival does not explode the bomb.

Existing fun-skill eligibility and once-per-Battle limits are unchanged. This is presentation work, not additional mechanics or balance adoption. Code-native graphics use the owner flat/outlined chibi direction without generating new raster art.

Check/build validation is separate from live readability review. Browser automation initialization was unavailable in the preceding UI session; no device or screenshot pass is claimed here. Review flight readability, supported target recipients, bomb timing and five-unit crowding on a physical landscape phone.
