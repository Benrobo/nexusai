import TopBar from "@/components/landing/navigations/TopBar";
import { Outlet } from "react-router-dom";

export default function AuthRootLayout() {
  return (
    <div className="w-full min-h-screen" suppressHydrationWarning>
      <TopBar />
      <Outlet />
    </div>
  );
}
