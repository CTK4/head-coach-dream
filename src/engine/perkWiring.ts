import { getPerkNode, SKILL_TREE_NODES } from "@/data/skillTree";

/**
 * Perk grant wiring audit (Step 1)
 *
 * A) ALREADY_WIRED
 * - None (all current grant strings required explicit mechanical mapping).
 *
 * B) REPUTATION_DELTA
 * - cmd_presence, cmd_branch_a, cmd_branch_b
 * - op_media, op_choice_owner, op_choice_gm
 * - arch_oc_1, arch_dc_1, arch_col_1, arch_guru_1, arch_grind_1
 *
 * C) SIM_MODIFIER
 * - cmd_control
 * - arc_install, arc_self_scout, arc_choice_run, arc_choice_pass
 * - arch_oc_2, arch_dc_2, arch_st_1, arch_st_2, arch_grind_2, arch_guru_2
 *
 * D) HIRING_MODIFIER
 * - op_staff_net, op_choice_gm
 *
 * E) CAP_LIFT
 * - arch_oc_2 (defCred soft cap lift), arch_dc_2 (offCred soft cap lift), arch_guru_2 (defCred soft cap lift)
 *
 * F) FLAG_GRANT
 * - All unlocked perks emit deterministic flags (perk:<id> + grant:<normalized>) for event/game checks.
 *
 * G) PROGRESSION_MODIFIER
 * - arch_col_2, arch_grind_1
 *
 * H) DESCRIPTIVE_ONLY
 * - op_media (secondary descriptive clause: negative media swings)
 * - op_choice_owner (secondary descriptive clause: owner trust stability)
 */

export type CoachPerkCarrier = {
  archetypeId?: string;
  tenureYear?: number;
  unlockedPerkIds?: string[];
};

const REPUTATION_BONUSES: Record<string, Partial<Record<string, number>>> = {
  cmd_presence: { leadershipTrust: 3 },
  cmd_branch_a: { playerRespect: 4 },
  cmd_branch_b: { ownerPatienceMult: 0.04 },
  op_media: { mediaRep: 4 },
  op_choice_owner: { ownerPatienceMult: 0.06 },
  op_choice_gm: { autonomyLevel: 4 },
  arch_oc_1: { offCred: 5 },
  arch_dc_1: { defCred: 5 },
  arch_col_1: { leadershipTrust: 4 },
  arch_guru_1: { innovationPerception: 6 },
  arch_grind_1: { playerRespect: 2, leadershipTrust: 2 },
};

const CAP_LIFTS: Record<string, Partial<Record<"offCred" | "defCred", number>>> = {
  arch_oc_2: { defCred: 72 },
  arch_dc_2: { offCred: 72 },
  arch_guru_2: { defCred: 62 },
};

const SIM_MODIFIERS: Record<string, (ctx: { playType?: string; aggression?: string; quarter?: number; timeRemainingSec?: number }) => number> = {
  cmd_control: (ctx) => (ctx.quarter === 4 && (ctx.timeRemainingSec ?? 999) <= 300 ? 0.08 : 0),
  arc_install: () => 0.04,
  arc_self_scout: () => 0.05,
  arc_choice_run: (ctx) => (["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "RUN"].includes(String(ctx.playType)) ? 0.08 : 0),
  arc_choice_pass: (ctx) => (["QUICK_GAME", "DROPBACK", "SCREEN", "SHORT_PASS", "DEEP_PASS", "PLAY_ACTION"].includes(String(ctx.playType)) ? 0.07 : 0),
  arch_oc_2: (ctx) => (ctx.playType === "DROPBACK" || ctx.playType === "DEEP_PASS" ? 0.09 : 0),
  arch_dc_2: () => 0.06,
  arch_st_1: (ctx) => (ctx.playType === "PUNT" || ctx.playType === "FG" ? 0.07 : 0),
  arch_st_2: (ctx) => (ctx.quarter === 4 ? 0.07 : 0),
  arch_grind_2: (ctx) => (ctx.quarter === 4 ? 0.05 : 0),
  arch_guru_2: () => 0.06,
};

function unlockedIds(coach: CoachPerkCarrier | undefined): string[] {
  return (coach?.unlockedPerkIds ?? []).filter(Boolean);
}

export function applyFlagsToContext(coach: CoachPerkCarrier | undefined): string[] {
  const flags: string[] = [];
  for (const id of unlockedIds(coach)) {
    const node = getPerkNode(id);
    if (!node) continue;
    flags.push(`perk:${id}`);
    for (const grant of node.grants ?? []) {
      const normalized = String(grant).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      if (normalized) flags.push(`grant:${normalized}`);
    }
  }
  return Array.from(new Set(flags));
}

export function getPerkReputationDeltas(coach: CoachPerkCarrier | undefined): Partial<Record<string, number>> {
  const acc: Partial<Record<string, number>> = {};
  for (const id of unlockedIds(coach)) {
    const deltas = REPUTATION_BONUSES[id];
    if (!deltas) continue;
    for (const [k, v] of Object.entries(deltas)) acc[k] = Number(acc[k] ?? 0) + Number(v ?? 0);
  }
  return acc;
}

export function getPerkCapLift(coach: CoachPerkCarrier | undefined, field: "offCred" | "defCred", baseCap: number): number {
  let cap = baseCap;
  for (const id of unlockedIds(coach)) {
    const lifted = CAP_LIFTS[id]?.[field];
    if (typeof lifted === "number") cap = Math.max(cap, lifted);
  }
  return cap;
}

export function resolvePerkModifiers(
  coach: CoachPerkCarrier | undefined,
  rollContext: { playType?: string; aggression?: string; quarter?: number; timeRemainingSec?: number }
): number {
  let delta = 0;
  for (const id of unlockedIds(coach)) {
    const fn = SIM_MODIFIERS[id];
    if (!fn) continue;
    delta += fn(rollContext);
  }
  return delta;
}

export function getPerkHiringModifier(coach: CoachPerkCarrier | undefined, candidateRole: string): number {
  const role = String(candidateRole).toUpperCase();
  let mod = 0;
  for (const id of unlockedIds(coach)) {
    if (id === "op_staff_net") mod += 0.05;
    if (id === "op_choice_gm" && ["OC", "DC", "STC", "QB"].includes(role)) mod += 0.03;
  }
  return mod;
}

export function getPerkDevelopmentMultiplier(coach: CoachPerkCarrier | undefined, player: { draftRound?: unknown; age?: unknown }): number {
  let mult = 1;
  for (const id of unlockedIds(coach)) {
    if (id === "arch_col_2") mult *= 1.12;
    if (id === "arch_grind_1") {
      const round = Number(player.draftRound ?? 7);
      mult *= round >= 4 ? 1.15 : 1.06;
    }
  }
  return Math.max(0.5, Math.min(2, Number(mult.toFixed(4))));
}

export function getPerkFaInterestModifier(coach: CoachPerkCarrier | undefined, position: string): number {
  const pos = String(position).toUpperCase();
  let mod = 0;
  for (const id of unlockedIds(coach)) {
    if (id === "arch_col_2" && ["QB", "WR", "CB", "EDGE", "OT"].includes(pos)) mod += 0.04;
  }
  return mod;
}

export function listUnknownPerkIds(unlocked: string[]): string[] {
  const known = new Set(SKILL_TREE_NODES.map((n) => n.id));
  return unlocked.filter((id) => !known.has(id));
}

export function applyNumericRepDelta(base: number, delta: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(base ?? 0) + Number(delta ?? 0))));
}
