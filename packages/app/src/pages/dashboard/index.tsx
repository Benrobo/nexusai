import useSession from "@/hooks/useSession";
import withAuth from "@/lib/auth-helpers/withAuth";
import React from "react";

function Dashboard() {
  const data = useSession();
  return <div className="w-full">children</div>;
}

export default withAuth(Dashboard);
