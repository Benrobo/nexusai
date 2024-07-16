import { Outlet } from "react-router-dom";
import BottomNavigation from "./navigation/Bottom";

export default function PageLayout() {
  return (
    <div className="w-screen h-screen bg-white-300">
      <Outlet />
      {/* bottom nanvigation */}
      <BottomNavigation />
    </div>
  );
}
