import { Routes, Route } from "react-router-dom";
import StaffManagement from "./StaffManagement"; // This seems to be the strategy page based on current code

export default function StrategyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StaffManagement />} />
    </Routes>
  );
}
