import { Outlet } from "react-router-dom";
import BottomNavigation from "./navigation/Bottom";
import TopNavigation from "./navigation/Top";

export default function PageLayout() {
  return (
    <div className="w-screen h-screen bg-white-300 overflow-hidden">
      <TopNavigation />
      <Outlet />
      {/* bottom nanvigation */}
      <BottomNavigation />
    </div>
  );
}
