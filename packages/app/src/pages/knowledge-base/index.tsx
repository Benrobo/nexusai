import useSession from "@/hooks/useSession";
import withAuth from "@/lib/auth-helpers/withAuth";
import React from "react";

function KnowledgeBase() {
  const data = useSession();
  return <div className="w-full">KnowledgeBase</div>;
}

export default withAuth(KnowledgeBase);
