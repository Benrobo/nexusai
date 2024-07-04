import withAuth from "@/lib/auth-helpers/withAuth";
import DashboardSidebar from "./sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="w-auto h-full flex items-start justify-start">
      <div className="w-full h-full max-w-[220px]">
        <DashboardSidebar />
      </div>
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
}

export default withAuth(DashboardLayout);
