# Bug-Free Core Loop — Definition of Done

## Golden Season Determinism
- A fixed `careerSeed` and deterministic strategy must yield identical final summary and state hash.
- A different seed must change the final hash while preserving invariants.

## Required Invariants
- Offseason step transitions are valid according to `StateMachine`.
- Week advances monotonically during simulation.
- Standings records match simulated game results.
- No negative win/loss values in summary outputs.
- User roster has no duplicate player IDs and remains in allowed bounds.
- Save/load round-trips preserve state hash and phase/stage checkpoints.
- Re-sign expiry invariant: expiring players not re-signed and not tagged are moved to FA exactly once before FA opens.
- One-year re-sign invariant: `years=1` produces a new override contract with `endSeason === startSeason` and survives save/load.
- Franchise-tag invariant: tagged players receive a one-year `FRANCHISE_TAG` override and are excluded from resign and FA pools.
- Free-agency population invariant: FA pool uses effective overlay source-of-truth and deterministic safeguard seeding when below minimum depth.

## Required Automated Tests
- `src/testHarness/__tests__/goldenSeason.test.ts`
  - Same-seed determinism check.
  - Different-seed variance check.
- `src/lib/__tests__/saveManager.roundtrip.test.ts`
  - Offseason, midseason, postseason save/load hash integrity.
- `tests/golden-path.spec.ts`
  - Mobile golden-path UI smoke (new career, advance week, reload).

## Regression Gate
All tests above must pass in CI and remain under a 5-minute total runtime budget.
