import { Routes, Route } from "react-router-dom";
import Finances from "./Finances"; // Reusing existing Finances

export default function ContractsRoutes() {
  return (
     <div className="p-4 text-white">
      <Routes>
        <Route path="/" element={<Finances />} />
        <Route path="summary" element={<Finances />} />
        <Route path="players" element={<div>Player Contracts</div>} />
        <Route path="dead-money" element={<div>Dead Money</div>} />
        <Route path="projection" element={<div>Future Cap Projection</div>} />
      </Routes>
    </div>
  );
}
