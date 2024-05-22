"use client";

import { useDataContext } from "@/context/DataContext";
// import { useRouter } from "next/navigation";

// protect component from unauthorized users that aren't admins
export function OnlyAdmin({ children }: { children: React.ReactNode }) {
  const { userInfo } = useDataContext();
  if (userInfo?.role !== "admin") return null;
  return children;
}

export function OnlyAdminHOF<P>(Component: React.ComponentType<P>) {
  // const ComponentWithAuth = (props: P & any) => {
  //   const { userInfo } = useDataContext();
  //   const router = useRouter();
  //   if (!userInfo) return null;
  //   if (userInfo?.role !== "admin") {
  //     router.push("/app/dashboard");
  //     return null;
  //   }
  //   return <Component {...props} />;
  // };
  // return ComponentWithAuth;
  return Component;
}
