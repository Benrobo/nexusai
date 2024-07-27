import React, { useEffect } from "react";
import { FlexColCenter, FlexRowCenter } from "../Flex";
import { Home, MessagesSquare, User } from "../icons";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import usePathname from "@/hooks/usePathname";
import NexusTradeMark from "../NexusTradeMark";

const navigations = [
  {
    path: "",
    name: "home",
    title: "Home",
  },
  {
    path: "conversations",
    name: "conversations",
    title: "Conversations",
  },
  {
    path: "account",
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
    <FlexColCenter
      className="w-full h-auto pt-5 pb-5 bg-white-100 fixed bottom-0 gap-0"
      style={{
        backdropFilter: "blur(10px)",
        // chatbot-config here
      }}
    >
      <FlexRowCenter className="w-full px-4 gap-10">
        {navigations.map((n) => (
          <Link to={n.path} key={n.name}>
            <button
              className={cn(
                "w-auto px-6 py-3 rounded-full gap-3 flex-center enableBounceEffect overflow-hidden",
                activePage === n.name
                  ? "bg-white-300 text-dark-100"
                  : "w-[100px]"
              )}
              onClick={() => {
                setActivePage(n.name);
              }}
              style={
                {
                  // chatbot-config here
                }
              }
            >
              {renderIcon(n.name, {
                stroke: activePage === n.name ? "#000" : "#777",
              })}
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
      <NexusTradeMark />
    </FlexColCenter>
  );
}

function renderIcon(name: string, customStyle?: React.CSSProperties) {
  let icon = null;
  switch (name) {
    case "home":
      icon = <Home size={20} style={customStyle} />;
      break;
    case "conversations":
      icon = <MessagesSquare size={20} style={customStyle} />;
      break;
    case "account":
      icon = <User size={20} style={customStyle} />;
      break;
    default:
      break;
  }
  return icon;
}
