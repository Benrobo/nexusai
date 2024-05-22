import DashboardLayout from "@/components/dashboard/layout";
import useSession from "@/hooks/useSession";
import withAuth from "@/lib/auth-helpers/withAuth";
import React from "react";

function Dashboard() {
  const data = useSession();
  return (
    <DashboardLayout>
      <div className="w-full">children</div>
    </DashboardLayout>
  );
}

export default withAuth(Dashboard);
