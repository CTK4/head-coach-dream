import { OFFENSE_PLAYBOOK_PLAY_IDS, OFFENSE_PLAYS_BY_ID, type RawPlay } from "@/data/playbooks/offenseExpandedPlaybookData";
import type { ExpandedPlay } from "@/engine/playbooks/types";

const EMPTY_DIAGRAM: ExpandedPlay["diagram"] = { players: [], paths: [] };

export function normalizePlayToDiagram(rawPlay: RawPlay): ExpandedPlay["diagram"] {
  if (rawPlay.diagram) return rawPlay.diagram;

  const routePaths = (rawPlay.routes ?? []).map((route) => ({
    role: route.role,
    points: route.points,
    style: route.style ?? "solid",
    kind: "route" as const,
  }));

  const assignmentPaths = (rawPlay.assignments ?? []).map((assignment) => ({
    role: assignment.role,
    points: assignment.points,
    style: assignment.style ?? "solid",
    kind: assignment.kind,
  }));

  return {
    players: [],
    paths: [...routePaths, ...assignmentPaths],
  };
}

export function getPlaybookPlaysExpanded(playbookId: string): ExpandedPlay[] {
  const playIds = OFFENSE_PLAYBOOK_PLAY_IDS[playbookId] ?? [];

  return playIds
    .map((playId) => OFFENSE_PLAYS_BY_ID[playId])
    .filter((play): play is RawPlay => Boolean(play))
    .map((play) => ({
      playId: play.playId,
      name: play.name,
      type: play.type,
      family: play.family,
      tags: play.tags,
      diagram: normalizePlayToDiagram(play) ?? EMPTY_DIAGRAM,
    }));
}
