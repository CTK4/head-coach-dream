# League Systems Audit — Minimum Viable Bar Assessment

Scope: TypeScript/React football coaching sim audited against a minimum-viable target of matching/exceeding the core loop depth of Football-GM and Pocket GM.

## SYSTEM 1 — Full League Simulation

### Findings
`leagueSim` iterates all matchups in the selected week schedule (`for (const m of ws.matchups)`), not just the user game, and simulates non-user games with `simulateFullGame`, so weekly simulation is league-wide as long as the schedule contains every team. It updates a `standings` map keyed by team ID and persists cumulative `results` as `league.results` each time. It does not compute league-wide stat leaders (passing/rushing/sacks leaderboards) in `leagueSim`; only game scores and W-L/PF/PA are tracked there. In regular-season progression, `simulateLeagueWeek` is called from reducer paths handling both played games (`RESOLVE_PLAY`) and instant-sim (`ADVANCE_WEEK`) in `GameContext`. Non-user game outcomes are retained in `GameState.league.results` rather than discarded. The dedicated `Standings.tsx` hub page is currently a placeholder and does not read live state.

### Question-by-question assessment
1. **Does leagueSim simulate all 32 teams every week, or only the user's team?**  
   **Answer:** It simulates all matchups in the week schedule, including non-user matchups (`simulateFullGame` branch). This is full-week, schedule-driven behavior rather than user-only.  
   **Status:** **COMPLETE**
2. **Does it produce a standings object after each week for all teams?**  
   **Answer:** Yes; it clones `league.standings`, applies every matchup result via `applyResult`, and returns updated standings.  
   **Status:** **COMPLETE**
3. **Does it produce stat leaders across the full league each week?**  
   **Answer:** No league-wide leader aggregation exists in `leagueSim`; only scores and standings deltas are tracked.  
   **Status:** **MISSING**
4. **Is leagueSim called from regular-season advancement logic in GameContext or RegularSeason.tsx? Show exact call site.**  
   **Answer:** Yes, from `GameContext` reducer at:
   - `RESOLVE_PLAY` → `const league = simulateLeagueWeek({ ... })`
   - `ADVANCE_WEEK` → `const league = simulateLeagueWeek({ ... })`  
   **Status:** **COMPLETE**
5. **Are non-user results stored in GameState or discarded?**  
   **Answer:** Stored in `league.results` (`results: [...params.league.results, ...newResults]`).  
   **Status:** **COMPLETE**
6. **Does Standings.tsx read live standings object or placeholder/hardcoded data?**  
   **Answer:** Placeholder-only static text.  
   **Status:** **MISSING**

### Blockers
- No league-wide stat leaders pipeline from simulated games.
- Standings hub page is not wired to live league standings.
- No visible division/conference table on the dedicated standings route.

**Status: NEEDS WORK**

---

## SYSTEM 2 — Player Aging, Decline, and Retirement

### Findings
The codebase includes age-aware development heuristics (`computeSeasonDevelopmentDelta`) and visual risk/arrow indicators (`computeDevArrow`, `computeDevRisk`), but these do not directly mutate veteran player base ratings in a league-wide aging pass. The `applySeasonDevelopment` flow records deltas into `playerDevXpById` and memory logs, and preseason dev mutates only `state.rookies` OVR/DEV in one narrow path. There is no explicit retirement engine removing aging players based on age/performance thresholds. Season rollover expires user-side contract overrides into free agency but does not represent retirement logic. Draft/prospect generation exists (including static class consumption and generators), but replacement is not coupled to retirements because retirements are absent.

### Question-by-question assessment
1. **Age-based decline function for veterans? Inputs/outputs?**  
   **Answer:** There are age-weighted calculators (`computeSeasonDevelopmentDelta`, `computeDevArrow`, `computeDevRisk`), but no dedicated veteran decline applier that directly degrades existing league player ratings by age. `computeSeasonDevelopmentDelta(player, coach)` returns a bounded numeric delta; in practice these deltas are stored as XP, not applied to most base players.  
   **Status:** **PARTIAL**
2. **Retirement trigger logic and runtime location?**  
   **Answer:** No retirement trigger found that removes players from the league at age/performance thresholds.  
   **Status:** **MISSING**
3. **Does draft class generation replace retirees and maintain league depth?**  
   **Answer:** New prospects/rookies are introduced through draft systems (`getDraftClass` / rookie creation), but this is not linked to retirements; therefore replacement is not retirement-compensating in a complete lifecycle sense.  
   **Status:** **PARTIAL**
4. **After 3 simulated seasons, does roster materially change from aging?**  
   **Answer:** Some change occurs via transactions/free agency/draft and rookie dev, but broad veteran aging/decline is not systematically applied; many existing players can remain effectively static in base ratings.  
   **Status:** **PARTIAL**

### Blockers
- No retirement lifecycle.
- No global player age progression + decline pass for existing league players.
- Development deltas are mostly decoupled from base-player rating mutation.

**Status: NEEDS WORK**

---

## SYSTEM 3 — Multi-Season Stats Persistence

### Findings
`finalizeStats` sanitizes and finalizes a single `state.game.boxScore`, but the pipeline does not persist per-game box scores to a historical game log in `GameState`. No player career stats object (career yards/TDs/etc.) appears in core state types; season summaries are coach/team-level snapshots instead. There is meaningful coach/team season history (`seasonHistory`) capturing wins/losses and playoff outcomes by year, enabling reconstruction of coaching record at season granularity. The standalone `engine/gameManager.ts` calls `finalizeStats`, but it is not wired into the active reducer flow. A league historical records subsystem (all-time leaders, season records, milestones beyond perk milestones) is not present.

### Question-by-question assessment
1. **Are player stats accumulated across seasons or reset each season?**  
   **Answer:** No persistent per-player seasonal/career accumulation system is present in visible state; only current game box score is held.  
   **Status:** **MISSING**
2. **Career stats object on player type, or only current season stats?**  
   **Answer:** No player career stats object found in `GameState`/types.  
   **Status:** **MISSING**
3. **Can coach career record be reconstructed after multiple seasons?**  
   **Answer:** Yes at season-summary level via `seasonHistory` entries (`wins`, `losses`, playoffResult, etc.).  
   **Status:** **COMPLETE**
4. **Does finalizeStats produce complete box score and store it?**  
   **Answer:** It finalizes and stores to `state.game.boxScore` for the current game object only; no durable historical storage is evident.  
   **Status:** **PARTIAL**
5. **Any historical records system (all-time leaders, season bests, coach milestones)?**  
   **Answer:** Coach milestone/perk system exists, but no comprehensive league/player historical records system was found.  
   **Status:** **MISSING**

### Blockers
- No persistent player-season and player-career stats ledger.
- No historical game archive for finalized box scores.
- No all-time/team/season records tracking for league history screens.

**Status: NEEDS WORK**

---

## SYSTEM 4 — Standings and League News Screens

### Findings
`Standings.tsx` is currently a static placeholder card and does not render standings from game state. Sorting logic with tiebreakers exists elsewhere (`tiebreaks.ts`), but `Standings.tsx` does not consume it. `LeagueNews.tsx` is wired to live `state.hub.news`, supports category filtering/search/read states, and shows real dynamic entries when reducer actions push news. News generation appears mostly transactional/user-centric (trades, extensions, default seasonal headlines, championship notice), not a comprehensive league simulation feed (non-user signings/injuries/trade wire/game recaps). The standings that are live-rendered today exist in `RegularSeason.tsx` panel and use a simple sort (wins, losses, point diff), not formal tiebreak engine integration. Division/conference breakdowns are absent from the dedicated standings page.

### Question-by-question assessment
1. **What data does Standings.tsx render?**  
   **Answer:** Placeholder text only.  
   **Status:** **MISSING**
2. **Sorted correctly by win% with tiebreakers and `tiebreaks.ts` use?**  
   **Answer:** Not in `Standings.tsx`. A simple sort exists in `RegularSeason.tsx` standings panel; `tiebreaks.ts` not used there.  
   **Status:** **MISSING**
3. **Does LeagueNews.tsx render real events or placeholder/static content?**  
   **Answer:** Renders real entries from `state.hub.news`; feed quality is partial (some real events, limited league breadth).  
   **Status:** **PARTIAL**
4. **How is league news generated? Is there a feed object and what populates it?**  
   **Answer:** Yes, `hub.news` in GameState. Populated by default seeded headlines and reducer-driven `addNews/pushNews` events (e.g., trades/extensions/champion notice).  
   **Status:** **PARTIAL**
5. **Division standings separate from conference/overall, or flat list?**  
   **Answer:** No dedicated standings implementation; live in-season panel is flat list.  
   **Status:** **MISSING**

### Blockers
- Dedicated standings route is non-functional placeholder.
- No division/conference standings views.
- No tiebreak-engine integration in rendered standings tables.
- League news breadth is limited versus expected simulation depth.

**Status: NEEDS WORK**

---

## SYSTEM 5 — Trade System

### Findings
Trade Hub UI is interactive and allows user-triggered trade acceptance from generated offers tied to selected players, with cap checks and deadline lock behavior. However, this flow is primarily deterministic/generated offer shopping, not open-ended package construction against AI rosters from this screen. The sophisticated valuation/evaluation logic in `tradeEngine.ts` (including needs, cap stress, GM mode, and probabilistic acceptance) exists but is not invoked by `TRADE_ACCEPT` in `GameContext`, which directly executes if constraints pass. Deadline logic exists and is enforced via `isTradeAllowed`, deadline status badges, and pending-offer cancellation post-deadline. Overall, this is a partially functional transaction layer with UI polish but limited negotiation depth.

### Question-by-question assessment
1. **Can user propose trade to AI team from UI? Full flow?**  
   **Answer:** User can shop a player, view generated team offers, and press Accept to execute immediately (subject to cap/deadline/tag checks). It is not a full custom bilateral trade package builder in this screen.  
   **Status:** **PARTIAL**
2. **Does AI evaluate offers and counter/accept/reject? Where?**  
   **Answer:** `tradeEngine.ts` contains accept/reject probability logic, but current `TRADE_ACCEPT` path bypasses it and executes directly. No live counter loop from this UI path.  
   **Status:** **MISSING**
3. **Trade value model richness (ratings/age/contract/picks)?**  
   **Answer:** Model includes overall+age adjustments and contextual multipliers; draft picks modeled simply via numeric value proxy. Contract detail depth is limited.  
   **Status:** **PARTIAL**
4. **Trades blocked/modified during career stages/deadline?**  
   **Answer:** Yes, deadline enforcement is implemented; UI locks after deadline and reducer blocks execution.  
   **Status:** **COMPLETE**
5. **What does TradeHub.tsx render? Functional / partial / placeholder?**  
   **Answer:** Functional partial UI (shop flow, incoming list, history, deadline state), not full-featured negotiation sandbox.  
   **Status:** **PARTIAL**

### Blockers
- Trade decision engine not wired into core acceptance flow.
- No robust counter-offer negotiation loop in TradeHub path.
- Limited package composition depth versus genre benchmark.

**Status: NEEDS WORK**

---

## SYSTEM 6 — Scouting Dead Ends

### Findings
The three specified screens (`PrivateWorkouts`, `ScoutingInterviews`, `MedicalBoard`) render clear “Coming soon” stub UI with disabled CTA buttons, but they do display live remaining-slot counters from scouting state. Engine-side reducer cases for `SCOUT_PRIVATE_WORKOUT` and `SCOUT_INTERVIEW` exist and mutate scouting clarity/reveals/history, indicating backend logic is present. The disconnect is that these specific pages do not currently expose interactions to trigger those actions. As a result, player-facing workflow appears dead-end despite backend partial readiness. Routes are accessible via scouting tabs and are not strictly careerStage-gated in router/layout.

### Question-by-question assessment
1. **Per file: real data, locked/stub UI, or blank?**  
   **Answer:** All three are stub/locked UIs with disabled buttons and “Coming soon” copy; not blank.  
   **Status:** **PARTIAL** (per screen)
2. **Is there engine logic backing each feature?**  
   **Answer:** Partial backend exists for private workouts/interviews; dedicated medical-request flow in these pages is not wired from UI despite medical state fields.  
   **Status:** **PARTIAL**
3. **Do these screens affect draft prospect evaluations now?**  
   **Answer:** In principle reducer actions can change scouting profiles/reveals, but these pages do not trigger them, so effective user flow impact is currently absent.  
   **Status:** **MISSING**
4. **Gated by careerStage or always accessible?**  
   **Answer:** Accessible through scouting routes/tabs; no strict stage gate observed for these pages.  
   **Status:** **PARTIAL**

### Blockers
- UI and engine are disconnected for workouts/interviews/medical actions.
- Disabled CTAs create dead-end player experience.
- Medical workflow appears unimplemented from user perspective.

**Status: NEEDS WORK**

---

## SYSTEM 7 — Mobile Viewport Readiness

### Findings
A mobile hook exists (`useIsMobile`) with a 768px breakpoint, but usage appears limited and not consumed in primary shell components (`AppShell`, `BottomNav`, `HubShell`) for adaptive layout switching. Navigation includes a fixed bottom nav that is mobile-friendly in placement, but many complex screens remain dense/desktop-leaning with large fixed structures and limited small-screen adaptations. Viewport meta tag is present and correctly configured. Haptics utility exists and is integrated in places (e.g., LeagueNews interactions), indicating mobile intent. Touch-target consistency is mixed: base button defaults are below 44px (`h-10` = 40px; `sm` = 36px), so minimum target guidance is not consistently met.

### Point-by-point assessment
1. **use-mobile breakpoint + consumption in layout components?**  
   **Answer:** Breakpoint flag exists, but not consumed in `AppShell`/`BottomNav`/`HubShell`.  
   **Status:** **NOT ADDRESSED**
2. **Responsive handling on sample screens (SkillTree, CapProjection, Draft.tsx, RegularSeason.tsx)?**  
   **Answer:**
   - SkillTree: some responsive classes, but still wide fixed node cards/grid, likely cramped on small screens.  
   - CapProjection: mixed responsive usage (grids/drawer/scroll) but still dense data-heavy layout.  
   - Draft: heavy multi-pane/scroll UI with limited explicit mobile tailoring.  
   - RegularSeason: mostly simple stacked cards; relatively mobile-safe.
   **Status:** **NEEDS WORK**
3. **Viewport meta tag in index.html?**  
   **Answer:** Present and correct (`width=device-width, initial-scale=1.0`).  
   **Status:** **READY**
4. **BottomNav thumb-reachable nav on small screens?**  
   **Answer:** Yes, fixed bottom nav provides thumb-zone primary navigation.  
   **Status:** **READY**
5. **Tap targets at least 44px tall in UI component definitions?**  
   **Answer:** Not consistently; default/sm button heights are 40/36px.  
   **Status:** **NEEDS WORK**

### Blockers
- Core mobile breakpoint hook not driving shell-level adaptive behavior.
- Inconsistent minimum tap target sizing.
- Complex feature screens still desktop-biased in interaction density.

**Status: NEEDS WORK**

---

## SYSTEM 8 — New Player Onboarding

### Findings
The onboarding funnel is phase-gated and linear: Create Coach → Choose Background → Interviews → Offers → Coordinator Hiring → Hub (after filling OC/DC/STC roles). There is no explicit Quick Start/Skip in the inspected flow. The first meaningful “sim game” path requires progressing through these phases and then navigating to regular-season progression from hub state progression. Returning players can bypass creation entirely via save restore from `localStorage` in `loadState`. No dedicated first-time tutorial/tooltip framework was identified in hub onboarding handoff.

### Point-by-point assessment
1. **How many screens before first hub? List in order.**  
   **Answer:** 5 screens before hub, then hub as destination:
   1) CreateCoach (`/`)  
   2) ChooseBackground (`/background`)  
   3) Interviews (`/interviews`)  
   4) Offers (`/offers`)  
   5) CoordinatorHiring (`/coordinators`)  
   → then Hub (`/hub`) after all 3 coordinator roles hired.  
   **Status:** **NEEDS WORK**
2. **Quick Start or Skip option?**  
   **Answer:** None observed in these onboarding screens.  
   **Status:** **NOT ADDRESSED**
3. **In-game tutorial/tooltips/contextual help post-hub?**  
   **Answer:** No dedicated tutorial system detected in inspected flow.  
   **Status:** **NOT ADDRESSED**
4. **How long in steps/decisions before first sim game?**  
   **Answer:** Multi-step funnel including: coach profile entry, archetype selection, completing 3 interview sessions (up to 5 questions each), selecting offer, hiring 3 coordinators, then progressing to playable schedule stage before first game sim.  
   **Status:** **NEEDS WORK**
5. **Returning player bypass creation and load existing save?**  
   **Answer:** Yes; `loadState()` restores saved state from `localStorage`, bypassing new-coach creation when data exists.  
   **Status:** **READY**

### Blockers
- Onboarding path is long before first core-loop interaction.
- No explicit skip/quick-start branch.
- No clear first-time in-hub guidance layer.

**Status: NEEDS WORK**

---

## Priority Matrix (Polish Handoff)

| System | Status | Effort to fix | Player Impact | Priority |
|--------|--------|---------------|---------------|----------|
| System 1 — Full League Simulation | NEEDS WORK | Medium | Critical | P1 |
| System 2 — Aging/Decline/Retirement | NEEDS WORK | High | Critical | P1 |
| System 3 — Multi-Season Stats Persistence | NEEDS WORK | High | Critical | P1 |
| System 4 — Standings + League News Screens | NEEDS WORK | Medium | High | P1 |
| System 5 — Trade System | NEEDS WORK | Medium | High | P1 |
| System 6 — Scouting Dead Ends | NEEDS WORK | Medium | High | P2 |
| System 7 — Mobile Viewport Readiness | NEEDS WORK | Medium | Medium | P2 |
| System 8 — New Player Onboarding | NEEDS WORK | Medium | High | P2 |
