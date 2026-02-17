import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPhoneFrameOverride, setPhoneFrameOverride } from "@/config/ui";

export default function PhoneFrameToggle() {
  const [v, setV] = useState<boolean | null>(null);

  useEffect(() => {
    setV(getPhoneFrameOverride());
  }, []);

  if (!import.meta.env.DEV) return null;

  const label = v === null ? "Auto" : v ? "On" : "Off";

  const cycle = () => {
    const next = v === null ? true : v ? false : null;
    setPhoneFrameOverride(next);
    setV(next);
  };

  return (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
      <Badge variant="outline">Phone Frame: {label}</Badge>
      <Button size="sm" variant="secondary" onClick={cycle}>
        Toggle
      </Button>
    </div>
  );
}
