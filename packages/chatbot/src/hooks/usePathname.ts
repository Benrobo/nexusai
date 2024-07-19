import { useState, useEffect } from "react";

export const routeNameMap = {
  "/": "Home",
  "/conversations": "Conversations",
  "/account": "Account",
} as Record<string, string>;

const dynamicRoutes = ["messages", "conversations"];

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
      setFormattedPathname(`${name} | NexusAI`);
    } else {
      const dyPath = pathname.toLowerCase().split("/").slice(-1)[0];
      if (dynamicRoutes.includes(dyPath)) {
        setPathname(dyPath);
        setPath(dyPath);
      }
    }
  });

  return { pathname, path, formattedPathname };
};

export default usePathname;
