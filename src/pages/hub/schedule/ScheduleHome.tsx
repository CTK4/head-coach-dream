import { useState } from "react";
import WeekSlate from "@/pages/hub/schedule/WeekSlate";
import TeamSchedule from "@/pages/hub/schedule/TeamSchedule";
import { Button } from "@/components/ui/button";

export default function ScheduleHome() {
  const [tab, setTab] = useState<"WEEK" | "MY">("WEEK");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={tab === "WEEK" ? "default" : "outline"} onClick={() => setTab("WEEK")}>Week Slate</Button>
        <Button variant={tab === "MY" ? "default" : "outline"} onClick={() => setTab("MY")}>My Schedule</Button>
      </div>
      {tab === "WEEK" ? <WeekSlate /> : <TeamSchedule />}
    </div>
  );
}
