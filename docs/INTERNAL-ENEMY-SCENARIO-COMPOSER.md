# Internal Combat Validation Tool — Enemy Scenario Composer

This is test-only development tooling, not a gameplay or production level feature.

Normal `npm run dev` launches the read-only Prototype setup. `npm run dev:test` explicitly activates Test Harness mode, which may create an editable copy of a validation level's enemy formation. Canonical level definitions are never mutated. Prototype and Production both resolve their battle fixtures directly from level definitions and share the same `AutonomousBattleModel`.
