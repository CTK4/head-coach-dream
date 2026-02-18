import { Outlet } from "react-router-dom";

const HubLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Outlet />
    </div>
  );
};

export default HubLayout;
