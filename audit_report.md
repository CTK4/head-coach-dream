# Head Coach Dream: Comprehensive Reliability Audit Report

This report provides a detailed analysis of the **Head Coach Dream** mobile app codebase, specifically auditing the core simulation engines, state machine, and data persistence layers against the **Master Outline** requirements.

---

## 1. Executive Summary

The codebase demonstrates a robust foundation for a complex sports management simulation. However, several critical reliability gaps were identified that could lead to "stuck" game states, data corruption during season transitions, and inconsistent simulation results. The primary areas of concern are the **dual-source contract system**, **offseason state machine transitions**, and **RNG determinism**.

---

## 2. Core System Audits

### 2.1 Offseason State Machine & Transitions
The state machine is the "spine" of the game's progression. While the `StateMachine` library is well-structured, the implementation in `GameContext.tsx` has several vulnerabilities:

| Component | Status | Findings |
| :--- | :--- | :--- |
| **Phase Transitions** | ⚠️ Warning | The `TAMPERING` step is defined in the enum but lacks a robust transition path in `OFFSEASON_ADVANCE_STEP`, potentially skipping critical logic. |
| **Preseason Loop** | 🔴 Critical | A "stuck" state was identified where `careerStage` remains `PRESEASON` indefinitely if the user sims the final week without a manual trigger. |
| **Step Completion** | ✅ Pass | The `stepsComplete` map correctly tracks progress and prevents premature advancement. |

> **Remediation**: Implement the fix for the preseason-to-cutdowns transition (H2) and ensure `TAMPERING` logic is fully integrated into the `OFFSEASON_ADVANCE_STEP` reducer.

### 2.2 Contracts & Free Agency (FA)
The game uses a "Roster Overlay" system that merges base database (DB) players with runtime overrides. This is a powerful but fragile architecture.

| Component | Status | Findings |
| :--- | :--- | :--- |
| **Contract Source** | ⚠️ Warning | Contracts are sourced from both `leagueDb` and `playerContractOverrides`. If these desync, "phantom" contracts or incorrect cap hits occur. |
| **FA Migration** | ✅ Pass | The `ADVANCE_SEASON` logic correctly expires contracts and moves players to the `FREE_AGENT` pool. |
| **Cap Validation** | ⚠️ Warning | `validatePostTx.ts` excludes base DB contracts from validation, meaning initial roster errors may persist until a player is traded or cut. |

### 2.3 Scouting & Combine
The scouting system is highly deterministic but relies on a complex web of "intel" objects.

| Component | Status | Findings |
| :--- | :--- | :--- |
| **Combine Scoring** | ✅ Pass | `computeCombineScore` is robust, handling missing drills and aliases gracefully. |
| **Intel Persistence** | ⚠️ Warning | Scouting intel is stored in `offseasonData.scouting.intelByProspectId`. During season rollover, this data must be carefully migrated or cleared to avoid "ghost" intel on new draft classes. |
| **RNG Determinism** | 🔴 Critical | Some combine events use `Date.now()` or unseeded `Math.random()` in edge cases, which breaks save/load consistency for simulation results. |

### 2.4 Save/Load & Persistence
The save system is the most critical part of the user experience.

| Component | Status | Findings |
| :--- | :--- | :--- |
| **Schema Migration** | ⚠️ Warning | `migrateSaveSchema` handles version 0 to 2, but the `hardenPhaseFields` logic can "force" a career stage based on the week, which might overwrite a valid manual state. |
| **Recovery Mode** | ✅ Pass | The `recoveryNeeded` flag and associated UI provide a good safety net for corrupted saves. |

---

## 3. Prioritized Remediation Plan

### Priority 1: Critical Reliability (Immediate Fix)
1.  **Fix Preseason Loop**: Ensure `OFFSEASON_ADVANCE_STEP` correctly transitions to `CUTDOWNS` after the final preseason week.
2.  **Seed All RNG**: Replace all instances of `Math.random()` and `Date.now()` in `gameSim.ts` and `combine.ts` with the deterministic `detRand` utility using the `saveSeed`.
3.  **Contract Indexing**: Update `buildContractIndex` to strictly prioritize overrides and add a "deep-check" for desynced DB contracts.

### Priority 2: System Integrity (Next Sprint)
1.  **Tampering Phase**: Fully implement the `TAMPERING` logic in the state machine to allow for pre-FA negotiations as per the Master Outline.
2.  **Intel Cleanup**: Add a explicit "Scouting Reset" step during `ADVANCE_SEASON` to purge old prospect intel.

### Priority 3: Polish & UX
1.  **Validation UI**: Expose the results of `validatePostTx` to the user in the "Roster Audit" screen to help them identify why a transaction might be blocked.

---

## 4. Conclusion
The **Head Coach Dream** codebase is technically sophisticated but requires tightening in its state management and data integrity layers. Implementing the Priority 1 fixes will significantly reduce the reported "game-breaking" bugs and improve long-term save stability.
