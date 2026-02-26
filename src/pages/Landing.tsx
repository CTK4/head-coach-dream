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
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(to bottom, rgba(10,10,15,0.55), rgba(10,10,15,0.85)), url('/Cover.jpeg') center/cover no-repeat",
        backgroundColor: "#0A0A0F",
      }}
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-8">
        <h1 className="text-center text-6xl font-black tracking-[0.2em]">HEAD COACH DREAM</h1>

        <div className="mt-10 grid gap-4">
          {latest ? (
            <Card className="border-blue-300/45 bg-slate-900/55 backdrop-blur-sm">
              <CardContent className="p-5">
                <button type="button" className="w-full text-left" onClick={() => navigate(`/load-save?saveId=${latest.saveId}`)}>
                  <div className="text-xl font-bold">📂 Continue</div>
                  <div className="mt-1 text-sm text-slate-100">
                    {latest.teamName} · Season {latest.season} · {latest.record.wins}-{latest.record.losses}
                  </div>
                </button>
                {saves.length > 1 ? (
                  <Button variant="link" className="mt-2 px-0 text-slate-100" onClick={() => navigate("/load-save")}>
                    All Saves →
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-400/45 bg-slate-900/55 backdrop-blur-sm">
            <CardContent className="p-5">
              <button type="button" className="w-full text-left" onClick={() => navigate("/new-save")}>
                <div className="text-xl font-bold">▶ New Save</div>
                <div className="mt-1 text-sm text-slate-200">Start your coaching career from the beginning</div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
