export type ClassYear = number;

export const CLASS_QUALITY_TABLE: Record<ClassYear, number> = {
  2027: 1.08,
  2028: 0.93,
  2029: 1.12,
  2030: 1.0,
  2031: 0.88,
};

export type Position =
  | "QB" | "RB" | "WR" | "TE"
  | "OT" | "IOL"
  | "EDGE" | "IDL" | "LB"
  | "CB" | "S"
  | "K" | "P";

export type PlayerArchetype = {
  id: string;
  label: string;
  position: Position;
  attrBias: Record<string, number>;
};

export const ARCHETYPES: PlayerArchetype[] = [
  { id: "pocket_passer", position: "QB", label: "Pocket Passer", attrBias: { accuracy: 7, mechanics: 5, awareness: 3, speed: -6, scramble: -7, agility: -5 } },
  { id: "scrambler", position: "QB", label: "Scrambler", attrBias: { speed: 7, scramble: 6, agility: 5, accuracy: -5, mechanics: -4, touch: -6 } },
  { id: "dual_threat", position: "QB", label: "Dual Threat", attrBias: { speed: 4, scramble: 4, accuracy: 2, mechanics: 1, awareness: -3, touch: -4, football_iq: -4 } },

  { id: "power_back", position: "RB", label: "Power Back", attrBias: { power: 7, vision: 4, blocking: 3, speed: -5, elusiveness: -4, route_running: -5 } },
  { id: "receiving_back", position: "RB", label: "Receiving Back", attrBias: { route_running: 7, hands: 5, agility: 4, power: -5, blocking: -4, ball_security: -3 } },
  { id: "elusive_back", position: "RB", label: "Elusive Back", attrBias: { speed: 6, agility: 6, elusiveness: 6, power: -6, blocking: -5, vision: -4 } },

  { id: "deep_threat", position: "WR", label: "Deep Threat", attrBias: { speed: 7, separation: 6, agility: 3, hands: -4, route_running: -5, awareness: -4 } },
  { id: "slot_receiver", position: "WR", label: "Slot", attrBias: { route_running: 6, agility: 6, hands: 4, blocking: -4, speed: -3, awareness: -2 } },
  { id: "possession_receiver", position: "WR", label: "Possession", attrBias: { hands: 7, awareness: 4, route_running: 4, speed: -5, separation: -4, agility: -3 } },

  { id: "blocking_te", position: "TE", label: "Blocking TE", attrBias: { blocking: 7, strength: 5, awareness: 3, route_running: -5, hands: -4, speed: -5 } },
  { id: "receiving_te", position: "TE", label: "Receiving TE", attrBias: { hands: 6, route_running: 6, speed: 4, blocking: -6, strength: -4, awareness: -3 } },
  { id: "hybrid_te", position: "TE", label: "Hybrid", attrBias: { hands: 3, route_running: 3, blocking: 3, speed: 2, strength: -3, awareness: -4 } },

  { id: "pass_protector", position: "OT", label: "Pass Protector", attrBias: { pass_blocking: 7, footwork: 5, hand_technique: 4, run_blocking: -5, strength: -4, agility: -3 } },
  { id: "run_blocker", position: "OT", label: "Run Blocker", attrBias: { run_blocking: 7, strength: 5, awareness: 2, pass_blocking: -5, footwork: -4, hand_technique: -3 } },
  { id: "balanced_ot", position: "OT", label: "Balanced", attrBias: { pass_blocking: 3, run_blocking: 3, awareness: 2, strength: 1, agility: -3, hand_technique: -4 } },

  { id: "mauler", position: "IOL", label: "Mauler", attrBias: { run_blocking: 7, strength: 6, leverage: 3, pass_blocking: -6, awareness: -5, hand_technique: -4 } },
  { id: "technician", position: "IOL", label: "Technician", attrBias: { hand_technique: 7, pass_blocking: 5, awareness: 3, run_blocking: -4, strength: -5, leverage: -4 } },
  { id: "puller", position: "IOL", label: "Puller", attrBias: { agility: 6, run_blocking: 5, awareness: 3, pass_blocking: -3, strength: -5, leverage: -5 } },

  { id: "speed_rusher", position: "EDGE", label: "Speed Rusher", attrBias: { speed: 7, pass_rush: 5, agility: 4, power: -5, run_defense: -6, awareness: -3 } },
  { id: "power_rusher", position: "EDGE", label: "Power Rusher", attrBias: { power: 7, hand_technique: 5, run_defense: 3, speed: -5, agility: -4, awareness: -3 } },
  { id: "counter_rusher", position: "EDGE", label: "Counter Rusher", attrBias: { hand_technique: 6, awareness: 4, pass_rush: 4, speed: -3, power: -4, motor: -3 } },

  { id: "run_stuffer", position: "IDL", label: "Run Stuffer", attrBias: { run_defense: 7, strength: 6, leverage: 4, pass_rush: -6, agility: -5, awareness: -4 } },
  { id: "idl_pass_rush", position: "IDL", label: "Pass Rush Specialist", attrBias: { pass_rush: 7, motor: 5, agility: 3, run_defense: -5, strength: -4, leverage: -3 } },
  { id: "two_gap", position: "IDL", label: "Two-Gap", attrBias: { strength: 5, leverage: 5, run_defense: 4, pass_rush: -4, agility: -5, motor: -4 } },

  { id: "coverage_lb", position: "LB", label: "Coverage LB", attrBias: { coverage: 7, speed: 5, football_iq: 3, run_defense: -5, tackling: -4, motor: -3 } },
  { id: "run_stopper_lb", position: "LB", label: "Run Stopper", attrBias: { run_defense: 7, tackling: 5, awareness: 3, coverage: -6, speed: -5, football_iq: -3 } },
  { id: "hybrid_lb", position: "LB", label: "Hybrid", attrBias: { tackling: 4, coverage: 3, run_defense: 3, awareness: 2, speed: -3, football_iq: -4 } },

  { id: "press_corner", position: "CB", label: "Press Corner", attrBias: { press: 7, man_coverage: 5, speed: 3, zone_coverage: -5, awareness: -4, tackling: -2 } },
  { id: "zone_corner", position: "CB", label: "Zone Corner", attrBias: { zone_coverage: 7, awareness: 5, coverage: 4, press: -5, man_coverage: -4, speed: -3 } },
  { id: "slot_corner", position: "CB", label: "Slot Corner", attrBias: { agility: 7, man_coverage: 5, speed: 4, press: -4, tackling: -3, awareness: -3 } },

  { id: "box_safety", position: "S", label: "Box Safety", attrBias: { tackling: 7, run_defense: 5, awareness: 3, coverage: -5, speed: -4, zone_coverage: -3 } },
  { id: "center_field", position: "S", label: "Center Field", attrBias: { speed: 6, coverage: 6, zone_coverage: 5, tackling: -5, run_defense: -4, awareness: -3 } },
  { id: "hybrid_s", position: "S", label: "Hybrid", attrBias: { coverage: 4, tackling: 4, awareness: 3, football_iq: 2, speed: -3, run_defense: -4 } },

  { id: "k_power_leg", position: "K", label: "Power Leg", attrBias: { kick_power: 7, kickoff_distance: 5, kick_accuracy: -6 } },
  { id: "k_accuracy_leg", position: "K", label: "Accuracy Leg", attrBias: { kick_accuracy: 7, kick_power: -4, kickoff_distance: -3 } },
  { id: "p_power_leg", position: "P", label: "Power Leg", attrBias: { punt_distance: 7, hang_time: 4, punt_accuracy: -6 } },
  { id: "p_accuracy_leg", position: "P", label: "Accuracy Leg", attrBias: { punt_accuracy: 7, hang_time: 3, punt_distance: -5 } },
];

export const POSITION_BASELINE: Record<Position, Record<string, number>> = {
  QB: { accuracy: 68, mechanics: 65, awareness: 64, speed: 55, scramble: 50, agility: 53, touch: 66, football_iq: 67, release_speed: 63, processing: 66 },
  RB: { speed: 72, agility: 70, elusiveness: 68, power: 62, vision: 65, route_running: 58, blocking: 50, ball_security: 66 },
  WR: { speed: 74, route_running: 66, hands: 68, separation: 64, agility: 70, blocking: 48, awareness: 60 },
  TE: { blocking: 64, route_running: 60, hands: 65, speed: 62, strength: 66, awareness: 60, agility: 60 },
  OT: { pass_blocking: 66, run_blocking: 65, strength: 68, footwork: 64, hand_technique: 63, awareness: 60, agility: 56 },
  IOL: { run_blocking: 68, pass_blocking: 63, strength: 70, leverage: 67, hand_technique: 65, awareness: 60 },
  EDGE: { speed: 68, power: 65, pass_rush: 66, run_defense: 62, motor: 67, awareness: 60, agility: 64, hand_technique: 60 },
  IDL: { strength: 70, run_defense: 68, pass_rush: 58, motor: 65, leverage: 69, awareness: 60, agility: 52 },
  LB: { tackling: 68, coverage: 60, run_defense: 67, speed: 63, awareness: 65, motor: 66, football_iq: 63 },
  CB: { coverage: 68, speed: 72, press: 62, zone_coverage: 65, man_coverage: 64, awareness: 62, agility: 70 },
  S: { awareness: 68, coverage: 64, tackling: 65, speed: 66, zone_coverage: 65, run_defense: 60, football_iq: 67 },
  K: { kick_power: 70, kick_accuracy: 68, kickoff_distance: 66 },
  P: { punt_distance: 70, punt_accuracy: 67, hang_time: 68 },
};

export const POSITION_STDDEV: Record<Position, Record<string, number>> = {
  QB: { accuracy: 6, mechanics: 7, speed: 9, awareness: 7, scramble: 12, touch: 7, football_iq: 6, processing: 7, release_speed: 7, agility: 9 },
  RB: { speed: 6, agility: 7, elusiveness: 7, power: 8, vision: 7, route_running: 11, blocking: 12, ball_security: 8 },
  WR: { speed: 6, route_running: 7, hands: 7, separation: 8, agility: 7, blocking: 12, awareness: 10 },
  TE: { blocking: 7, route_running: 9, hands: 8, speed: 8, strength: 7, awareness: 10, agility: 9 },
  OT: { pass_blocking: 7, run_blocking: 8, strength: 7, footwork: 8, hand_technique: 8, awareness: 10, agility: 11 },
  IOL: { run_blocking: 7, pass_blocking: 8, strength: 7, leverage: 8, hand_technique: 8, awareness: 10 },
  EDGE: { speed: 7, power: 8, pass_rush: 7, run_defense: 9, motor: 8, awareness: 10, agility: 9, hand_technique: 9 },
  IDL: { strength: 7, run_defense: 7, pass_rush: 10, motor: 9, leverage: 8, awareness: 10, agility: 12 },
  LB: { tackling: 7, coverage: 9, run_defense: 8, speed: 8, awareness: 8, motor: 8, football_iq: 9 },
  CB: { coverage: 7, speed: 6, press: 9, zone_coverage: 8, man_coverage: 8, awareness: 8, agility: 7 },
  S: { awareness: 7, coverage: 8, tackling: 8, speed: 7, zone_coverage: 8, run_defense: 10, football_iq: 7 },
  K: { kick_power: 7, kick_accuracy: 6, kickoff_distance: 8 },
  P: { punt_distance: 7, punt_accuracy: 6, hang_time: 7 },
};

export const POSITION_OVR_WEIGHTS: Record<Position, Record<string, number>> = {
  QB: { accuracy: 0.25, mechanics: 0.15, awareness: 0.15, touch: 0.12, processing: 0.12, release_speed: 0.11, speed: 0.05, football_iq: 0.05 },
  RB: { speed: 0.22, elusiveness: 0.2, vision: 0.18, power: 0.14, agility: 0.12, ball_security: 0.08, route_running: 0.04, blocking: 0.02 },
  WR: { speed: 0.23, route_running: 0.2, hands: 0.2, separation: 0.18, agility: 0.1, awareness: 0.06, blocking: 0.03 },
  TE: { blocking: 0.24, hands: 0.18, route_running: 0.17, strength: 0.15, speed: 0.12, awareness: 0.08, agility: 0.06 },
  OT: { pass_blocking: 0.28, run_blocking: 0.22, strength: 0.16, footwork: 0.12, hand_technique: 0.12, awareness: 0.06, agility: 0.04 },
  IOL: { run_blocking: 0.28, pass_blocking: 0.22, strength: 0.18, leverage: 0.14, hand_technique: 0.1, awareness: 0.08 },
  EDGE: { pass_rush: 0.26, speed: 0.2, power: 0.16, hand_technique: 0.14, run_defense: 0.1, motor: 0.08, awareness: 0.04, agility: 0.02 },
  IDL: { run_defense: 0.28, strength: 0.22, leverage: 0.16, pass_rush: 0.14, motor: 0.1, awareness: 0.06, agility: 0.04 },
  LB: { tackling: 0.24, run_defense: 0.2, coverage: 0.18, awareness: 0.14, speed: 0.12, motor: 0.07, football_iq: 0.05 },
  CB: { coverage: 0.24, man_coverage: 0.18, zone_coverage: 0.18, speed: 0.16, agility: 0.12, press: 0.08, awareness: 0.04 },
  S: { awareness: 0.2, coverage: 0.2, zone_coverage: 0.17, tackling: 0.15, speed: 0.13, football_iq: 0.1, run_defense: 0.05 },
  K: { kick_accuracy: 0.45, kick_power: 0.35, kickoff_distance: 0.2 },
  P: { punt_accuracy: 0.45, punt_distance: 0.35, hang_time: 0.2 },
};

export const BASE_DEV_WEIGHTS = {
  generational: 0.005,
  elite: 0.05,
  impact: 0.2,
  normal: 0.745,
};

const POSITIONS = Object.keys(POSITION_BASELINE) as Position[];

for (const pos of POSITIONS) {
  if (!POSITION_STDDEV[pos]) throw new Error(`Missing POSITION_STDDEV for ${pos}`);
  if (!POSITION_OVR_WEIGHTS[pos]) throw new Error(`Missing POSITION_OVR_WEIGHTS for ${pos}`);

  const weightSum = Object.values(POSITION_OVR_WEIGHTS[pos]).reduce((sum, value) => sum + value, 0);
  if (Math.abs(weightSum - 1) > 0.001) {
    throw new Error(`POSITION_OVR_WEIGHTS for ${pos} must sum to 1.0 ± 0.001; got ${weightSum}`);
  }
}

for (const archetype of ARCHETYPES) {
  const values = Object.values(archetype.attrBias);
  const total = values.reduce((sum, value) => sum + value, 0);
  if (values.some((value) => value < -8 || value > 8)) {
    throw new Error(`Archetype ${archetype.id} has attrBias outside [-8, 8]`);
  }
  if (total < -10 || total > 10) {
    throw new Error(`Archetype ${archetype.id} attrBias sum must be in [-10, 10]; got ${total}`);
  }
}
