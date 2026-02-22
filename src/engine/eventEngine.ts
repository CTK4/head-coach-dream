import type { GameState } from "@/context/GameContext";
import type { CoachReputation } from "@/engine/reputation";
import { clamp100 } from "@/engine/reputation";

export type CoachBaselines = Pick<
  NonNullable<GameState["coach"]>,
  "repBaseline" | "autonomy" | "ownerTrustBaseline" | "gmRelationship" | "coordDeferenceLevel" | "mediaExpectation" | "lockerRoomCred" | "volatility"
>;

export type EventChoice = {
  label: string;
  outcomeText: string;
  effects: Partial<CoachReputation> & { coachBaselines?: Partial<CoachBaselines> };
  perkPointsAwarded?: number;
};

export type EventContext = {
  coach: GameState["coach"];
  week: number;
  tenureYear: number;
  record: { wins: number; losses: number };
  leagueStandings?: number;
};

export type GameEvent = {
  id: string;
  archetypes: string[];
  triggerCondition: (ctx: EventContext) => boolean;
  title: string;
  body: string;
  choices: EventChoice[];
  repeatable: boolean;
  firedThisSeason?: boolean;
};

export type ResolvedEvent = Omit<GameEvent, "body"> & { body: string };

export function renderEventTemplate(template: string, ctx: EventContext): string {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, rawKey) => {
    const key = String(rawKey).trim();
    if (key === "coach.name") return ctx.coach.name || "Coach";
    if (key === "coach.archetypeId") return ctx.coach.archetypeId || "unknown";
    if (key === "week") return String(ctx.week);
    if (key === "record.wins") return String(ctx.record.wins);
    if (key === "record.losses") return String(ctx.record.losses);
    return "";
  });
}

export function pickEventForContext(events: GameEvent[], ctx: EventContext): ResolvedEvent | null {
  const candidates = events.filter((event) => {
    const forArchetype = event.archetypes.length === 0 || event.archetypes.includes(ctx.coach.archetypeId);
    if (!forArchetype) return false;
    if (!event.repeatable && event.firedThisSeason) return false;
    return event.triggerCondition(ctx);
  });
  if (!candidates.length) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...pick, body: renderEventTemplate(pick.body, ctx) };
}

export function applyEventChoice(coach: GameState["coach"], choice: EventChoice): GameState["coach"] {
  const rep = coach.reputation;
  const nextRep = rep
    ? {
        ...rep,
        leaguePrestige: clamp100(rep.leaguePrestige + (choice.effects.leaguePrestige ?? 0)),
        offCred: clamp100(rep.offCred + (choice.effects.offCred ?? 0)),
        defCred: clamp100(rep.defCred + (choice.effects.defCred ?? 0)),
        leadershipTrust: clamp100(rep.leadershipTrust + (choice.effects.leadershipTrust ?? 0)),
        mediaRep: clamp100(rep.mediaRep + (choice.effects.mediaRep ?? 0)),
        playerRespect: clamp100(rep.playerRespect + (choice.effects.playerRespect ?? 0)),
        autonomyLevel: clamp100(rep.autonomyLevel + (choice.effects.autonomyLevel ?? 0)),
        riskTolerancePerception: clamp100(rep.riskTolerancePerception + (choice.effects.riskTolerancePerception ?? 0)),
        innovationPerception: clamp100(rep.innovationPerception + (choice.effects.innovationPerception ?? 0)),
        ownerPatienceMult: Math.max(0.5, Math.min(1.5, rep.ownerPatienceMult + (choice.effects.ownerPatienceMult ?? 0))),
      }
    : coach.reputation;

  return {
    ...coach,
    reputation: nextRep,
    ...(choice.effects.coachBaselines ?? {}),
    perkPoints: (coach.perkPoints ?? 0) + (choice.perkPointsAwarded ?? 0),
    perkPointLog: choice.perkPointsAwarded
      ? [...(coach.perkPointLog ?? []), { source: choice.outcomeText, amount: choice.perkPointsAwarded, season: Number(coach.tenureYear ?? 1) }]
      : coach.perkPointLog,
  };
}
