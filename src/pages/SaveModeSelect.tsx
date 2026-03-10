import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/routes/appRoutes";

export default function SaveModeSelect() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-black mb-6">Choose Save Mode</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-blue-500/40 bg-blue-500/10 md:scale-[1.02]">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs font-bold tracking-widest text-blue-300">RECOMMENDED</div>
            <div className="text-2xl font-bold">🎤 Story Mode</div>
            <p className="text-sm text-muted-foreground">Begin your career with a coveted interview from three franchises — Milwaukee, Atlanta, and Birmingham. Answer their questions, negotiate your terms, and choose who to lead.</p>
            <button className="text-blue-300 font-semibold" onClick={() => navigate(ROUTES.storyInterview)}>Start Story Mode →</button>
          </CardContent>
        </Card>
        <Card className="border-slate-600/50">
          <CardContent className="p-6 space-y-2">
            <div className="text-2xl font-bold">🌐 Free Play</div>
            <p className="text-sm text-muted-foreground">Select any franchise and start your career immediately. Full control over your coach creation and team choice.</p>
            <button data-test="start-free-play" className="font-semibold" onClick={() => navigate(ROUTES.freePlaySetup)}>Start Free Play →</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
