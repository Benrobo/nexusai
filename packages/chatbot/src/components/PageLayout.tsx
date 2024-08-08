import { Outlet } from "react-router-dom";
import BottomNavigation from "./navigation/Bottom";
import TopNavigation from "./navigation/Top";
import useChatbotConf from "@/hooks/useChatbotConf";

export default function PageLayout() {
  useChatbotConf();
  return (
    <div className="w-screen h-screen bg-white-300 overflow-hidden">
      <TopNavigation />
      <div className="w-full h-full overflow-y-scroll hideScrollBar2">
        <Outlet />
      </div>
      {/* bottom nanvigation */}
      <BottomNavigation />
    </div>
  );
}
