import { useState, useEffect } from "react";

export const routeNameMap = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/knowledge-base": "Knowledge Base",
  "/integration": "Integration",
  "/agents": "Agents",
} as Record<string, string>;

const dynamicRoutes = ["agents"];

const usePathname = () => {
  const [pathname, setPathname] = useState("");
  const [path, setPath] = useState("");
  const [formattedPathname, setFormattedPathname] = useState("");

  useEffect(() => {
    const pathname = window.location.pathname;
    const name = routeNameMap[pathname] ?? null;

    setPath(pathname);

    if (name) {
      setPathname(name);
      setFormattedPathname(`${name} | Bizconnect24`);
    } else {
      const dyPath = pathname.toLowerCase().split("/")[1];
      if (dynamicRoutes.includes(dyPath)) {
        setPathname(dyPath);
        setPath(dyPath);
      }
    }
  }, [window.location.pathname]);

  return { pathname, path, formattedPathname };
};

export default usePathname;
