import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDensityOverride, setDensityOverride, type DensityMode } from "@/config/ui";

export default function DensityToggle() {
  const [mode, setMode] = useState<DensityMode>("auto");

  useEffect(() => {
    setMode(getDensityOverride());
  }, []);

  if (!import.meta.env.DEV) return null;

  const cycle = () => {
    const next: DensityMode = mode === "auto" ? "compact" : mode === "compact" ? "comfortable" : "auto";
    setDensityOverride(next);
    setMode(next);
  };

  return (
    <div className="fixed left-3 top-3 z-50 flex items-center gap-2">
      <Badge variant="outline">Density: {mode}</Badge>
      <Button size="sm" variant="secondary" onClick={cycle}>
        Toggle
      </Button>
    </div>
  );
}
