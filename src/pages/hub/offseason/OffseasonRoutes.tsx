import { Navigate, Route, Routes } from "react-router-dom";
import Resigning from "./Resigning";
import Combine from "./Combine";
import Tampering from "./Tampering";
import FreeAgency from "./FreeAgency";
import PreDraft from "./PreDraft";
import Draft from "./Draft";
import TrainingCamp from "./TrainingCamp";
import Preseason from "./Preseason";
import CutDowns from "./CutDowns";

export default function OffseasonRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="resigning" replace />} />
      <Route path="resigning" element={<Resigning />} />
      <Route path="combine" element={<Combine />} />
      <Route path="tampering" element={<Tampering />} />
      <Route path="free-agency" element={<FreeAgency />} />
      <Route path="pre-draft" element={<PreDraft />} />
      <Route path="draft" element={<Draft />} />
      <Route path="training-camp" element={<TrainingCamp />} />
      <Route path="preseason" element={<Preseason />} />
      <Route path="cutdowns" element={<CutDowns />} />
      <Route path="cut-downs" element={<Navigate to="/offseason/cutdowns" replace />} />
      <Route path="*" element={<Navigate to="resigning" replace />} />
    </Routes>
  );
}
