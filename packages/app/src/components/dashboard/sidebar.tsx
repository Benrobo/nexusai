import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Button from "../ui/button";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "../Flex";
import {
  CaretSort,
  CheckCheck,
  Home,
  Inbox,
  Library,
  Package,
  Plus,
} from "../icons";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const sidebarRoutes = [
  {
    title: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
  },
  {
    title: "Inbox",
    key: "inbox",
    path: "/inbox",
  },
  {
    title: "Knowledge Base",
    key: "knowledge_base",
    path: "/knowledge-base",
  },
  {
    title: "Integration",
    key: "integration",
    path: "/integration",
  },
];

export default function DashboardSidebar() {
  const [activePage, setActivePage] = React.useState("dashboard");

  return (
    <div className="w-full h-screen bg-gradient-to-b from-dark-103 from-50% to-70% to-dark-105 px-4 py-5">
      {/* business switcher */}
      <Popover>
        <PopoverTrigger className="w-full">
          <Button
            intent="tertiary"
            className="bg-dark-102 outline outline-[1px] outline-white-400/50 w-full min-h-[50px] py-4 hover:bg-dark-102/90 rounded-xl mb-5"
            childrenClass="w-full"
            rightIcon={<CaretSort size={15} />}
          >
            <FlexRowStartCenter className="w-full py-8">
              <img
                src="https://api.dicebear.com/8.x/rings/svg?seed=med"
                alt="logo"
                width={30}
              />
              <FlexColStart className="w-auto gap-0">
                <span className="text-sm font-ppM text-white-100">Med2.0</span>
                <span className="text-white-300 text-xs font-ppReg">
                  category
                </span>
              </FlexColStart>
            </FlexRowStartCenter>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] mt-0 p-0 rounded-xl bg-dark-102 outline outline-[1px] outline-white-400/50 border-none">
          <FlexColStart className="w-full px-3 py-3 border-b-[.5px] border-b-white-300/30">
            <p className="text-sm font-ppM text-white-300">Businesses</p>
          </FlexColStart>
          <FlexColStart className="w-full mt-0 px-0 py-2">
            <button className="w-full relative border-none outline-none scale-[.95]">
              <FlexRowStartCenter
                className={cn(
                  "w-full py-3 px-2 rounded-xl hover:bg-dark-103/50"
                )}
              >
                <img
                  src="https://api.dicebear.com/8.x/rings/svg?seed=Lucy"
                  alt="logo"
                  width={30}
                />
                <FlexColStart className="w-auto gap-0">
                  <span className="text-sm font-ppM text-white-100">
                    Med2.0
                  </span>
                  <span className="text-white-300 text-xs font-ppReg">
                    category
                  </span>
                </FlexColStart>

                <CheckCheck
                  className={cn(
                    "absolute top-5 right-3",
                    "bg-gradient-to-b from-purple-103 from-10% to-70% to-purple-102 p-1 rounded-full"
                  )}
                  size={20}
                />
              </FlexRowStartCenter>
            </button>
          </FlexColStart>

          <FlexRowStartCenter className="w-full mt-9 px-3 py-4 border-t-[.5px] border-t-white-300/30">
            <button className="border-none outline-none rounded-lg p-2 flex items-center justify-center bg-gradient-to-b from-purple-103 from-10% to-70% to-purple-102">
              <Plus size={15} className="stroke-white-100" />
            </button>
            <span className="text-white-300 font-ppReg text-xs">
              Create Business
            </span>
          </FlexRowStartCenter>
        </PopoverContent>
      </Popover>

      <FlexColStart className="w-full mt-4">
        {sidebarRoutes.map((route) => (
          <Link
            className="w-full"
            to={route.path}
            onClick={() => setActivePage(route.key)}
          >
            <FlexRowStart
              className={cn(
                "w-full py-3 px-3 rounded-lg ",
                activePage === route.key &&
                  "bg-gradient-to-b from-purple-103 from-5% to-70% to-purple-102"
              )}
            >
              {renderIcons(route.key, activePage)}
              <span
                className={cn(
                  "text-sm",
                  activePage === route.key
                    ? "font-ppM text-white-100 "
                    : "font-ppL font-light text-white-400 "
                )}
              >
                {route.title}
              </span>
            </FlexRowStart>
          </Link>
        ))}
      </FlexColStart>
    </div>
  );
}

function renderIcons(name: string, active: string) {
  const mainStyle =
    active === name ? "stroke-white-100" : "stroke-white-400/80";
  let icon = null;

  switch (name) {
    case "dashboard":
      icon = <Home size={20} className={cn(mainStyle, "")} />;
      break;

    case "inbox":
      icon = <Inbox size={20} className={cn(mainStyle, "")} />;
      break;

    case "knowledge_base":
      icon = <Library size={20} className={cn(mainStyle, "")} />;
      break;

    case "integration":
      icon = <Package size={20} className={cn(mainStyle, "")} />;
      break;

    default:
      break;
  }
  return icon;
}
