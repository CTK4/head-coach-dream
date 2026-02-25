import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSaves } from "@/lib/saveManager";

export default function Landing() {
  const navigate = useNavigate();
  const saves = useMemo(() => listSaves(), []);
  const latest = saves[0];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.12\"/%3E%3C/svg%3E')" }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-8">
        <h1 className="text-center text-6xl font-black tracking-[0.2em]">HEAD COACH DREAM</h1>

        <div className="mt-10 grid gap-4">
          {latest ? (
            <Card className="border-blue-400/40 bg-blue-500/15">
              <CardContent className="p-5">
                <button type="button" className="w-full text-left" onClick={() => navigate(`/load-save?saveId=${latest.saveId}`)}>
                  <div className="text-xl font-bold">📂 Continue</div>
                  <div className="text-sm text-slate-200 mt-1">{latest.teamName} · Season {latest.season} · {latest.record.wins}-{latest.record.losses}</div>
                </button>
                {saves.length > 1 ? <Button variant="link" className="px-0 mt-2" onClick={() => navigate('/load-save')}>All Saves →</Button> : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-600/40 bg-slate-900/35">
            <CardContent className="p-5">
              <button type="button" className="w-full text-left" onClick={() => navigate('/new-save')}>
                <div className="text-xl font-bold">▶ New Save</div>
                <div className="text-sm text-slate-300 mt-1">Start your coaching career from the beginning</div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
