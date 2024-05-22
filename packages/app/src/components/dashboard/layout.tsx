import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="w-full h-full">
      <Outlet />
    </div>
  );
}
