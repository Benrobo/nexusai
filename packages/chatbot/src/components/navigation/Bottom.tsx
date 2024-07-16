import React, { useEffect } from "react";
import { FlexRowCenter, FlexRowCenterBtw } from "../Flex";
import { Home, MessagesSquare, User } from "../icons";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import usePathname from "@/hooks/usePathname";

const navigations = [
  {
    path: "/",
    name: "home",
    title: "Home",
  },
  {
    path: "/conversations",
    name: "conversations",
    title: "Conversations",
  },
  {
    path: "/account",
    name: "account",
    title: "Account",
  },
];

export default function BottomNavigation() {
  const { pathname } = usePathname();
  const [activePage, setActivePage] = React.useState("home");

  useEffect(() => {
    if (pathname.length > 0) {
      setActivePage(pathname.toLowerCase());
    }
  }, [pathname]);

  return (
    <FlexRowCenter className="w-full h-auto px-4 py-5 bg-dark-100 fixed bottom-0">
      {navigations.map((n) => (
        <Link to={n.path} key={n.name}>
          <button
            className={cn(
              "w-auto px-6 py-4 rounded-full gap-3 flex-center enableBounceEffect overflow-hidden",
              activePage === n.name
                ? "bg-brown-100 text-white-100 stroke-white-100 delay-300"
                : "w-[100px] stroke-white-300"
            )}
            onClick={() => {
              if (activePage === n.name) {
                setActivePage("");
              } else setActivePage(n.name);
            }}
          >
            {renderIcon(n.name)}
            <div
              className={cn(
                activePage === n.name ? "w-auto" : "w-[0px] overflow-hidden"
              )}
            >
              <span className="text-[14px] font-ppM">{n.title}</span>
            </div>
          </button>
        </Link>
      ))}
    </FlexRowCenter>
  );
}

function renderIcon(name: string) {
  let icon = null;
  switch (name) {
    case "home":
      icon = <Home size={25} />;
      break;
    case "conversations":
      icon = <MessagesSquare size={25} />;
      break;
    case "account":
      icon = <User size={25} />;
      break;
    default:
      break;
  }
  return icon;
}
