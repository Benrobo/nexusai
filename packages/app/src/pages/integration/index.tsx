import useSession from "@/hooks/useSession";
import withAuth from "@/lib/auth-helpers/withAuth";
import React from "react";

function Integration() {
  const data = useSession();
  return <div className="w-full">Integration</div>;
}

export default withAuth(Integration);
