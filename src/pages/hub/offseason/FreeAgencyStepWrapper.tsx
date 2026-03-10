import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import FreeAgency from "@/pages/hub/FreeAgency";

export default function FreeAgencyStepWrapper() {
  const { state, dispatch } = useGame();

  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "FREE_AGENCY" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="space-y-4 pb-4">
      <FreeAgency />
      <div className="px-4 md:px-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Use all resolves or finish early, then complete this offseason step.</div>
            <div className="flex gap-2">
              <Button variant="outline" className="min-h-11" onClick={completeStep}>
                Complete Step
              </Button>
              <Button className="min-h-11" onClick={next} disabled={!state.offseason.stepsComplete.FREE_AGENCY}>
                Next →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
