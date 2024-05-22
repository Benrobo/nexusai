import useSession from "@/hooks/useSession";
import React from "react";

export default function Inbox() {
  const data = useSession();
  return <div className="w-full">Inbox</div>;
}
