# Ten-unit deck prototype

Owner authorized expanding the six-unit pool to ten units, with a fixed deck of six and deployment cap of four. This gameplay experiment supersedes the previous presentation-only restriction for these additions only. Balance and adoption remain open.

## New units

- Woolkeeper (`beast-g`, sheep): heals the living injured ally with lowest HP ratio. 1★ heals 14 on a 4s cooldown; 2★ heals 22 on 3s cooldown; 3★ heals 28 to up to two allies on 3s cooldown and grants an 18-point shield for 2s. No resurrection or overheal. Heart/wool recipient marker.
- Hophex (`beast-h`, frog): bubbles one enemy for 0.8s at 1★; one for 1.2s at 2★; two for 1.2s at 3★. 5s cooldown. Controlled enemies cannot attack or move. Single bubble outline per target.
- Gadgetduck (`beast-i`, engineer): grants 20/32/44 shield for 3s, to one/one/two living allies without a significant existing shield. 5s cooldown. Toy-box recipient marker.
- Boomhog (`beast-j`, hedgehog): arms a 1.2s bomb attached to a target. It hits up to one/two/three living enemies within 1.5 model distance for 1.5 times the source's damage. 5s cooldown. Visible fuse counter and one impact ring. Pending bomb still detonates if its target dies.

New units currently use Mage positioning and stat baseline. Support actions occur when their ordinary attack resolves in range. Role/stat specialization remains a balancing follow-up; the art library does not automatically enable other characters.

## Deck

Exactly six distinct types from ten. Local saved selections with other sizes fall back to the original six. Deck is locked during a Run; changing it starts a new Run. Active deployment remains four. Test harness defaults to the original six unless explicitly configured.

## Evidence

Checks cover heal priority, no damage from healing action, heal cooldown, 3★ two-target shield, no resurrection, bubble target count/expiry, toy target count, bomb fuse delay/clearing/target count, and fixed-deck validation. Check and build pass. Live mobile touch/readability and balance review remain open. No claim of production readiness or design adoption.
