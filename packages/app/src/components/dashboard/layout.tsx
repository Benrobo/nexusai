import type { PropsWithChildren } from "react";
import DashboardSidebar from "./sidebar";

interface Props extends PropsWithChildren {}

export default function DashboardLayout(props: Props) {
  return (
    <div className="w-full h-full grid">
      <div className=" grid-cols-1">
        <DashboardSidebar />
      </div>
      <div className="grid-cols-3">{props.children}</div>
    </div>
  );
}
