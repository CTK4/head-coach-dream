UGF Head Coach Dream — Full Master Feature Outline

0) Core Product Definition

0.1 High-level concept

A mobile-first professional football franchise simulation focused on the user serving as a combined head coach + front office decision-maker, with a dense, information-forward, decision-first interface and a deterministic simulation core.

0.2 Core fantasy

The player should feel like they are:
	•	building a team over many seasons,
	•	managing a living organization,
	•	making difficult football decisions with tradeoffs,
	•	preparing weekly like a real staff,
	•	seeing those decisions reflected in realistic on-field and off-field outcomes.

0.3 Primary pillars
	1.	Deterministic simulation integrity
	2.	Save integrity and corruption resistance
	3.	Roster/cap/contract truth
	4.	Deep scouting and draft evaluation
	5.	Strategic weekly football gameplay
	6.	Long-term franchise building
	7.	Dense but intuitive mobile-first UI
	8.	Feature parity roadmap toward best-in-class franchise sims

⸻

1) Core User Jobs

1.1 Team-building
	•	evaluate players,
	•	shape roster identity,
	•	manage contracts and cap,
	•	build for contention, retooling, or rebuilding.

1.2 Scouting and acquisition
	•	scout prospects and free agents,
	•	compare players quickly,
	•	tier and shortlist targets,
	•	execute realistic draft, FA, and trade decisions.

1.3 Weekly coaching
	•	prepare gameplans,
	•	adjust to opponent tendencies,
	•	choose schemes and playbooks,
	•	manage injuries, morale, and development.

1.4 Long-term organization management
	•	hire staff,
	•	manage hot seat/firing pressure,
	•	navigate owner/media expectations,
	•	sustain competitive windows over multiple seasons.

1.5 Trust and explainability
	•	understand how scores, grades, values, and risks are calculated,
	•	trust that the same save + same actions leads to the same outcomes,
	•	recover safely from bad/corrupt states.

⸻

2) Foundational Simulation Principles

2.1 Determinism
	•	no non-seeded randomness in sim-critical paths,
	•	deterministic seed derivation for season, game, drive, play, player-week, scouting events, and weather,
	•	stable ordering rules for every ledger/event system.

2.2 Single source of truth
	•	one canonical roster truth,
	•	one canonical contract/cap truth,
	•	one canonical schedule/results truth,
	•	one canonical player metric/telemetry truth.

2.3 Explainability

Every derived output should be explainable:
	•	badges,
	•	draft grades,
	•	trade acceptance,
	•	free agency market values,
	•	scouting confidence,
	•	athletic composites,
	•	injury risk,
	•	scheme fit.

2.4 State integrity
	•	strict validation on save/load,
	•	versioned migrations,
	•	backups and restore points,
	•	quarantine/recovery flow for corrupted or divergent saves.

⸻

3) Full Franchise Lifecycle

3.1 New save creation
	•	coaching background selection,
	•	onboarding flow,
	•	interview and offer process,
	•	team selection,
	•	initial staff setup,
	•	new-game seed creation,
	•	initial roster/schedule/cap initialization.

3.2 Offseason loop
	•	season recap,
	•	owner evaluation,
	•	staff evaluation and churn,
	•	retirements,
	•	cap cleanup,
	•	cuts,
	•	franchise tag window,
	•	re-sign period,
	•	free agency,
	•	trades,
	•	combine/pro day,
	•	draft prep,
	•	draft,
	•	post-draft FA,
	•	rookie assignment,
	•	training camp,
	•	preseason,
	•	cutdowns,
	•	roster finalization.

3.3 Regular season loop
	•	weekly hub,
	•	opponent scouting,
	•	injury management,
	•	roster/depth chart changes,
	•	gameplan creation,
	•	game simulation or interactive playcalling,
	•	postgame recap,
	•	weekly updates to stats, morale, injuries, standings, news, awards race.

3.4 Playoffs
	•	bracket generation,
	•	playoff gameprep,
	•	round-by-round progression,
	•	title game,
	•	champion and playoff awards.

3.5 Season rollover
	•	final stats/history persistence,
	•	awards,
	•	HOF checks,
	•	schedule regeneration,
	•	offseason entry.

⸻

4) Information Architecture

4.1 Top-level navigation
	•	Hub
	•	Prospects
	•	Draft
	•	Roster
	•	Contracts
	•	Strategy
	•	League
	•	Offseason
	•	Staff
	•	Settings

4.2 Global utilities
	•	global search,
	•	shortlist/watchlist,
	•	pinned needs panel,
	•	notes system,
	•	compare tray,
	•	“as of” game-time header,
	•	integrity status indicators,
	•	model cards / explainability drawers.

⸻

5) Hub and Weekly Command Center

5.1 Purpose

A single control room that tells the user:
	•	what phase they are in,
	•	what the most important next actions are,
	•	what alerts require attention,
	•	what the current strategic situation is.

5.2 Core widgets
	•	current phase + step progress,
	•	next required actions,
	•	upcoming opponent,
	•	key injuries,
	•	roster/cap alerts,
	•	staff/hot-seat signals,
	•	shortlist updates,
	•	recent movers on big board,
	•	latest news,
	•	standings snapshot,
	•	weekly performance summary.

5.3 Guided workflow behavior
	•	“Step X of Y” logic,
	•	explicit completion conditions,
	•	blocked actions show why they are blocked,
	•	one-tap navigation to relevant subsystem.

⸻

6) Player Entity Model

6.1 Canonical player object domains
	•	identity,
	•	demographics,
	•	physical profile,
	•	position/archetype,
	•	true ratings,
	•	known ratings,
	•	traits/badges,
	•	contract,
	•	roster status,
	•	injury history,
	•	progression history,
	•	morale/chemistry/personality,
	•	stats,
	•	awards/history,
	•	transaction history.

6.2 Position groups
	•	QB
	•	RB
	•	WR
	•	TE
	•	OT
	•	IOL
	•	EDGE
	•	IDL
	•	LB
	•	CB
	•	S
	•	K
	•	P

6.3 Hidden vs known information
	•	true ratings hidden,
	•	scouting confidence bands,
	•	revealed and unrevealed traits,
	•	medical/character uncertainty,
	•	development uncertainty,
	•	projection volatility.

⸻

7) Unicorn Player Model Pack

7.1 Purpose

A library of rare, high-impact archetypes that materially change:
	•	player behavior,
	•	AI deployment,
	•	opponent adjustments,
	•	gameplanning.

7.2 Pack contents

For each archetype:
	•	archetype ID,
	•	label,
	•	position,
	•	signature rating profile,
	•	trait tags,
	•	gameplay modifiers,
	•	progression/aging curve,
	•	risk profile,
	•	AI usage rules.

7.3 Global unicorn traits
	•	UNICORN_FRAME
	•	CONTACT_BALANCE_ELITE
	•	ARM_TALENT_ELITE
	•	RUSHER_GRAVITY
	•	COVERAGE_ERASER
	•	VIOLENCE_FINISHER
	•	RARE_BURST
	•	ANTI_FRAGILE
	•	POSITIONLESS
	•	GAMEBREAKERS

7.4 Unicorn archetype families
	•	QB unicorns
	•	RB unicorns
	•	FB unicorns
	•	WR unicorns
	•	TE unicorns
	•	OL unicorns
	•	DL/EDGE/LB/DB unicorns
	•	Specialist unicorns

7.5 Rarity rules
	•	0–2 unicorns per class,
	•	most classes have zero,
	•	unicorns should affect opponent logic, not just OVR.

⸻

8) Trait Badge System

8.1 Purpose

Badge layer translates raw metrics and percentiles into readable football identities that:
	•	aid fast evaluation,
	•	shape gameplay modifiers,
	•	enrich scouting and roster construction.

8.2 Badge system architecture

Each badge includes:
	•	badge ID,
	•	display name,
	•	description,
	•	trigger logic,
	•	cohort/sample thresholds,
	•	gameplay effect,
	•	optional UI iconography.

8.3 QB badge families
	•	Accurate split:
	•	Deadeye (Short)
	•	Dimes
	•	Sniper
	•	On the Move
	•	Ice Under Pressure
	•	Arm:
	•	Cannon
	•	Laser
	•	Mobility:
	•	Scrambler
	•	Escape Artist
	•	Pocket Mover
	•	Release:
	•	Quick Release
	•	Compact Motion
	•	Mechanics:
	•	Sound Footwork
	•	Balanced Base
	•	Processor:
	•	Field General
	•	Anticipator
	•	Coverage Reader
	•	Risk Manager
	•	Elastic arm:
	•	Off-Platform
	•	Arm Angles
	•	Additional:
	•	Tough as Nails
	•	Sack Sense
	•	Feather Touch
	•	Closer
	•	Zone Read Threat
	•	Bullet Passer
	•	Touch Passer

8.4 RB badges
	•	Power Back
	•	Contact Balance
	•	Human Joystick
	•	One Cut
	•	Accelerator
	•	Stiff Arm
	•	Receiver
	•	optional:
	•	Home Run Threat
	•	Pass Pro Back

8.5 WR badges
	•	Acrobatic Catcher
	•	Deep Threat
	•	Sure Hands
	•	YAC Specialist
	•	Run Blocker
	•	Route Runner
	•	Contested Catcher
	•	Slot Specialist
	•	optional:
	•	Press Beater
	•	Red Zone Weapon

8.6 TE badges
	•	Acrobatic Catcher
	•	Deep Threat
	•	Sure Hands
	•	YAC Specialist
	•	Run Blocker
	•	Route Runner
	•	Contested Catcher
	•	Slot Specialist / Move TE
	•	optional:
	•	Chip & Release
	•	Mismatch Nightmare

8.7 OL badges
	•	Pancake Artist
	•	Pass Protector
	•	Technician
	•	Field General
	•	Agile Protector
	•	Run Mauler

8.8 DL/EDGE badges
	•	High Motor
	•	Versatile
	•	Run Stuffer
	•	move suite badges:
	•	Club Move
	•	Swim Move
	•	Chop Move
	•	Ghost Move
	•	Stab Move
	•	Shuck Move
	•	Spin Move
	•	Rip Rush
	•	Speed Rip Rush
	•	Bull Rush
	•	Long Arm
	•	Hump Move
	•	Shoulder Dip
	•	EDGE-specific:
	•	Edge Bend

8.9 LB badges
	•	Sure Tackler
	•	Coverage Ace
	•	Run Stuffer
	•	Field General
	•	Sideline to Sideline
	•	Hit Stick

8.10 Safety badges
	•	Ball Hawk
	•	Sure Tackler
	•	Versatile
	•	Centerfielder
	•	Hit Stick
	•	Run Support
	•	Coverage Ace
	•	Field General

8.11 CB badges
	•	Ball Hawk
	•	Shutdown Corner
	•	Press Expert
	•	Mirror Technique
	•	Recovery Speed
	•	Run Support
	•	Sure Tackler
	•	Click and Close
	•	Field General
	•	Nickel Back
	•	Boundary Corner
	•	Inside Out Versatility

⸻

9) Scouting System

9.1 Purpose

Scouting is an information game, not a player-stat-changing system.

9.2 Core pillars
	•	fog of war,
	•	confidence bands,
	•	GM-trait-driven scouting capacity,
	•	prospect and FA scouting,
	•	deterministic reveal logic.

9.3 Scouting actions
	•	board management,
	•	allocations,
	•	interviews,
	•	private workouts,
	•	medical evaluations,
	•	combine/pro day review,
	•	in-season scouting,
	•	free agency scouting.

9.4 Scouting statement library

For each position:
	•	Positive statements (25)
	•	Neutral statements (25)
	•	Negative statements (25)

9.5 Statement system behavior
	•	deterministic seeded selection,
	•	confidence-gated intensity,
	•	projection-linked phrasing,
	•	position-specific terminology.

9.6 Scouting outputs
	•	confidence band,
	•	estimated ratings,
	•	archetype projection,
	•	athletic profile,
	•	medical/character flags,
	•	badge hints,
	•	role/scheme fit,
	•	round projection.

⸻

10) Prospect Evaluation Suite

10.1 Big Board
	•	tier-based rankings,
	•	drag/reorder,
	•	shortlist,
	•	needs overlay,
	•	movers panel,
	•	confidence filters,
	•	scheme fit filters,
	•	risk filters.

10.2 Athletics Tracker
	•	raw tests,
	•	position percentiles,
	•	athletic composite,
	•	compare tray,
	•	metric guide,
	•	missing-data handling.

10.3 Athletic Composite
	•	position-weighted 0–10 score,
	•	explainable breakdown,
	•	missing event handling disclosed.

10.4 Prospect profile
	•	dossier header,
	•	athletics,
	•	scouting statements,
	•	medical/character,
	•	archetype and trait hints,
	•	compare/shortlist/tier actions,
	•	projected range.

10.5 Compare view
	•	up to 3 players,
	•	side-by-side raw + percentile + risk + fit + known intel.

⸻

11) Draft System

11.1 Core features
	•	full 7 rounds,
	•	AI-controlled draft logic,
	•	user pick control,
	•	trade market during draft,
	•	draft history/results export,
	•	grades and explanations.

11.2 Draft AI logic

Must blend:
	•	BPA,
	•	need,
	•	positional value,
	•	roster construction,
	•	archetype preferences,
	•	randomness,
	•	QB premium,
	•	future planning.

11.3 Trade integrity rules
	•	atomic accept,
	•	stale offers invalidated,
	•	cannot trade assets not owned,
	•	ledger is canonical.

11.4 Draft UX elements
	•	active clock,
	•	incoming offers mode,
	•	trade meter,
	•	“why accepted” explanation,
	•	shortlist carryover,
	•	team needs overlay,
	•	pick history,
	•	round recap.

11.5 Draft outputs
	•	picks assigned,
	•	rookies created/assigned,
	•	grades,
	•	transaction log,
	•	recap screen.

⸻

12) Free Agency System

12.1 Core features
	•	FA pool,
	•	market values,
	•	cap validation,
	•	negotiation/counters,
	•	optional AI bidding,
	•	post-draft FA phase.

12.2 Required explainability
	•	why player wants X deal,
	•	market comps,
	•	role/scheme/contender effects,
	•	competing bids.

12.3 Constraints
	•	cap space,
	•	roster needs,
	•	team strategy,
	•	contention window,
	•	role promises,
	•	cash/structure realism if modeled.

⸻

13) Re-sign / Contract Negotiation

13.1 Features
	•	expiring contracts list,
	•	player demands,
	•	risk of reaching market,
	•	franchise tag,
	•	restructure/extension options,
	•	cap projection.

13.2 Contract realism layers
	•	APY in % of cap,
	•	guarantees,
	•	term length,
	•	practical-out year,
	•	signing bonus,
	•	roster bonus,
	•	option bonus,
	•	void years,
	•	incentives,
	•	post–June 1 impacts.

⸻

14) Trade System

14.1 Core features
	•	manual proposals,
	•	AI offers,
	•	player and pick trades,
	•	future pick discounting,
	•	deadline rules,
	•	contention/rebuild logic.

14.2 Acceptance factors
	•	value chart,
	•	need weighting,
	•	positional premium,
	•	age curve,
	•	cap/dead cap,
	•	contention window,
	•	rivalry,
	•	owner pressure,
	•	hot seat pressure.

14.3 Bad-contract dump friction
	•	attach-pick logic,
	•	cost by cap hit and years left.

⸻

15) Roster Management

15.1 Core surfaces
	•	depth chart,
	•	roster list,
	•	player profile,
	•	audit view,
	•	cutdowns,
	•	IR/PS management,
	•	development screen.

15.2 Legality engine
	•	active roster limits,
	•	PS rules,
	•	IR rules,
	•	minimum position requirements,
	•	depth chart validity,
	•	cap legality.

15.3 Quality-of-life
	•	autofill,
	•	reset to default,
	•	role hints,
	•	weak point alerts,
	•	projection by unit.

⸻

16) Staff and Coaching System

16.1 Staff domains
	•	head coach,
	•	coordinators,
	•	assistants,
	•	front-office/staff modifiers if modeled.

16.2 Features
	•	onboarding hiring,
	•	staff market,
	•	acceptance logic,
	•	firing checks,
	•	hot seat,
	•	churn/poaching,
	•	interim logic,
	•	staff perks and negatives.

16.3 Staff effects
	•	scouting capacity,
	•	player development,
	•	morale/chemistry,
	•	scheme access,
	•	gameplan bonuses,
	•	risk modifiers.

⸻

17) Morale, Chemistry, Personality, Narrative

17.1 Player psychology systems
	•	morale,
	•	chemistry,
	•	role satisfaction,
	•	coach trust,
	•	locker-room dynamics,
	•	personality/character.

17.2 Narrative outputs
	•	news items,
	•	owner/media feedback,
	•	trust changes,
	•	trade requests,
	•	satisfaction trends,
	•	leadership effects.

⸻

18) Game Simulation Engine

18.1 Core model
	•	deterministic play resolution,
	•	contextual seeded RNG,
	•	personnel and playcall inputs,
	•	defensive look and pressure logic,
	•	situational modifiers,
	•	fatigue and injuries.

18.2 Domains modeled
	•	passing,
	•	rushing,
	•	pass rush,
	•	coverage,
	•	tackling/YAC,
	•	fumbles,
	•	kicking,
	•	clock,
	•	field position,
	•	injuries.

18.3 Situational football
	•	3rd and short/medium/long,
	•	red zone,
	•	goal-to-go,
	•	two-minute,
	•	late-game clutch,
	•	playoff pressure.

18.4 Sim outputs
	•	play log,
	•	box score,
	•	advanced stats,
	•	injuries,
	•	morale shifts,
	•	standings/results updates.

⸻

19) Playcalling, Playbooks, Strategy

19.1 Features
	•	offensive/defensive playbook catalogs,
	•	gameplan system,
	•	playcalling UI,
	•	tendency controls,
	•	self-scout/opponent-scout.

19.2 Strategic concepts
	•	playbook identity,
	•	scheme fit,
	•	weekly adjustments,
	•	install/adaptation,
	•	overuse penalties if desired,
	•	“core 40” governance.

19.3 User-facing controls
	•	conservative/aggressive tendencies,
	•	run/pass bias,
	•	4th down aggressiveness,
	•	pressure frequency,
	•	shell preferences,
	•	personnel emphasis.

⸻

20) Injuries and Medical System

20.1 Injury system
	•	weekly out/limited logic,
	•	season-ending injuries,
	•	recurrence multipliers,
	•	durability effects,
	•	weather/surface/contact interplay.

20.2 Concussions
	•	concussion risk model,
	•	RTP time-loss logic,
	•	repeat-risk logic,
	•	acute vulnerability window.

20.3 Medical workflows
	•	medical scouting,
	•	injury report,
	•	return timeline,
	•	IR decisions,
	•	limited-to-full transitions.

⸻

21) Physics and Contact Modeling

21.1 Core modules
	•	contact severity,
	•	tackle outcomes,
	•	pile/traffic,
	•	catch point,
	•	pass rush,
	•	QB ballistics,
	•	kick resolver.

21.2 Kinematic proxy layer
	•	severity score,
	•	estimated linear accel,
	•	estimated rotational accel,
	•	injury linkage.

21.3 Environmental effects
	•	wind,
	•	precipitation,
	•	surface,
	•	temperature if modeled.

⸻

22) Weather System

22.1 Venue climate model
	•	per venue city/climate,
	•	monthly temp/wind/precip probabilities,
	•	dome/outdoor,
	•	surface type.

22.2 Game weather generation
	•	deterministic generation per game,
	•	persisted by game key,
	•	immutable once generated.

22.3 Gameplay effects
	•	ballistics,
	•	kick range,
	•	accuracy,
	•	drops,
	•	fumbles,
	•	traction/injury modulation.

22.4 UI surfaces
	•	pregame weather,
	•	in-game weather header,
	•	postgame logs.

⸻

23) Stats, Standings, Awards, History

23.1 Stats
	•	player stats,
	•	team stats,
	•	advanced metrics,
	•	windows/filters,
	•	exports.

23.2 Standings and schedule
	•	standings,
	•	tiebreakers,
	•	weekly slate,
	•	matchup pages.

23.3 Awards
	•	weekly/monthly if desired,
	•	season awards,
	•	playoff awards,
	•	MVPs, All-Pro equivalents, etc.

23.4 Hall of Fame / league history
	•	HOF monitor,
	•	inductees,
	•	franchise history,
	•	champions,
	•	records,
	•	dynasty tracking.

23.5 News system
	•	transactions,
	•	injuries,
	•	upsets,
	•	coach hot seat,
	•	award races,
	•	milestones,
	•	narrative recaps.

⸻

24) Save System, Validation, Recovery

24.1 Save features
	•	multiple saves,
	•	active save switching,
	•	import/export,
	•	metadata,
	•	autosave/manual save.

24.2 Integrity systems
	•	schema version,
	•	migration chain,
	•	critical validation,
	•	atomic writes,
	•	backups,
	•	recovery fallback.

24.3 Recovery mode
	•	corruption detection,
	•	divergence warnings,
	•	roster/cap mismatch handling,
	•	rebuild indices from ledger if possible,
	•	restore backup option.

⸻

25) Telemetry and Derived Metrics Layer

25.1 Purpose

A canonical metrics layer powering:
	•	badges,
	•	scouting statements,
	•	AI behavior,
	•	progression,
	•	percentiles,
	•	model cards.

25.2 Levels
	•	per play,
	•	per game,
	•	rolling window,
	•	season,
	•	career,
	•	league cohort percentiles.

25.3 Example metrics
	•	short/mid/deep on-target rates,
	•	pressured accuracy,
	•	moving accuracy,
	•	tight-window success,
	•	TWP rate,
	•	separation proxy,
	•	pass-block win rate,
	•	rush move win rate,
	•	run stop rate,
	•	contested catch rate,
	•	YAC per rec,
	•	break tackle rate.

⸻

26) Calibration Pack

26.1 Purpose

Externalized, versioned config for:
	•	injury baselines,
	•	recurrence multipliers,
	•	concussion model,
	•	situational turnovers,
	•	defense usage priors,
	•	coaching hazard priors,
	•	trade AI priors,
	•	contract market priors,
	•	future pick discount.

26.2 Required top-level JSON
	•	injury_baselines
	•	reinjury_multipliers
	•	concussion_model
	•	situational_turnovers
	•	coverage_usage
	•	coaching_hazard_priors
	•	trade_ai_priors
	•	contract_market_priors
	•	future_pick_discount

26.3 Validation
	•	schema checks,
	•	range checks,
	•	save-version pinning,
	•	deterministic immutability within a save.

⸻

27) Data-Driven Config Packs

27.1 Required packs
	•	CalibrationPack
	•	UnicornArchetypes
	•	ScoutingStatements
	•	BadgeDefinitions

27.2 Required behaviors
	•	validated on boot,
	•	versioned,
	•	pinned to save,
	•	no silent mid-save changes.

⸻

28) Deterministic ID and Ordering Policy

28.1 Purpose

Prevent replay/order nondeterminism from:
	•	tx IDs,
	•	news IDs,
	•	staffing offers,
	•	injury events,
	•	generated reports.

28.2 Policy
	•	deterministic hash- or counter-based IDs,
	•	explicit sort keys,
	•	no wall-clock ordering in logic,
	•	stable array order for replay.

⸻

29) UI Mission and Design System

29.1 Core UI goal

The UI should feel like a mobile front-office console:
	•	dense,
	•	scannable,
	•	explainable,
	•	football-authentic,
	•	fast to use with one hand.

29.2 Global UI principles
	•	decision-first layout,
	•	minimal clicks to compare,
	•	inline consequences,
	•	no dead-end screens,
	•	non-color-only encoding,
	•	sticky headers/frozen identity columns,
	•	safe-area support,
	•	accessibility-compliant.

29.3 Main screen families
	•	Hub command center
	•	Big Board
	•	Athletics tracker
	•	Prospect profile
	•	Compare tray/view
	•	Draft room
	•	FA market
	•	Contracts/cap center
	•	Roster/depth chart
	•	Gameplan/playcall
	•	League pages
	•	Settings/model cards

⸻

30) Optional Sports Hub / Feed Layer

30.1 Purpose

A read-only, immersive, Apple Sports–style league feed for:
	•	scoreboards,
	•	standings pulse,
	•	visual weekly context,
	•	polished hub experience.

30.2 Constraint
	•	must not become a second product,
	•	should be derived from canonical schedule/results/news state,
	•	phase-safe and save-safe.

⸻

31) Transparency Layer / Model Cards

31.1 Required model cards
	•	athletic composite
	•	badge triggers
	•	scouting confidence/reveal logic
	•	draft AI
	•	trade AI
	•	FA market model
	•	injury/recurrence model
	•	concussion model
	•	contract market model

31.2 UI placement
	•	adjacent info icon,
	•	tap for breakdown,
	•	examples included.

⸻

32) Accessibility and Mobile Requirements

32.1 Accessibility
	•	no color-only meaning,
	•	visible focus states,
	•	screen-reader labels,
	•	keyboard support where applicable,
	•	readable contrast.

32.2 Mobile
	•	sticky headers,
	•	frozen columns,
	•	compare tray,
	•	drawers/sheets for details,
	•	explicit safe-area padding,
	•	no jank under moderate card/table counts.

⸻

33) Acceptance Criteria for “Core Loop Completion”

A save is “complete” only if the following full loop is possible without dead ends:
	1.	New save
	2.	Onboarding/interviews/offers/staff
	3.	Offseason decisions
	4.	Draft prep and draft
	5.	Camp/cutdowns
	6.	Weekly regular season loop
	7.	Playoffs
	8.	Awards/champion/history persistence
	9.	Rollover to next season

Each step must:
	•	mutate state correctly,
	•	persist through save/load,
	•	remain deterministic,
	•	be reachable by routing/UI without dead ends.

⸻

34) “What this outline intentionally excludes”

This outline is feature-only. It does not describe:
	•	current repo completeness,
	•	current bugs,
	•	current broken/missing screens,
	•	current implementation status.

It is the pure intended feature set.

If you want, I can next turn this into a numbered product requirements document (PRD) with:
	•	feature IDs,
	•	must-have vs nice-to-have priority,
	•	acceptance criteria per feature,
	•	and implementation dependencies.
