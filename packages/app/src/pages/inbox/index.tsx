import useSession from "@/hooks/useSession";
import withAuth from "@/lib/auth-helpers/withAuth";
import React from "react";

function Inbox() {
  const data = useSession();
  return <div className="w-full">Inbox</div>;
}

export default withAuth(Inbox);
