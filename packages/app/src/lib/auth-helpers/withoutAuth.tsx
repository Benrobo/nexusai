import { FullPageLoader } from "@/components/Loader";
import useSession from "@/hooks/useSession";
import React, { useEffect } from "react";

export function withoutAuth<P>(Component: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P & any) => {
    const { status, loading } = useSession();

    useEffect(() => {
      if (!loading) {
        if (status === "authenticated") {
          window.location.href = "/dashboard";
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    if (loading) return <FullPageLoader />;

    return <Component {...props} />;
  };

  return ComponentWithAuth;
}
