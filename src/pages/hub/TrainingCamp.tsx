import { useGame } from "@/context/GameContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { confirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TrainingCamp() {
  const { dispatch } = useGame();
  const settings = useUserSettings();

  const handleContinue = () => {
    if (!confirmAutoAdvance(settings, "Advance to the next stage?")) return;
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Camp</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "DEPTH_RESET_TO_BEST" })}>
            Reset to Best
          </Button>
          <Button variant="secondary" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <div>Installs, battles, injuries, morale/chemistry hooks will live here.</div>
        <div>For now: stage screen exists + flow is correct.</div>
      </CardContent>
    </Card>
  );
}
