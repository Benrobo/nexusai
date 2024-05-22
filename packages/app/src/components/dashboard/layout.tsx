import DashboardSidebar from "./sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="w-auto h-full flex items-start justify-start">
      <div className="w-full h-full max-w-[250px]">
        <DashboardSidebar />
      </div>
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
}
