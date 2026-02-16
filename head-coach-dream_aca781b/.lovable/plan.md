

# Football Head Coach Career Sim — MVP Plan

## Overview
A dark-themed, card-based football head coach career simulator where you create a coach, interview with teams, accept an offer, hire coordinators, and manage your franchise through a home hub with roster, draft/scouting, and playcalling screens.

---

## Screen 1: Create Coach
- Form with fields: Name, Age, Hometown
- Dark card-based layout with rounded inputs
- "Continue" button advances to Background selection

## Screen 2: Choose Background
- Pick from coaching background options (e.g., offensive guru, defensive mastermind, special teams specialist)
- Each background shown as a selectable card with description
- Selection sets personality baseline and reputation modifiers

## Screen 3: Interviews
- Three interview tiles: **Milwaukee Northshore**, **Atlanta Apex**, **Birmingham Vulcans** (from leagueDB team IDs)
- Each tile shows team name, region, and a "Done" badge when completed
- Clicking a tile opens an interview screen with questions pulled from `hc_interview_press_banks.json`
- Each interview presents 3-5 questions with multiple-choice answers (A/B/C/D)
- Answers accumulate axis scores (ALIGN, AUTO, ADAPT, etc.) stored in save state
- After all 3 interviews are completed, auto-advance to Offers

## Screen 4: Offers
- At least 1 guaranteed offer generated based on interview performance
- Each offer card shows: team name, contract years, salary
- Player selects one offer to accept → triggers `ACCEPT_OFFER` and transitions to Coordinator Hiring

## Screen 5: Coordinator Hiring
- Three roles to fill: **OC**, **DC**, **STC**
- Free agent pool sourced from `leagueDB.json` Personnel table (filtered by `status: FREE_AGENT` or no `teamId`)
- Role normalization: `OFF_COORDINATOR` → OC, `DEF_COORDINATOR` → DC, `ST_COORDINATOR` → STC
- Each candidate shown as a card with name, scheme, reputation
- Select one per role; all three must be hired before advancing to Hub

## Screen 6: Home Hub
- Stacked card layout with team overview (record, cap space, overall rating)
- Scrolling news feed below with generated story items
- Navigation to: Roster, Draft/Scouting, Gameplan/Playcall
- Gating enforced: redirects back if coordinators not hired or offer not accepted

## Screen 7: Roster
- Tabbed view by position group (Offense / Defense / Special Teams)
- Player rows showing: name, position, overall, age, contract status
- Data from `leagueDB.json` Players table filtered by accepted team
- Styled with dark cards and pill-style position tags

## Screen 8: Draft / Scouting (Prototype)
- List + detail panel layout
- Left: scrollable list of draft prospects (generated or from draft order data)
- Right: detail panel with player attributes, college, potential
- Mobile-friendly: list view collapses, detail opens as overlay
- Basic scouting: reveal attributes on "scout" action

## Screen 9: Gameplan / Playcall (Prototype)
- Scoreboard bar at top: score, quarter, down & distance, field position
- Play tiles grid: Run, Short Pass, Deep Pass, Play Action
- Semi-random play resolver:
  - Yards = RNG biased by team overall rating vs opponent
  - Updates down/distance/field position
  - Touchdown when crossing goal line (ball on ≥ 100)
  - Turnover on downs after 4th down failure
- Uses the `RESOLVE_PLAY` / `START_GAME` reducer logic already defined

## State Management
- Single `GameState` object persisted to localStorage
- Reducer pattern from uploaded `reducer.ts` adapted for the app
- Phase-based gating: `PRECAREER` → `INTERVIEWS` → `COORD_HIRING` → `HUB`
- React context provides dispatch + state to all screens

## Data Layer
- `leagueDB.json` copied into `src/data/` as the single source of truth
- `leagueDb.ts` accessor module provides typed queries (teams, players, personnel, contracts)
- Interview questions from `hc_interview_press_banks.json`
- Team mapping utilities from `teamMap.ts` and `ugfTeams` data

## Visual Design
- Dark theme (dark background, light text)
- Rounded cards with subtle borders
- Pill-shaped tags for positions, statuses
- Consistent spacing and section headers
- Responsive layout for mobile and desktop

