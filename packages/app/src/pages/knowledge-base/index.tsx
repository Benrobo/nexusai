import useSession from "@/hooks/useSession";
import React from "react";

export default function KnowledgeBase() {
  const data = useSession();
  return <div className="w-full">KnowledgeBase</div>;
}
