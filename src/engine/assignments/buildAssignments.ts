import type { DefensiveCall } from "@/engine/defense/defensiveCalls";
import type { GameSim, PlayType, Possession } from "@/engine/gameSim";
import type { DefensivePackage, PersonnelPackage } from "@/engine/personnel";
import { resolveOffenseRoles } from "@/engine/assignments/offenseRoleResolver";
import { resolveDefenseRoles } from "@/engine/assignments/defenseRoleResolver";
import { resolveProtection } from "@/engine/assignments/protectionResolver";
import { resolveRunFits } from "@/engine/assignments/runFitResolver";
import { resolveRushMatchups } from "@/engine/assignments/rushAssignmentResolver";
import { getDefenseTemplate } from "@/engine/templates/defenseCallTemplates";
import { getOffenseTemplate } from "@/engine/templates/offenseConceptTemplates";
import { mapDefenseCallNameToTemplateId, mapOffensePlayNameToTemplateId, type PlayTypeHint } from "@/engine/templates/playbookMappings";
import { getDefenseRoleId, getOffenseEligibleId, getOLId } from "@/engine/assignments/trackedPlayersSelectors";
import type { DefensePackage as AssignmentDefensePackage, DefenseRole, OffenseEligibleRole, OLineRole, PlayAssignmentLog, RushMatchup } from "@/engine/assignments/types";

function otherSide(side: Possession): Possession {
  return side === "HOME" ? "AWAY" : "HOME";
}

function mapDefPackageToAssignment(defPkg: DefensivePackage): AssignmentDefensePackage {
  if (defPkg === "GoalLine") return "BEAR";
  if (defPkg === "Base") return "ODD_34";
  return "NICKEL";
}

function playConceptIdentity(playType: PlayType): { name: string; hint: PlayTypeHint } {
  if (playType === "INSIDE_ZONE") return { name: "Inside Zone", hint: "RUN" };
  if (playType === "OUTSIDE_ZONE") return { name: "Outside Zone", hint: "RUN" };
  if (playType === "POWER") return { name: "Power", hint: "RUN" };
  if (playType === "QB_KEEP") return { name: "QB Keep", hint: "RUN" };
  if (playType === "RUN") return { name: "Inside Zone", hint: "RUN" };
  if (playType === "QUICK_GAME") return { name: "Quick Game", hint: "PASS" };
  if (playType === "DROPBACK") return { name: "Dropback", hint: "PASS" };
  if (playType === "PLAY_ACTION") return { name: "Play Action", hint: "PLAY_ACTION" };
  if (playType === "SCREEN") return { name: "RB Screen", hint: "SCREEN" };
  if (playType === "RPO_READ") return { name: "Read Option", hint: "RPO" };
  return { name: String(playType).replace(/_/g, " "), hint: "PASS" };
}

function defensiveCallName(defensiveCall?: DefensiveCall): string {
  if (!defensiveCall) return "Cover 3";
  if (defensiveCall.kind === "SHELL") {
    if (defensiveCall.shell === "MAN") return defensiveCall.press ? "Man Press" : "Cover 1";
    if (defensiveCall.shell === "COVER_2") return "Cover 2";
    if (defensiveCall.shell === "QUARTERS") return "Quarters";
    return "Cover 3";
  }
  if (defensiveCall.kind === "PRESSURE") return defensiveCall.pressure === "SIM" ? "Sim" : "Blitz";
  if (defensiveCall.kind === "RUN_FIT") return defensiveCall.box === "HEAVY" ? "Heavy box" : "Normal box";
  if (defensiveCall.kind === "SPECIAL") return defensiveCall.tag === "BRACKET_STAR" ? "Bracket Star" : defensiveCall.tag === "PREVENT" ? "Prevent" : "Spy QB";
  return "Cover 3";
}

function resolveBlockerIds(matchup: RushMatchup, offenseIds: Record<OffenseEligibleRole | OLineRole, string>): string[] {
  return matchup.blockerRoles.map((role) => {
    if (role === "LT" || role === "LG" || role === "C" || role === "RG" || role === "RT") return offenseIds[role];
    return offenseIds[role as OffenseEligibleRole];
  });
}

export function buildAssignments(
  sim: GameSim,
  args: { playType: PlayType; personnelPackage: PersonnelPackage; defensivePackage: DefensivePackage; defensiveCall?: DefensiveCall },
) {
  const notes: string[] = [];
  const offenseResolved = resolveOffenseRoles(args.personnelPackage);
  const concept = playConceptIdentity(args.playType);
  const conceptTemplateId = mapOffensePlayNameToTemplateId(concept.name, concept.hint);
  const offenseTemplate = getOffenseTemplate(conceptTemplateId);

  const offenseTracked = sim.trackedPlayers[sim.possession] ?? {};
  const offenseEligible = Object.fromEntries(
    Object.keys(offenseResolved.eligibleRoleAssignments).map((role) => [role, getOffenseEligibleId(offenseTracked, role as OffenseEligibleRole, notes).id]),
  ) as Record<OffenseEligibleRole, string>;
  const offenseOl = Object.fromEntries(
    Object.keys(offenseResolved.olAssignments).map((role) => [role, getOLId(offenseTracked, role as OLineRole, notes).id]),
  ) as Record<OLineRole, string>;

  const defensePkg = mapDefPackageToAssignment(args.defensivePackage);
  const defTemplateId = mapDefenseCallNameToTemplateId(defensiveCallName(args.defensiveCall));
  const defenseTemplate = getDefenseTemplate(defTemplateId);
  const defenseSlots = resolveDefenseRoles(defensePkg);
  const defenseTracked = sim.trackedPlayers[otherSide(sim.possession)] ?? {};
  const defenseRoles = Object.fromEntries(
    Object.keys(defenseSlots).map((role) => [role, getDefenseRoleId(defenseTracked, role as DefenseRole, notes).id]),
  ) as Partial<Record<DefenseRole, string>>;

  const responsibleDefenderByRole = Object.fromEntries(
    Object.entries(defenseTemplate.responsibleDefenderByRole).map(([role, defRole]) => [role, defenseRoles[defRole as DefenseRole] ?? getDefenseRoleId(defenseTracked, defRole as DefenseRole, notes).id]),
  ) as Record<Exclude<OffenseEligibleRole, "QB">, string>;

  const rush = resolveRushMatchups(defTemplateId, defensePkg, args.defensiveCall?.kind === "PRESSURE" ? args.defensiveCall.pressure : undefined);
  const runFits = resolveRunFits(defenseTemplate.runFitDefaults.front, defensePkg);

  const protection = offenseTemplate.family === "run"
    ? offenseTemplate.runProtectionDefaults
    : offenseTemplate.protectionFamily
      ? resolveProtection(offenseTemplate.protectionFamily, { frontId: defenseTemplate.runFitDefaults.front })
      : undefined;

  const targetRole = args.playType === "QB_KEEP" ? "QB" : offenseTemplate.primaryReadRole;
  if (args.playType === "QB_KEEP") notes.push("target-defender-proxy:QB->RB");
  const defenderForTarget = responsibleDefenderByRole[targetRole === "QB" ? "RB" : targetRole];

  const rushMatchups = rush.matchups.map((m) => ({
    rusherId: defenseRoles[m.rusherRole] ?? getDefenseRoleId(defenseTracked, m.rusherRole, notes).id,
    blockerIds: resolveBlockerIds(m, { ...offenseEligible, ...offenseOl }),
    ...(m.note ? { note: m.note } : {}),
  }));

  const log: PlayAssignmentLog = {
    offenseRolesAtSnap: { ...offenseEligible, ...offenseOl },
    defenseRolesAtSnap: defenseRoles,
    targetRole,
    targetPlayerId: offenseEligible[targetRole] ?? offenseEligible.X,
    defenderId: defenderForTarget,
    coverageFamily: defenseTemplate.coverageFamily,
    shell: defenseTemplate.shell,
    rushersCount: rush.rushersCount,
    rushMatchups,
    runFront: runFits.front,
    boxCount: runFits.boxCount,
    forceDefender: runFits.forceDefender,
    cutbackDefender: runFits.cutbackDefender,
    primaryFitDefenders: runFits.primaryFitDefenders,
    primaryReadRole: offenseTemplate.primaryReadRole,
    progressionRoles: offenseTemplate.progressionRoles,
    responsibleDefenderByRole,
    ...(notes.length ? { notes: Array.from(new Set(notes)) } : {}),
  };

  return {
    offense: {
      eligible: offenseEligible,
      ol: offenseOl,
      protection,
      reads: { primary: offenseTemplate.primaryReadRole, progression: offenseTemplate.progressionRoles },
    },
    defense: {
      roles: defenseRoles,
      template: defenseTemplate,
      responsibleDefenderByRole,
      rush: { rushersCount: rush.rushersCount, matchups: rush.matchups },
      runFits,
    },
    log,
  };
}
