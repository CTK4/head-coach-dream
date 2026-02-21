import { Navigate, Route, Routes } from "react-router-dom";
import AssistantHiring from "@/pages/hub/AssistantHiring";
import StaffManagement from "@/pages/hub/StaffManagement";
import { useGame } from "@/context/GameContext";

export default function StaffRoutes() {
  const { state } = useGame();
  const hasOpenAssistantRole = Object.values(state.assistantStaff ?? {}).some((personId) => !personId);

  return (
    <Routes>
      <Route index element={<Navigate to={hasOpenAssistantRole ? "hire" : "management"} replace />} />
      <Route path="hire" element={<AssistantHiring />} />
      <Route path="management" element={<StaffManagement />} />
      <Route path="*" element={<Navigate to="management" replace />} />
    </Routes>
  );
}
