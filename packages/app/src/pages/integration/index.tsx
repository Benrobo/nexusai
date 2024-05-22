import useSession from "@/hooks/useSession";
import React from "react";

export default function Integration() {
  const data = useSession();
  return <div className="w-full">Integration</div>;
}
