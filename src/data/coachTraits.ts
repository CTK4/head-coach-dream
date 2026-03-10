export type AffinityScore = 1 | 0 | -1;

export type TraitTier = "Elite" | "Advanced" | "Basic" | "Passive";

export const TRAIT_STRENGTH: Record<TraitTier, number> = {
  Elite: 1.0,
  Advanced: 0.75,
  Basic: 0.5,
  Passive: 0.25,
};

export type CoachTrait = {
  id: string;
  label: string;
  tier: TraitTier;
  description: string;
  affinityMap: Record<string, AffinityScore>;
};

export type CoachProfile = {
  coachId: string;
  name: string;
  role: "OC" | "DC" | "QB_COACH" | "WR_COACH" | "OL_COACH" |
    "RB_COACH" | "LB_COACH" | "DB_COACH" | "DL_COACH" | "ST_COACH";
  traits: CoachTrait[];
  tenureYears: number;
  salary: number;
};

export type StaffRoster = {
  teamId: string;
  coaches: CoachProfile[];
};

export const COACH_TRAITS: CoachTrait[] = [
  {
    id: "elite_mechanics_expert",
    label: "Elite Mechanics Expert",
    tier: "Elite",
    description: "Drills footwork and release to elite levels; mental reps suffer.",
    affinityMap: {
      accuracy: 1, mechanics: 1, release_speed: 1,
      awareness: -1, processing: -1, football_iq: -1, route_recognition: -1,
    },
  },
  {
    id: "film_room_savant",
    label: "Film Room Savant",
    tier: "Advanced",
    description: "Elevates mental processing; physical refinement is deprioritized.",
    affinityMap: {
      awareness: 1, processing: 1, football_iq: 1,
      mechanics: -1, release_speed: -1, explosiveness: -1, strength: -1,
    },
  },
  {
    id: "run_game_architect",
    label: "Run Game Architect",
    tier: "Elite",
    description: "Dominates run blocking schemes; pass protection technique neglected.",
    affinityMap: {
      run_blocking: 1, drive_blocking: 1, leverage: 1,
      pass_blocking: -1, footwork: -1, hand_technique: -1, awareness: -1,
    },
  },
  {
    id: "route_tree_sculptor",
    label: "Route Tree Sculptor",
    tier: "Advanced",
    description: "Sharpens route stems and separation timing while blocking intensity drops.",
    affinityMap: {
      route_running: 1, separation: 1, release: 1,
      run_blocking: -1, play_strength: -1, tackling: -1, block_shedding: -1,
    },
  },
  {
    id: "press_man_enforcer",
    label: "Press Man Enforcer",
    tier: "Elite",
    description: "Builds elite jam timing and mirror skills but zone eyes regress.",
    affinityMap: {
      press_coverage: 1, man_coverage: 1, mirror_technique: 1,
      zone_coverage: -1, awareness: -1, ball_tracking: -1, tackling: -1,
    },
  },
  {
    id: "edge_pressure_alchemist",
    label: "Edge Pressure Alchemist",
    tier: "Advanced",
    description: "Unlocks pass-rush counters and burst while run anchor suffers.",
    affinityMap: {
      pass_rush: 1, bend: 1, get_off: 1,
      run_defense: -1, leverage: -1, block_shed: -1, gap_discipline: -1,
    },
  },
  {
    id: "zone_pattern_professor",
    label: "Zone Pattern Professor",
    tier: "Advanced",
    description: "Teaches spacing and route passing in zone at cost of man aggression.",
    affinityMap: {
      zone_coverage: 1, awareness: 1, route_recognition: 1,
      press_coverage: -1, man_coverage: -1, closing_speed: -1, hit_power: -1,
    },
  },
  {
    id: "red_zone_playcaller",
    label: "Red Zone Playcaller",
    tier: "Basic",
    description: "Maximizes tight-space execution but open-field tempo preparation lags.",
    affinityMap: {
      red_zone_accuracy: 1, contested_catch: 1, short_area_quickness: 1,
      deep_accuracy: -1, long_speed: -1, stamina: -1, open_field_vision: -1,
    },
  },
  {
    id: "special_teams_precision",
    label: "Special Teams Precision",
    tier: "Advanced",
    description: "Creates highly disciplined units while position group polish slips.",
    affinityMap: {
      kick_accuracy: 1, kick_power: 1, return_vision: 1,
      route_running: -1, pass_rush: -1, run_blocking: -1, man_coverage: -1,
    },
  },
  {
    id: "clock_management_guru",
    label: "Clock Management Guru",
    tier: "Passive",
    description: "Improves situational tempo and decision pacing while raw tools stagnate.",
    affinityMap: {
      awareness: 1, composure: 1, decision_making: 1,
      explosiveness: -1, acceleration: -1, strength: -1, agility: -1,
    },
  },
  {
    id: "culture_builder",
    label: "Culture Builder",
    tier: "Basic",
    description: "Boosts chemistry and communication but fine-grain technique is deprioritized.",
    affinityMap: {
      chemistry: 1, leadership: 1, communication: 1,
      hand_technique: -1, footwork: -1, release_speed: -1, block_shedding: -1,
    },
  },
  {
    id: "conditioning_taskmaster",
    label: "Conditioning Taskmaster",
    tier: "Basic",
    description: "Raises stamina and durability while tactical depth and nuance taper.",
    affinityMap: {
      stamina: 1, durability: 1, recovery: 1,
      awareness: -1, processing: -1, route_iq: -1, pass_set_technique: -1,
    },
  },
  {
    id: "dual_threat_developer",
    label: "Dual-Threat Developer",
    tier: "Elite",
    description: "Builds QB rushing threat and off-platform throws at mental consistency cost.",
    affinityMap: {
      throw_on_run: 1, scrambling: 1, acceleration: 1,
      pocket_poise: -1, coverage_id: -1, timing: -1, protection_calls: -1,
    },
  },
  {
    id: "trench_technician",
    label: "Trench Technician",
    tier: "Advanced",
    description: "Improves hand placement and leverage inside while perimeter speed declines.",
    affinityMap: {
      hand_technique: 1, leverage: 1, anchor: 1,
      speed: -1, agility: -1, open_field_tackling: -1, route_range: -1,
    },
  },
  {
    id: "ball_hawk_mentor",
    label: "Ball Hawk Mentor",
    tier: "Basic",
    description: "Emphasizes takeaways and tracking, sacrificing secure tackling form.",
    affinityMap: {
      ball_tracking: 1, catch_point_timing: 1, route_recognition: 1,
      tackling: -1, pursuit_angles: -1, play_strength: -1, run_fits: -1,
    },
  },
  {
    id: "power_run_taskforce",
    label: "Power Run Taskforce",
    tier: "Advanced",
    description: "Builds downhill rushing identity while spread passing details decline.",
    affinityMap: {
      yards_after_contact: 1, drive_blocking: 1, run_vision: 1,
      release: -1, route_running: -1, pass_protection_id: -1, deep_accuracy: -1,
    },
  },
  {
    id: "spread_tempo_operator",
    label: "Spread Tempo Operator",
    tier: "Advanced",
    description: "Increases tempo and spacing execution while physical trench work softens.",
    affinityMap: {
      tempo: 1, quick_decision: 1, spacing: 1,
      drive_blocking: -1, anchor: -1, hit_power: -1, stack_shed: -1,
    },
  },
  {
    id: "linebacker_chessmaster",
    label: "Linebacker Chessmaster",
    tier: "Basic",
    description: "Improves fits and read steps but pass-rush creativity gets less focus.",
    affinityMap: {
      run_fits: 1, block_destruction: 1, play_recognition: 1,
      pass_rush: -1, bend: -1, burst: -1, hand_counters: -1,
    },
  },
  {
    id: "secondary_communicator",
    label: "Secondary Communicator",
    tier: "Passive",
    description: "Raises coverage communication and disguise, reducing line-play attention.",
    affinityMap: {
      communication: 1, disguise: 1, switch_callouts: 1,
      leverage: -1, pass_set_technique: -1, run_blocking: -1, release: -1,
    },
  },
  {
    id: "situational_pressure_planner",
    label: "Situational Pressure Planner",
    tier: "Advanced",
    description: "Designs third-down heat packages while base-down coverage balance suffers.",
    affinityMap: {
      blitz_timing: 1, stunt_coordination: 1, closing_burst: 1,
      zone_discipline: -1, tackle_consistency: -1, run_lane_integrity: -1, pursuit: -1,
    },
  },
  {
    id: "return_game_innovator",
    label: "Return Game Innovator",
    tier: "Basic",
    description: "Maximizes return lanes and burst but core offensive reps are reduced.",
    affinityMap: {
      return_vision: 1, return_burst: 1, lane_setup: 1,
      pass_blocking: -1, mechanics: -1, route_precision: -1, pocket_awareness: -1,
    },
  },
];

export function assertTraitBalance(traits: CoachTrait[]): void {
  for (const t of traits) {
    const pos = Object.values(t.affinityMap).filter(v => v === 1).length;
    const neg = Object.values(t.affinityMap).filter(v => v === -1).length;
    if (pos - neg > 1) {
      throw new Error(
        `Coach trait "${t.id}" has ${pos} positive and ${neg} negative ` +
        `affinities. Net positives must not exceed net negatives by more than 1.`
      );
    }
  }
}
assertTraitBalance(COACH_TRAITS);
