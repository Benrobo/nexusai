import useSession from "@/hooks/useSession";
import React from "react";

export default function Agents() {
  const data = useSession();
  return <div className="w-full">Agents</div>;
}
