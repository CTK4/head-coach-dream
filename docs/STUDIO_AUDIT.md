# Head Coach Dream — Studio Diligence Audit

*Prepared as if for a studio evaluating acquisition / investment / publishing. All findings are grounded in code evidence. No credit given for intent without implementation.*

---

## 1. Executive Summary

**What this repo is:** A TypeScript/React mobile-first web application implementing an American football franchise management simulation. The codebase spans 665+ source files organized into a sophisticated engine layer, a React UI of 152 pages and 102 components, and 153 test files. The project demonstrates uncommon engineering discipline: a seeded-deterministic simulation architecture, versioned save migrations, a genuine physics subsystem for user-controlled games, and a structured player/contract/cap model. The game is intended to be played in a browser (persistence via localStorage), with a franchise loop covering onboarding, offseason, draft, free agency, trades, weekly regular season, and playoffs.

**Closest benchmark today:** The repo is closest to a **Pocket GM 3 aspirant with partial Madden Franchise ambitions**, not an OOTP analogue. It has Pocket GM's tight GM-loop DNA — mobile-first, decision-forward, quick season flow — but reaches toward Madden's depth of presentation (playbooks, schemes, staff, scouting). It does not yet approach OOTP's statistical depth, commissioner tooling, historical recordkeeping, or universe customization. The play-by-play simulation engine is architecturally the most mature piece and exceeds what Pocket GM ships; but the league-wide simulation (CPU vs. CPU games) is a Gaussian score approximation that undermines the living-world immersion that makes OOTP and Madden Franchise feel populated and persistent.

**Does it support a compelling football franchise sim loop today?** Conditionally. A single user-controlled franchise with active weekly playcalling is well-served: the physics engine, fog-of-war scouting, and cap/contract math are all implemented with genuine depth. The problems emerge when looking at the league as a living world: CPU games are resolved with `score = 24 + spread + gaussian * 8` using only OVR average, not the team's scheme, playbook, staff, or morale. Badges are awarded post-season but have no confirmed feedback path into simulation math. Morale computes per-player values but hardcodes key inputs. League-wide statistical realism is therefore approximated, not simulated. After two to three seasons, the careful player would notice that CPU teams don't feel like distinct organizations. The core user-game experience is credible; the surrounding franchise ecosystem is thin.

---

## 2. Product Maturity Verdict

**Verdict: Vertical Slice**

A **Vertical Slice** means: one game mode or one user-game experience is implemented deeply and demonstrably, but the full franchise ecosystem it sits inside is not yet cohesive or deep enough to sustain long-term engagement without cracks showing.

Evidence for the label:

- **The user game (play-by-play mode) is genuinely production-quality.** `gameSim.ts` imports from 9 separate physics resolvers (`contactResolver`, `catchPointResolver`, `passRushResolver`, `qbBallistics`, `kickResolver`, `fumbleResolver`, `pileResolver`), applies weather effects, unicorn modifiers, fatigue, perk wiring, archetype traits, and defensive AI with situation-bucket awareness. This is deep.
- **CPU games are a shallow approximation.** `simulateAIGame()` in `leagueSim.ts:181-227` resolves all non-user games with Gaussian noise around a score derived solely from OVR average of top-22 healthy players. No scheme, playbook, staff, gameplan, morale, or home/away identity is used. Stat leaders are mathematically allocated (65% of team passing yards to QB1, 25% to QB2, etc.) rather than simulated. This is a box-score shell.
- **Franchise meta-systems exist in varying states.** Draft, free agency, scouting, contracts, and staff all have genuine logic. But badges are cosmetic (no confirmed simulation feedback path), morale has hardcoded inputs (`strategyModeFit: 55`, `roleExpectation: 'ROTATIONAL'`), and commissioner/sandbox tools are absent entirely.
- **No multi-device save, no custom league, no difficulty controls, no UDFA flow, no compensatory picks, no modding support.** These are expected features in any franchise sim claiming to be a product.
- **153 tests** covering critical systems is evidence of maturity *in the systems tested*. But the CPU game model and the franchise loop integration are not deeply tested for statistical realism.

The vertical slice that works: *one user coaching a team through a season, calling plays, scouting prospects, managing a roster, and competing in a playoff*. That experience is well-built. The franchise sim around it is scaffolded but not yet filled.

---

## 3. Functional Inventory

| Functional Area | Status | Evidence | Notes on Quality |
|---|---|---|---|
| User-game play-by-play sim | **Implemented** | `gameSim.ts` + 7 physics resolvers, `defense/aiSelectDefensiveCall.ts` | Genuinely deep; fatigue, weather, unicorns, perks all wired |
| CPU vs. CPU game sim | **Partial** | `leagueSim.ts:181-227` `simulateAIGame()` | Gaussian score approx; OVR-only; no scheme/staff/gameplan effect |
| Deterministic seeding | **Implemented** | `engine/rng.ts`, `determinism/seedDerivation.ts`, replay tests | Best-in-class for this type of product |
| Player generation | **Implemented** | `playerGenerator.ts`, `playerGeneratorConfig.ts` | Gaussian attribute sampling, archetype biases, dev traits |
| Draft system (UI + AI) | **Implemented** | `draftSim.ts`, `draftReducer.ts`, draft tests | 7 rounds, trade logic, AI draft board, CPU logic |
| Free agency | **Implemented** | `faResolve.ts`, `freeAgencyReducer.ts`, FA tests | Market values, bidding, AI logic |
| Contracts / cap math | **Implemented** | `contractMath.ts`, `capLedger.ts` | Dead cap, restructure, tag, extension exist |
| Advanced contract structures | **Partial** | Types defined in `contracts/` | Void years, incentive clauses defined; full simulation coverage unclear |
| Trade engine | **Implemented** | `tradeValuation.ts`, `tradeEngine.ts` | Age decay, cap penalty, dev trait, stage bias, pick curves |
| Scouting fog-of-war | **Implemented** | `scouting/core.ts` (19 files) | Gaussian noise, GM trait modulation, clarity tracks, diminishing returns |
| Scouting statement library | **Partial** | `scouting/reportGenerator.ts`, `scoutView.ts` | Infrastructure exists; breadth of per-position statements unclear |
| Combine / pro day | **Implemented** | `scouting/combineScore.ts`, `drillComposite.ts`, combine tests | Drill composites, percentile scoring |
| Badge system | **Partial** | `badges/engine.ts` — 12 badges defined | Post-season awards only; no evidence of sim feedback; ~25% of CLAUDE.md catalog |
| Unicorn system | **Partial** | `unicorns/engine.ts`, `effects.ts` | Detection + in-game modifiers wired; AI opponent adjustments incomplete |
| Player progression | **Implemented** | `snapProgression.ts`, `systems/snapProgression.ts` | Snap-share, age regression, dev trait, efficiency score; formula documented |
| Morale | **Partial/Stub** | `morale.ts`, `moraleEngine.ts` | Computes values but inputs hardcoded; no confirmed sim feedback |
| Chemistry | **Partial** | `chemistry.ts` | Module exists; downstream effects uncertain |
| Injury system | **Implemented** | `injuries.ts`, `injuryTypes.ts`, injury tests | 8 types, severity levels, recurrence multipliers, concussion flags |
| Fatigue | **Implemented** | `fatigue.ts`, used in `gameSim.ts` | Per-game snap tracking, recovery, performance adjustments |
| Playbooks (15 off / 15 def) | **Implemented** | `playbooks/`, `playbookDSL.ts` | DSL-expanded play catalogs; CPU gameplan builder exists |
| Gameplan system | **Implemented** | `gameplan.ts`, `WeeklyGameplan` type | User and CPU gameplans; gameplan effects tested |
| Staff hiring | **Implemented** | `assistantHiring.ts`, `staffingReducer.ts` | Acceptance logic, poaching, role appeal |
| Staff effects | **Partial** | `coachImpact.ts`, `perkEngine.ts`, `perkWiring.ts` | Some perks wired to gameSim; scope of all effects unclear |
| Schedule generation | **Implemented** | `engine/schedule.ts` | Full 17-week + preseason + playoff |
| Standings / tiebreakers | **Implemented** | `standings.ts`, `tiebreaks.ts` | Conference records tracked |
| Playoffs | **Implemented** | `playoffsSim.ts`, `postseason.ts` | Bracket generation, round advancement |
| Awards system | **Partial** | `awardsEngine.ts` | Awards derived from Gaussian-approximated AI stats; not from play-resolution |
| Hall of Fame | **Implemented** | `hofMonitor.ts`, `league_history/` | HOF tracking, historical records |
| Season rollover | **Implemented** | Offseason tests, rollover logic | Retirements, rollover stats, re-entry to offseason |
| News/media | **Partial** | `newsGen.ts`, news array in GameState | Transaction and injury news exist; narrative richness unclear |
| Save/load + migrations | **Implemented** | `context/boot/`, `migrateSave.ts`, `validators.ts` | Versioned, validated, atomic writes |
| Multi-save support | **Partial/Unknown** | `saveManager.ts` exists | Infrastructure unclear; single localStorage slot may be default |
| Commissioner/sandbox mode | **Missing** | No evidence found | Not implemented |
| Custom league creation | **Missing** | No evidence found | Not implemented |
| Difficulty / sim tuning | **Missing** | No user-facing controls found | Calibration pack exists but user can't adjust |
| UDFA / waiver wire | **Missing/Partial** | No dedicated UDFA flow found | Post-draft FA pool exists; UDFA formalism absent |
| Compensatory picks | **Missing** | No evidence found | Not implemented |
| Practice squad rules | **Partial** | `status: "PS"` in PlayerRow | Status tracked; signing/waiver rules unclear |
| Modding / import-export | **Missing** | No evidence found | Not implemented |
| Power rankings | **Implemented** | `systems/powerRankings.ts` | Win-based efficiency computation |
| Statistical leaderboards | **Partial** | `computeLeagueStatLeaders()` in leagueSim | Allocated from AI game approximations, not individual sim |
| Advanced metrics / telemetry | **Implemented** | `telemetry/` (5 files) | Per-game aggregation, percentiles, advanced metrics defined |
| Weather system | **Implemented** | `weather/generateGameWeather.ts` | Venue-based, deterministic, effects wired to user game |
| Accessibility | **Partial** | Radix UI + shadcn components | Component library supports it; implementation completeness unclear |

---

## 4. Benchmark Comparison Matrix

| Benchmark | Closest Comparable Systems | Where Repo is Ahead | Where Repo is Behind | Severity of Gap |
|---|---|---|---|---|
| **OOTP Baseball** | Draft scouting fog-of-war, cap math, season progression loop, HOF tracking | Deeper play-resolution physics; more tactically granular for user game | Commissioner mode, custom universe, historical databases, statistical rigor for non-user games, league customization, real-world data import, multi-team sim fidelity, development pipeline depth | **Critical** |
| **Pocket GM 3** | Tight GM loop (draft, FA, trades, cap), mobile-first layout, season flow speed | Scouting fog-of-war depth, playbook/scheme system, physics sim richness, determinism architecture | Pocket GM ships as a complete, multi-season-stable product; this is not yet there. CPU team behavior over many seasons is more cohesive in Pocket GM | **Medium** |
| **Madden Franchise** | Weekly hub, staff/coordinator hiring, scouting with assignments, draft board, scheme fit, injury tracking, news/media | Determinism, data architecture, scouting fog-of-war, contract math depth | Player motivation/X-factor traits affecting franchise flow, weekly storyline generation, staff skill trees, owner goal system, meaningful presentation layer | **High** |

---

## 5. Deep Comparative Analysis

### 5.1 vs. OOTP Baseball (translated to football)

**What OOTP does that matters:**
- Every CPU game is resolved with a per-pitch (per-play) deterministic model — even CPU vs. CPU games. Team identity expresses itself through roster composition, not just OVR average.
- Commissioner mode: edit any player, team, rule, or historical record. Create fictional leagues.
- Historical databases: career tracking, all-time leaderboards, franchise records, dynasty mode with generational storylines.
- Development pipeline (minor leagues): equivalent to practice squad depth, ERFA/CRFA futures, and the unpredictability of young player development.
- Scouting in OOTP has genuine uncertainty per-player with hidden potential ratings, and your scouting staff quality determines uncertainty bands.
- News/narrative: hundreds of event templates generating a living league feel.

**Does this repo have equivalents?**
- CPU game per-play sim: **No.** `simulateAIGame()` is score-level only.
- Commissioner mode: **Absent.**
- Historical databases: **Partial.** `league_history/` exists, HOF monitor exists, but all-time leaderboards and year-by-year career stats for non-user players are unclear.
- Development pipeline: **Partial.** Snap-based progression exists; no futures reserve, UDFA tracking, or year 2/3 breakout modeling with uncertainty.
- Scouting uncertainty: **Implemented and genuinely good.** The confidence-band, GM-trait-modulated scouting model is strong.
- News/narrative: **Thin.** Transaction and injury news only; no event template library.

### 5.2 vs. Pocket GM 3

**Where repo leads Pocket GM:**
- Scouting fog-of-war is deeper.
- Playbook/scheme system is absent in Pocket GM; this repo has 30 schemes.
- Physics-based play resolution for user games far exceeds Pocket GM.
- Staff system is more elaborate.

**Where Pocket GM leads:**
- Ships as a complete, stable, multi-season-functional product.
- CPU teams have visible identities across seasons.
- No ambiguity about what is implemented vs. scaffolded.

### 5.3 vs. Madden Franchise (meta-systems only)

**What Madden has that this repo lacks:**
- Superstar X-Factor / Ability system with confirmed mechanical in-game effects.
- Weekly storylines, player goals, motivation system generating season narrative.
- Staff skill tree: coordinators have skill points unlocking assignable perks.
- Trade block and player demands: AI teams actively signal needs.
- Owner goals with milestone consequences.
- Coaching carousel: coaching changes ripple league-wide at season end.
- Award ceremonies and draft broadcast presentation.

---

## 6. Missing Features That Most Hurt Competitiveness

Ranked by impact on commercial/design viability:

### 1. CPU vs. CPU game simulation depth *(Critical)*
- **Why it matters:** Every CPU game affects standings, stat leaderboards, award races, and AI team rosters. With the current Gaussian model, teams don't have identities, stats are approximated, and multi-season franchise play breaks immersion quickly.
- **Evidence:** `leagueSim.ts:181-227` `simulateAIGame()` — `score = Math.max(6, Math.round(24 + spread + gaussian(rand) * 8))`
- **Fix:** Replace with a per-drive sim using scheme, roster composition, and gameplan tendencies.
- **Risk if deferred:** Kills long-term franchise credibility; awards and leaderboards become meaningless.

### 2. Badge/trait simulation feedback *(High)*
- **Why it matters:** `badges/engine.ts` shows no confirmed path from badge holding to any simulation modifier. If badges don't change how players perform, the entire trait layer is cosmetic.
- **Evidence:** `state.playerBadges` is stored in GameState but no import of it exists in `gameSim.ts`.
- **Fix:** Connect badge IDs to multipliers in `gameSim.ts` via the existing `perkWiring.ts` pattern.
- **Risk if deferred:** Players have no reason to care about badge accumulation.

### 3. Commissioner / sandbox tools *(High)*
- **Why it matters:** Without player editing, team editing, and league rule adjustment, replayability is severely limited and recovery from broken saves is impossible.
- **Fix:** Mutation layer over `leagueDb.ts`; save integrity system already exists.
- **Risk if deferred:** Blocks enthusiast community; limits replay value.

### 4. Player demands / trade block system *(High)*
- **Why it matters:** Without AI players signaling unhappiness or AI teams advertising available players, the franchise feels static.
- **Fix:** Wire morale outputs to trade request probability; AI team needs analysis to populate trade block.
- **Risk if deferred:** Trade market feels one-sided; no emergent narrative pressure.

### 5. Morale/chemistry downstream effects *(High)*
- **Why it matters:** `morale.ts` hardcodes `strategyModeFit: 55`, `roleExpectation: 'ROTATIONAL'` for all players. Output isn't confirmed to feed into `gameSim.ts`.
- **Evidence:** `morale.ts:26-28` — hardcoded constants for all players.
- **Fix:** Wire actual depth chart role and contract year status into inputs; connect output to sim as small performance multiplier.
- **Risk if deferred:** Roster composition chemistry decisions have no consequence.

### 6. Owner/media pressure and job security *(High)*
- **Why it matters:** Without owner expectations, coaching hot seats, or performance consequences, the franchise sim loses its most important long-term tension loop. You can go 0-17 indefinitely.
- **Fix:** Define owner expectations per season; compute hot-seat score; trigger firing/extension events at season rollover.
- **Risk if deferred:** No stakes in long-term management.

### 7. Statistical realism / season stat normalization *(Medium)*
- **Why it matters:** `computeLeagueStatLeaders()` allocates 65% of team passing yards to QB1 and 25% to QB2 every game. Season stat totals are mathematically regular, not organically varied.
- **Evidence:** `leagueSim.ts:251-252` — `Math.round(passingYards * 0.65)` / `Math.round(passingYards * 0.25)`.
- **Fix:** Inject per-player variance; tie to CPU game model improvement.

### 8. UDFA / practice squad / waiver wire mechanics *(Medium)*
- **Why it matters:** The PS status field exists but rules around UDFA signings post-draft, waiver priority, and PS-to-53 activations are not evidenced.
- **Risk if deferred:** Roster management feels shallow for serious football sim players.

### 9. Multi-save / franchise management *(Medium)*
- **Why it matters:** Browser localStorage limits the product: single save slots, browser-specific data, no cross-device access. Players won't invest in long franchises without confidence.
- **Risk if deferred:** Data loss is permanent; kills franchise investment.

### 10. Coaching carousel / off-season narrative *(Medium)*
- **Why it matters:** Coaching staff moving between teams, rival hires, firings surfaced as league-wide news is a core franchise sim pleasure. Currently functional but not narratively surfaced.

### 11. Award ceremony / draft presentation layer *(Low-Medium)*
- **Why it matters:** Key milestone moments feel anticlimactic without any ceremony. Awards are computed but never revealed. Draft picks happen without broadcast feel.

### 12. Difficulty and sim tuning controls *(Low-Medium)*
- **Why it matters:** `calibrationPack.v1.json` and `SIM_SYSTEMS_CONFIG` exist but no user-facing difficulty sliders exist. Locks out both casual players and veterans.

### 13. Historical records / franchise recordbooks *(Medium)*
- **Why it matters:** After season 3, a franchise sim lives or dies on milestone chase moments. All-time leaderboards and franchise records are absent or unclear.

### 14. League rule customization and schedule format *(Low)*
- **Why it matters:** Fixed 32-team NFL structure with no customization limits replayability.
- **Risk:** Blocks enthusiast modding community.

---

## 7. What Is Superficial vs. Deep

### Deep (evidence supports genuine mechanical depth)

- **Play-by-play simulation engine.** The chain from `gameSim.ts` through `contactResolver`, `passRushResolver`, `qbBallistics`, `catchPointResolver`, `kickResolver`, `fumbleResolver`, and `pileResolver` is a real physics-proxy model. Weather affects accuracy and kick range. Fatigue modulates performance. Unicorn modifiers are applied per-play. Defensive AI selects calls by situation bucket. This is not a lookup table — it's a layered resolver chain.
- **Scouting fog-of-war.** `scouting/core.ts` applies Gaussian noise to initial estimates with sigma modulated by GM traits. Clarity tracks improve separately. Diminishing returns on clarity accumulation. Budget system per scouting window. Genuinely designed.
- **Snap-based progression.** Formula in `snapProgression.ts` with snap share, efficiency score, team success, age regression threshold, dev trait multiplier, and a documented "0.52 neutral point" that calibrates to NFL year-over-year distributions.
- **CPU offseason AI.** `cpuOffseasonAI.ts` has rebuild-stage awareness, age projection curves, positional need weighting, cap budget constraints, and dev trait multipliers.
- **Trade valuation.** Age decay, cap hit penalty, dead cap penalty, dev trait bonuses, rookie contract premium, team-stage adjustments, and pick-position-within-round modifiers. Competent.
- **Contract and cap math.** Dead cap acceleration, restructure eligibility, franchise tag, signing bonus prorating — present and tested.

### Superficial (looks present, mechanically thin)

- **Badge system.** 12 badges defined as stat thresholds, awarded post-season, generate news items. No path from `state.playerBadges` into any sim computation. A badge is a cosmetic label.
- **Morale.** `morale.ts` calls `computeMorale()` with hardcoded inputs. The output `playerMorale` map is stored in GameState but not confirmed to modulate any simulation path.
- **CPU team game identity.** Each CPU team has playbooks, schemes, a gameplan builder, staff, and morale — but none of these feed into `simulateAIGame()`. A team running Air Raid with a 90 OVR QB plays identically in the CPU sim to a Power Run team with a 90 OVR QB.
- **League stat leaders.** `computeLeagueStatLeaders()` allocates fixed percentages of Gaussian-derived team totals. Season leaderboards are mathematical artifacts, not simulated individual performances.
- **Awards.** Computed from the approximated stat leaders above. An MVP based on allocated percentages of Gaussian team yards is not a meaningful franchise achievement.
- **Chemistry.** Module exists. Confirmed downstream effects are absent.
- **Staff perks.** Some perks wired into `gameSim.ts` for user games. CPU games don't use the full sim, so staff perks only affect the user's game, not the league.
- **News system.** Transaction log with headlines. No narrative templates for rivalries, streaks, milestone chases, coach feuds, or contract holdouts.

---

## 8. Simulation Credibility Assessment

**For the user's team:** *Possibly credible.* The play-by-play engine, progression system, and offseason loop have the bones of a credible franchise arc. If statistical feedback from individual user games feeds correctly into progression inputs and the contract system holds up, a 10-season career could feel meaningful.

**For the league as a whole:** *No, not currently.* CPU teams advance on Gaussian noise. After 5 seasons, CPU teams will have artificially similar stat distributions. Dynasties and rebuilds won't visibly emerge from roster construction.

**Where users would likely discover exploits:**
- **Trade farming.** `calculateTradeValue()` has an age floor of 0.55 (`Math.max(0.55, ageMultiplier)`). An aging star with high OVR retains 55% of base trade value at age 40. CPU teams using this formula can be exploited for picks.
- **Low-OVR CPU games.** Since CPU team strength is simply top-22 OVR average, cutting 22 average players paradoxically lowers team strength in the sim model while maintaining quality for user games.
- **Morale farming.** Since morale has no confirmed sim effect, there is no cost to ignoring it. Any morale management mechanic becomes pointless.
- **Scouting budget carryover.** `computeBudget()` carries 50% of prior window's remaining budget. A user who withholds spending banks carryover credit with no downside.

---

## 9. Repo-Specific Evidence Log

| File / Module | Audit Significance |
|---|---|
| `src/engine/leagueSim.ts:181-227` | `simulateAIGame()` — the critical flaw. CPU games use Gaussian score model, not the play-by-play engine. Team identity is lost here. |
| `src/engine/leagueSim.ts:402-448` | `simulateLeagueWeek()` — older function that *does* call `simulateFullGame()`. Appears superseded by `simulateWeek()` in primary paths. Two competing functions; one shallow. |
| `src/engine/gameSim.ts:1-54` | Full play-by-play engine with 9 physics resolver imports, defensive AI, fatigue, unicorns, perks, weather. Evidence of genuine depth for user game. |
| `src/engine/badges/engine.ts` | 12 badges, awarded post-season as stat-threshold labels. No connection from `state.playerBadges` back to any sim modifier. |
| `src/engine/morale.ts:26-28` | Hardcoded `roleExpectation: 'ROTATIONAL'`, `strategyModeFit: 55`, `playingTimeSatisfaction: 0` for all players. |
| `src/systems/tradeValuation.ts:88` | Age floor at `Math.max(0.55, ageMultiplier)` — aging stars retain 55% of trade value. Potential farming exploit. |
| `src/systems/snapProgression.ts` | Well-documented progression formula with empirical NFL calibration. One of the strongest individual systems. |
| `src/engine/scouting/core.ts` | True fog-of-war with Gaussian noise, GM-trait modulation, diminishing returns. Competitive with best-in-class scouting systems. |
| `src/engine/leagueSim.ts:251-252` | `Math.round(passingYards * 0.65)` — stat leaders allocated as fixed percentages. Not meaningful individual performance simulation. |
| `src/context/boot/migrateSave.ts` | Versioned migration chain. Evidence of production-grade save integrity discipline. |
| `src/engine/determinism/seedDerivation.ts` | Hierarchical seed derivation (save → career → weekly → play). Best-in-class determinism for this product type. |
| `src/config/simSystems.ts` | `SIM_SYSTEMS_CONFIG` — externalized calibration. Excellent data-driven design; user-facing knobs just need UI. |

---

## 10. Prioritized Roadmap

### Phase 1 — Must-fix for a credible core loop

| ID | Work Item | Complexity | User Value | Dependencies |
|---|---|---|---|---|
| P1-A | CPU game sim depth upgrade: replace Gaussian model with per-drive sim using scheme, roster composition, and gameplan tendencies | L | Critical — league feels alive; stats are real | `gameSim.ts` already exists; needs fast-forward mode |
| P1-B | Badge → simulation feedback wiring: connect `state.playerBadges` to multipliers in `gameSim.ts` | S | High — badge accumulation becomes meaningful | `perkWiring.ts` pattern exists |
| P1-C | Morale real downstream effects: fix hardcoded inputs; wire output to sim as small performance multiplier | M | High — roster chemistry decisions matter | `depthChart.ts`, `moraleEngine.ts`, `gameSim.ts` |
| P1-D | Multi-save slot + save export/import | M | High — retention; players won't invest in long franchises without data safety | `saveManager.ts`, `context/persistence/` |
| P1-E | Statistical realism: inject per-player variance into CPU stat allocation | S | Medium — leaderboard races feel real | Tied to P1-A |

### Phase 2 — Compete with Pocket GM 3 / baseline Madden Franchise

| ID | Work Item | Complexity | Dependencies |
|---|---|---|---|
| P2-A | Owner goals and job pressure system | M | Standings, season rollover (exists) |
| P2-B | Player demand / trade block system | M | Morale (P1-C), CPU offseason AI (exists) |
| P2-C | UDFA and practice squad rules | M | Draft flow, transactions ledger (both exist) |
| P2-D | Coaching carousel narrative | S | Staff hiring (exists), news system (exists) |
| P2-E | Difficulty / sim tuning UI | S | `simSystems.ts` config (exists) |
| P2-F | Award ceremony and draft broadcast presentation | S | Awards engine (exists), draft system (exists) |

### Phase 3 — Approach OOTP-like depth

| ID | Work Item | Complexity | Dependencies |
|---|---|---|---|
| P3-A | Commissioner / sandbox mode | L | `leagueDb.ts` mutation layer, save integrity |
| P3-B | Historical records and franchise recordbooks | M | Season rollover stats, `leagueHistory/` |
| P3-C | League rule customization | L | Schedule, playoffs, standings |
| P3-D | Deep news / narrative engine (hundreds of event templates) | M | News system infrastructure (exists) |
| P3-E | Badge catalog expansion to CLAUDE.md spec with confirmed sim modifiers | M | P1-B complete |
| P3-F | Development pipeline depth (UDFA futures, breakout trajectories, late bloomers) | M | Progression system, P2-C |

---

## 11. Final Scoring

| Category | Score | Reasoning |
|---|---|---|
| **Franchise Depth** | 5/10 | Phase loop exists; all major steps implemented. CPU world sim is shallow, morale/badges don't feed back, no owner pressure, no commissioner tools. |
| **Roster / Cap Management** | 7/10 | Genuinely strong: dead cap, tags, restructures, extensions, cap ledger, IR/PS. Advanced structures less confirmed at depth. |
| **Draft / Scouting** | 8/10 | Fog-of-war scouting is a standout system. Combine, interviews, workouts, confidence bands, GM trait modulation. Best area of the game. |
| **Player Development** | 6/10 | Snap-based progression formula is well-designed. Aging regression exists. But badges don't feed back; morale doesn't feed back; variance in development paths is limited. |
| **AI Team-Building** | 5/10 | `cpuOffseasonAI.ts` has real logic. But CPU games don't use team construction; schemes don't affect CPU outcomes; AI teams can't proactively put players on trade block. |
| **Sim Realism** | 4/10 | User game is sophisticated. CPU game is Gaussian noise. League-wide realism is a 4 despite the user-game quality warranting a 7 in isolation. |
| **Immersion / Presentation** | 4/10 | News system is thin. No owner pressure. No coaching carousel narrative. No award ceremonies. No draft broadcast. Functional but not immersive. |
| **Statistical / History Depth** | 3/10 | Stat leaders are mathematical allocation artifacts. Career records unclear. Franchise recordbook absent. All-time leaderboards not evidenced. |
| **Customization / Commissioner Tools** | 1/10 | Absent. No player editing, no league customization, no difficulty sliders exposed to users. |
| **UX / Operability** | 6/10 | Mobile-first React with dense information design. 152 pages covering all game phases. Secondary screens less polished. |
| **Replayability** | 4/10 | Single localStorage save, no custom leagues, no difficulty tuning, CPU league feeling uniform after 2-3 seasons. Scouting and draft variance help. |
| **Technical Readiness** | 7/10 | Strong: deterministic architecture, versioned migrations, 153 tests, externalized config, clean engine/UI separation. localStorage-only persistence is the primary infrastructure risk. |

**Overall Weighted Score: 5.0 / 10**

*(Weights: Franchise Depth 12%, Roster/Cap 8%, Draft/Scouting 10%, Player Dev 8%, AI Team-Building 10%, Sim Realism 15%, Immersion 10%, Stats/History 8%, Customization 7%, UX 6%, Replayability 4%, Technical 2%)*

---

## 12. Blunt Conclusion

**Against OOTP:** The gap is structural, not incremental. OOTP derives its value from a living league where every team's decisions and every player's performance ripple through a statistically coherent world across decades. This repo's CPU game model produces scores from Gaussian noise — it does not simulate teams, it approximates outcomes. Until every game in this league is resolved with genuine team identity expression, historical recordbooks are populated with individual per-game performance, and commissioner tools exist for universe customization, this product is not in OOTP's competitive tier.

**Against Pocket GM 3:** This repo is a more ambitious design — and that ambition is both its strength and its current weakness. Pocket GM ships as a complete, stable, multi-season-functional product with no pretenses beyond its scope. This repo has greater scouting depth, a richer physics engine for the user game, and a more sophisticated playbook system — but it has not shipped a multi-season loop that is as stable, as AI-competitive, or as replayable. The user game here is better; the franchise world around it is currently worse.

**Against Madden Franchise:** Madden's franchise immersion comes from weekly narrative texture — player goals, storylines, owner pressure, coaching skill trees, draft presentation moments, and award ceremonies that make each season feel distinct. This repo has none of that narrative layer. It has better contract math and scouting uncertainty than Madden. It has worse world-building. The badge system and morale system, which are the natural candidates to generate narrative texture, are currently either cosmetic (badges) or functionally disconnected (morale).

**What the repo is:** A technically ambitious, architecturally disciplined foundation with a genuine standout feature in its user-game physics engine and scouting system. It is not yet a franchise sim — it is a tactical single-season game with franchise scaffolding.

**The path to competitive viability:**
1. Fix the CPU game model first — everything else is built on a broken foundation if the simulated world is Gaussian noise.
2. Wire the existing systems (morale, badges, staff perks) to each other and to the simulation.
3. Build the narrative and historical layers that make multi-season play worth sustaining.
4. Add commissioner tools and difficulty controls to unlock the enthusiast market.

The most valuable structural asset is the determinism architecture combined with the scouting fog-of-war. These are rare and defensible features in the mobile sports sim space. They are worth building on. The product needs Phase 1 work to become credible as a franchise sim, not just a sophisticated single-season experience.
