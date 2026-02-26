import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getPersonnel, getTeamById } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeamRatings } from "@/hooks/useTeamRatings";
import { formatOverallRecordWLT } from "@/lib/teamRatings";

const ownerBadgeClasses: Record<string, string> = {
  PATIENT: "bg-emerald-500/20 text-emerald-100",
  DEMANDING: "bg-amber-500/20 text-amber-100",
  HANDS_OFF: "bg-blue-500/20 text-blue-100",
  MEDDLESOME: "bg-red-500/20 text-red-100",
};

function meterColor(v: number) {
  if (v < 40) return "bg-red-500";
  if (v < 70) return "bg-amber-500";
  return "bg-blue-500";
}

export default function FrontOffice() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";
  const team = getTeamById(String(teamId));
  const { index: teamRatingsIndex } = useTeamRatings();
  const ownerConfidence = Number(state.owner.approval ?? 50);
  const gmRelationship = Number(state.coach.gmRelationship ?? 50);
  const prestige = Math.round(Number(state.reputationComposite ?? 55));
  const personnel = getPersonnel().filter((p) => String(p.teamId) === String(teamId));
  const gm = personnel.find((p) => String(p.role ?? "").toUpperCase() === "GM");
  const owner = personnel.find((p) => String(p.role ?? "").toUpperCase() === "OWNER");

  const record = useMemo(() => {
    const row = state.currentStandings.find((s) => String((s as any).teamId) === String(teamId));
    const wins = Number((row as any)?.wins ?? 0);
    const losses = Number((row as any)?.losses ?? 0);
    return `${wins}-${losses}`;
  }, [state.currentStandings, teamId]);

  const teamRating = teamRatingsIndex[String(teamId)];
  const foundedText = teamRating?.yearFounded ?? "—";
  const allTimeRecordText = teamRating ? formatOverallRecordWLT(teamRating) : "—";
  const teamOvrText = teamRating?.rosterRating ?? "—";

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-20">
      <div className="mx-auto max-w-screen-sm space-y-3 px-4 pt-4 text-sm">
        <h1 className="text-xl font-bold">Front Office</h1>
        <Card className="border-white/10 bg-[#13131A]">
          <CardHeader><CardTitle>Franchise Overview</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{team?.name ?? "Franchise"}</div>
                <div className="text-xs text-muted-foreground">{team?.region ?? "Unknown city"} • Founded {foundedText}</div>
              </div>
              <Badge>{team?.market ?? "MEDIUM"} MARKET</Badge>
            </div>
            <div className="text-xs text-muted-foreground">All-Time {allTimeRecordText} • OVR {teamOvrText} • Championships 0</div>
            <div>
              <div className="mb-1 text-xs">Franchise Prestige</div>
              <div className="h-2 rounded bg-[#252535]"><div className="h-2 rounded bg-blue-500" style={{ width: `${prestige}%` }} /></div>
            </div>
            <div className="text-xs text-muted-foreground">Current season: {record} • Streak: —</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#13131A]">
          <CardHeader><CardTitle>Owner Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><div className="font-semibold">{owner?.fullName ?? "Team Owner"}</div><Badge className={ownerBadgeClasses.HANDS_OFF}>HANDS_OFF</Badge></div>
            <div className="text-xs">Confidence in Coaching Staff: {ownerConfidence}</div>
            <div className="h-2 rounded bg-[#252535]"><div className={`h-2 rounded ${meterColor(ownerConfidence)}`} style={{ width: `${ownerConfidence}%` }} /></div>
            <div className="flex gap-2"><Badge variant="secondary">WINNING</Badge><Badge variant="secondary">REVENUE</Badge><Badge variant="secondary">YOUTH</Badge></div>
            <p className="text-xs text-muted-foreground">A steady stakeholder focused on long-term value and sustained contention windows.</p>
            <details className="text-xs"><summary className="cursor-pointer text-blue-400">What they're watching</summary><p className="mt-1 text-muted-foreground">Ownership expects a playoff push and is monitoring weekly momentum.</p></details>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#13131A]">
          <CardHeader><CardTitle>GM Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><div className="font-semibold">{gm?.fullName ?? "General Manager"}</div><Badge className="bg-blue-500/20 text-white">HYBRID</Badge></div>
            <div className="text-xs">GM Relationship: {gmRelationship}</div>
            <div className="h-2 rounded bg-[#252535]"><div className={`h-2 rounded ${meterColor(gmRelationship)}`} style={{ width: `${gmRelationship}%` }} /></div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground"><div>Draft Emphasis: MEDIUM</div><div>FA Aggression: SELECTIVE</div><div>Collaboration: Adaptive</div></div>
            <p className="text-xs text-muted-foreground">Balances data and traditional scouting to align short-term needs with sustainable roster value.</p>
            <details className="text-xs"><summary className="cursor-pointer text-blue-400">Current priorities</summary><p className="mt-1 text-muted-foreground">The GM is focused on day-two value and adding immediate rotational depth in premium spots.</p></details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
