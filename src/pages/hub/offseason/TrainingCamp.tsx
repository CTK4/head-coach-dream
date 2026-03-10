import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getPositionLabel,
  getTrainingCampInstallFocusLabel,
  getTrainingCampIntensityLabel,
} from "@/lib/displayLabels";

const POSITION_FOCUS_OPTIONS = ["NONE", "QB", "OL", "DL", "DB", "WR", "RB", "LB", "TE"] as const;

export default function TrainingCamp() {
  const { state, dispatch } = useGame();
  const settings = state.offseasonData.camp.settings;

  const setSetting = (key: "intensity" | "installFocus" | "positionFocus", value: string) => {
    dispatch({ type: "CAMP_SET", payload: { settings: { [key]: value } } });
  };

  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "TRAINING_CAMP" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">Training Camp</div>
            <div className="text-sm text-muted-foreground">Set camp emphasis (feeds later systems).</div>
          </div>
          <Badge variant="outline">Step 7</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Intensity</div>
              <Select value={settings.intensity} onValueChange={(value) => setSetting("intensity", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["LOW", "NORMAL", "HIGH"] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {getTrainingCampIntensityLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Install Focus</div>
              <Select value={settings.installFocus} onValueChange={(value) => setSetting("installFocus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["BALANCED", "OFFENSE", "DEFENSE"] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {getTrainingCampInstallFocusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Position Focus</div>
              <Select value={settings.positionFocus} onValueChange={(value) => setSetting("positionFocus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_FOCUS_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {getPositionLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Complete to unlock preseason games.</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={completeStep}>
              Complete Step
            </Button>
            <Button onClick={next} disabled={!state.offseason.stepsComplete.TRAINING_CAMP}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
