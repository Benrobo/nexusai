import useSession from "@/hooks/useSession";
import React from "react";

export default function Dashboard() {
  const data = useSession();
  return <div className="w-full">children</div>;
}
