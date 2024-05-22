import { FullPageLoader } from "@/components/Loader";
import { useDataContext } from "@/context/DataContext";
import useSession from "@/hooks/useSession";
import React, { useEffect } from "react";

export default function withAuth<P>(Component: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P & any) => {
    const { setUserInfo } = useDataContext();
    const { status, loading, user, refetch } = useSession();

    useEffect(() => {
      if (!loading) {
        // Avoid infinite redirection loop
        const pathname = window.location.pathname;
        if (status === "unauthorised" && pathname !== "/auth")
          window.location.href = "/auth?error=unauthenticated";
        if (status === "authenticated") refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    useEffect(() => {
      if (status === "authenticated") {
        if (user) {
          setUserInfo && setUserInfo(user);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user, status]);

    if (loading) return <FullPageLoader />;
    if (status === "unauthorised") {
      window.location.href = "/auth?error=unauthenticated";
      return null;
    }

    return <Component {...props} />;
  };

  return ComponentWithAuth;
}
