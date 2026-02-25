import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { moraleChipColor } from "@/engine/morale";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { PlayerNameLink } from "@/components/players/PlayerNameLink";

export default function RosterPlayers() {
  const { state } = useGame();
  const teamId =
    state.acceptedOffer?.teamId ?? state.userTeamId ?? (state as any).teamId;

  const rows = useMemo(() => {
    if (!teamId) return [];
    return getTeamRosterPlayers(String(teamId))
      .map((p: any) => ({
        playerId: String(p.playerId),
        name: String(p.fullName),
        pos: String(p.pos ?? "UNK").toUpperCase(),
        ovr: Number(p.overall ?? 0),
        age: Number(p.age ?? 0),
        morale: Number(p.morale ?? 70),
      }))
      .sort((a, b) => b.ovr - a.ovr);
  }, [teamId]);

  return (
    <div className="min-w-0">
      <ScreenHeader title="ROSTER" subtitle="Players" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">
            Tap a player to view profile.
          </div>
          <Badge variant="outline">{rows.length}</Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {rows.map((r) => (
                <div
                  key={r.playerId}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                      playerId={r.playerId}
                      name={r.name}
                      pos={r.pos}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold"><PlayerNameLink playerId={r.playerId} name={r.name} pos={r.pos} namespace="roster" /></div>
                      <div className="text-xs text-slate-400">
                        OVR {r.ovr} • Age {r.age}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full border ${moraleChipColor(r.morale)}`}
                  >
                    M {r.morale}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
