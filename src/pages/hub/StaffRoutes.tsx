import { Routes, Route } from "react-router-dom";

export default function StaffRoutes() {
  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Staff</h2>
      <Routes>
        <Route path="/" element={<div>Staff Home</div>} />
        <Route path="current" element={<div>Current Staff</div>} />
        <Route path="market" element={<div>Staff Market</div>} />
      </Routes>
    </div>
  );
}
