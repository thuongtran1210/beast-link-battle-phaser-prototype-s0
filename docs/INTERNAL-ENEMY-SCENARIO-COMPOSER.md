# Internal Combat Validation Tool — Enemy Scenario Composer

This is test-only development tooling, not a gameplay or production level feature.

Normal `npm run dev` launches the read-only GAME setup. `npm run dev:test` explicitly activates Test Harness mode, which may create an editable copy of a validation level's enemy formation. Canonical level definitions are never mutated. Both contexts resolve their battle fixtures through the same `AutonomousBattleModel`.
