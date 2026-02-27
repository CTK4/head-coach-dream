import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

export type AwardType = "MVP" | "OPOY" | "DPOY" | "ROY" | "COY";

export type AwardsCandidateStats = {
  id: string;
  name: string;
  teamId: string;
  position?: string;
  isRookie?: boolean;
  teamWins: number;
  passYards?: number;
  passTds?: number;
  ints?: number;
  totalYards?: number;
  totalTds?: number;
  explosivePlays?: number;
  sacks?: number;
  tfl?: number;
  defensiveInts?: number;
  snaps?: number;
  coachExpectationDelta?: number;
  pointDifferential?: number;
};

export type AwardsState = {
  scores: Record<AwardType, Record<string, number>>;
  winners?: Partial<Record<AwardType, string>>;
};

function bump(state: AwardsState, award: AwardType, id: string, amount: number): void {
  if (!state.scores[award]) state.scores[award] = {};
  state.scores[award][id] = Number(((state.scores[award][id] ?? 0) + amount).toFixed(3));
}

export function createAwardsState(): AwardsState {
  return { scores: { MVP: {}, OPOY: {}, DPOY: {}, ROY: {}, COY: {} } };
}

export function updateAwardsRace(state: AwardsState, weekly: AwardsCandidateStats[]): AwardsState {
  const next = createAwardsState();
  next.scores = {
    MVP: { ...state.scores.MVP },
    OPOY: { ...state.scores.OPOY },
    DPOY: { ...state.scores.DPOY },
    ROY: { ...state.scores.ROY },
    COY: { ...state.scores.COY },
  };

  for (const row of weekly) {
    const mvp = SIM_SYSTEMS_CONFIG.awards.mvp;
    const mvpScore = (row.passYards ?? 0) * mvp.passYards + (row.passTds ?? 0) * mvp.passTds + (row.ints ?? 0) * mvp.ints + row.teamWins * mvp.teamWins;
    bump(next, "MVP", row.id, mvpScore);

    const opoy = SIM_SYSTEMS_CONFIG.awards.opoy;
    const opoyScore = (row.totalYards ?? 0) * opoy.yards + (row.totalTds ?? 0) * opoy.tds + (row.explosivePlays ?? 0) * opoy.explosiveBonus;
    bump(next, "OPOY", row.id, opoyScore);

    const dpoy = SIM_SYSTEMS_CONFIG.awards.dpoy;
    const dpoyScore = (row.sacks ?? 0) * dpoy.sacks + (row.defensiveInts ?? 0) * dpoy.ints + (row.tfl ?? 0) * dpoy.tfl + row.teamWins * dpoy.teamDefenseBonus;
    bump(next, "DPOY", row.id, dpoyScore);

    if (row.isRookie) {
      const roy = SIM_SYSTEMS_CONFIG.awards.roy;
      const royScore = (row.totalYards ?? 0) * roy.yards + (row.totalTds ?? 0) * roy.tds + (row.snaps ?? 0) * roy.snaps;
      bump(next, "ROY", row.id, royScore);
    }

    if (String(row.position ?? "").toUpperCase() === "HC") {
      const coy = SIM_SYSTEMS_CONFIG.awards.coy;
      const coyScore = row.teamWins * coy.wins + (row.pointDifferential ?? 0) * coy.pointDiff + (row.coachExpectationDelta ?? 0) * coy.expectationDelta;
      bump(next, "COY", row.id, coyScore);
    }
  }

  return next;
}

export function finalizeAwards(state: AwardsState): Required<AwardsState>["winners"] {
  const winners: Partial<Record<AwardType, string>> = {};
  (Object.keys(state.scores) as AwardType[]).forEach((award) => {
    const entries = Object.entries(state.scores[award] ?? {});
    entries.sort((a, b) => b[1] - a[1]);
    if (entries[0]) winners[award] = entries[0][0];
  });
  return winners as Required<AwardsState>["winners"];
}
