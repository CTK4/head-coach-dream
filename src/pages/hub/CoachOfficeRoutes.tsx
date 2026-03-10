import { Navigate, Route, Routes } from "react-router-dom";
import CoachOffice from "@/pages/hub/CoachOffice";
import StaffProfile from "@/pages/hub/staff/StaffProfile";
import UserProfile from "@/pages/hub/staff/UserProfile";

export default function CoachOfficeRoutes() {
  return (
    <Routes>
      <Route index element={<CoachOffice />} />
      <Route path="my-profile" element={<UserProfile />} />
      <Route path="staff/:personId" element={<StaffProfile />} />
      <Route path="*" element={<Navigate to="/coachs-office" replace />} />
    </Routes>
  );
}
