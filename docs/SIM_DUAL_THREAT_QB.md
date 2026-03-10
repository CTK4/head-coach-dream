# Dual-Threat QB Simulation

## Added Attributes
- Passing: armStrength, accuracyShort/Mid/Deep, anticipation, decisionSpeed, pocketPresence
- Mobility: speed, acceleration, elusiveness, readSpeed, truckContactBalance, slideRate
- Dual-threat: rpoRating, scrambleDiscipline, pocketEscapeAngle, armOnRunAccuracy

## Archetypes
Resolved via `resolveQbArchetypeTag` with optional manual override and auto-tag fallback.

## Sim Branching
- Pressure now branches for mobile archetypes into throw-on-run or scramble paths.
- Throw-on-run passes use `qbBallistics(throwOnRun=true)` and `armOnRunAccuracy`.
- Scramble branch reuses `contactResolver` and records QB run contact exposure.

## Scheme Fit
- `qbSchemeFit` reads multipliers from `src/config/qbTuning.ts`.
- Fit modifies execution outcomes, not displayed ratings.

## Injury Integration
- Weekly injury generation scales QB injury base rate using run-contact exposure and slide rate.

## Scouting/Draft
- QB divergence width can expand by archetype.
- Reveal thresholds for `scrambleDiscipline` and `rpoRating` are delayed.

## Deferred
- Full defender-by-defender pressure selection.
- Play-art level RPO reads.
- True contact-event injury generation per snap.
