# Battle merge and action correction — 2026-10-09

Owner requested repair of missing merge buttons and combat actions inconsistent with roles.

Compact landscape previously showed eligibility text on cards but gated the actual action behind selection, with a fixed footer position. Tray pointerdown also entered drag immediately; pointerup only selected while idle. Eligible cards now expose a separate 44px merge action with normal/Shard cost. Short taps cancel drag before selecting; dragging still uses the existing controller. The redundant fixed footer action is removed. Consolidation continues through RunRoster, excluding deployed/KO ingredients and preserving aggregate HP and Shard accounting.

Player attack motion now runs once from resolved attacker events rather than both windup and resolution. Generic world-container forward lean is removed; Mage/Focus Ranger stay planted and fast Ranger uses slight recoil. Authored Tanker attacks use profile duration rather than a forced 400ms minimum, and simultaneous hit clips do not erase their attack. Signature and KO priority remain. No damage, targeting, STAR, resource or combat timing rules changed.

Validation: npm run check passed including authored animation duration/priority regression; npm run build passed. Live phone/touch and combat readability review remains open.
