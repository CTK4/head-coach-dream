import type { PostseasonTeamResult } from "@/engine/postseason";

export function playoffFinishRank(result: PostseasonTeamResult): number {
  if (!result.madePlayoffs) return 0;
  if (result.isChampion) return 5;
  if (result.eliminatedIn === "SUPER_BOWL") return 4;
  if (result.eliminatedIn === "CONFERENCE") return 3;
  if (result.eliminatedIn === "DIVISIONAL") return 2;
  return 1;
}
