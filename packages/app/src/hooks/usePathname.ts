import { useState, useEffect } from "react";

export const routeNameMap = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/knowledge-base": "Knowledge Base",
  "/integration": "Integration",
  "/agents": "Agents",
} as Record<string, string>;

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
    }
  });

  return { pathname, path, formattedPathname };
};

export default usePathname;
