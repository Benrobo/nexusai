import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Button from "../ui/button";
import { FlexColStart, FlexRowStart, FlexRowStartCenter } from "../Flex";
import {
  CaretSort,
  CPU,
  Home,
  Inbox,
  Library,
  LockOpen,
  Package,
  PhoneIncoming,
} from "../icons";
import { cn, logout } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useDataContext } from "@/context/DataContext";
import usePathname from "@/hooks/usePathname";

const sidebarRoutes = [
  {
    title: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
    isExtensible: false,
  },
  {
    title: "Call logs",
    key: "call-logs",
    path: "/call-logs",
    isExtensible: false,
    notification: true,
  },
  {
    title: "Inbox",
    key: "inbox",
    path: "/inbox",
    isExtensible: false,
  },
  {
    title: "Agents",
    key: "agents",
    path: "/agents",
    isExtensible: true,
  },
];

export default function DashboardSidebar() {
  const { userInfo, unreadLogs } = useDataContext();
  const [activePage, setActivePage] = React.useState("dashboard");
  const pathname = usePathname();

  useEffect(() => {
    const splittedPath = pathname.path.split("/");
    if (splittedPath.length > 1 && splittedPath.includes("inbox")) {
      setActivePage("inbox");
    } else setActivePage(pathname.path.toLowerCase().replace(/^\//g, ""));
  }, [pathname]);

  return (
    <div className="w-full h-screen bg-brown-100 py-5 px-3">
      <Popover>
        <PopoverTrigger className="w-full">
          <Button
            intent="tertiary"
            className="bg-brown-102 outline outline-[1px] outline-white-400/50 w-full min-h-[50px] py-4 hover:bg-brown-102/90 rounded-md mb-2"
            childrenClass="w-full"
            rightIcon={<CaretSort size={15} />}
          >
            <FlexRowStartCenter className="w-full py-8">
              <img
                src={userInfo?.avatar}
                alt="img"
                width={30}
                referrerPolicy="no-referrer"
                className="rounded-full w-8 h-8 bg-white-100/50 object-cover"
              />
              <FlexColStart className="w-full gap-0">
                <span className="text-sm font-ppReg text-white-100">
                  {userInfo?.full_name &&
                  userInfo?.full_name.split(" ").length > 1
                    ? userInfo?.full_name.split(" ")[1]
                    : userInfo?.full_name}
                </span>
              </FlexColStart>
            </FlexRowStartCenter>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] ml-3 mt-0 p-0 rounded-md bg-brown-102 outline outline-[1px] outline-white-400/50 border-none shadow-2xl drop-shadow-2xl">
          <FlexColStart className="w-full px-3 py-3 border-b-[.5px] border-b-white-300/30">
            <p className="text-xs font-ppM text-white-300">
              <span className="text-white-400">Signed in as</span>
              <span className=""> {userInfo?.email}</span>
            </p>
          </FlexColStart>
          <FlexColStart className="w-full mt-0 px-0 py-2">
            <FlexRowStartCenter
              className={cn(
                "w-full py-3 px-2 rounded-xl hover:bg-brown-102/50"
              )}
            >
              {null}
            </FlexRowStartCenter>
          </FlexColStart>

          <FlexColStart className=" mt-9 px-3 py-4 border-t-[.5px] border-t-white-300/30">
            <FlexRowStartCenter
              onClick={logout}
              className="w-full cursor-pointer"
            >
              <LockOpen size={15} className="stroke-white-100" />
              <span className="text-white-300 font-ppReg text-xs">Logout</span>
            </FlexRowStartCenter>
          </FlexColStart>
        </PopoverContent>
      </Popover>

      <FlexColStart className="w-full mt-4">
        {sidebarRoutes.map((route) => {
          let navItem = null;
          navItem = (
            <Link
              className="w-full"
              to={route.path}
              onClick={() => setActivePage(route.key)}
            >
              <FlexRowStart
                className={cn(
                  "w-full py-3 px-3 rounded-lg ",
                  activePage === route.key &&
                    "bg-white-100 text-dark-100 stroke-dark-100"
                )}
              >
                {renderIcons(route.key, activePage)}
                <span
                  className={cn(
                    "text-sm relative",
                    activePage === route.key
                      ? "font-ppM text-dark-100 "
                      : "font-ppL font-light text-white-100 "
                  )}
                >
                  {route.title}

                  {route?.notification && unreadLogs.length > 0 && (
                    <span className="w-[20px] h-[20px] absolute top-0 right-0 translate-x-8 -translate-y-1 bg-red-305 text-[10px] font-ppM flex items-center justify-center rounded-full text-white-100 scale-[.95]">
                      {unreadLogs.length}
                    </span>
                  )}
                </span>
              </FlexRowStart>
            </Link>
          );
          // if (route.isExtensible) {
          //   navItem = (
          //     <FlexColStart className="w-full relative">
          //       <Link
          //         className="w-full"
          //         to={route.path}
          //         onClick={() => {
          //           if (!openNavList && agents.length === 0)
          //             getAgentsMutation.mutate();
          //           setActivePage(route.key);
          //           setOpenNavList(!openNavList);
          //         }}
          //       >
          //         <FlexRowStart className={cn("w-full py-3 px-3 rounded-lg ")}>
          //           {renderIcons(route.key, activePage)}
          //           <span
          //             className={cn(
          //               "text-sm",
          //               activePage === route.key
          //                 ? "font-ppM text-white-100 "
          //                 : "font-ppL font-light text-white-400 "
          //             )}
          //           >
          //             {route.title}
          //           </span>
          //           <ChevronDown
          //             size={15}
          //             className={cn(
          //               "absolute top-3 right-2 transition-all",
          //               openNavList
          //                 ? "stroke-white-100 rotate-360"
          //                 : "stroke-white-400/80 -rotate-180"
          //             )}
          //           />
          //         </FlexRowStart>
          //       </Link>

          //       {/* lists of agents */}
          //       {openNavList ? (
          //         getAgentsMutation.isPending ? (
          //           <FlexRowCenter className="w-full px-9 gap-2">
          //             <Spinner size={15} color={"#fff"} />
          //           </FlexRowCenter>
          //         ) : agents?.length > 0 && !getAgentsMutation.isPending ? (
          //           <div
          //             className={cn(
          //               "min-h-[0px] translate-x-5 -translate-y-2 h-auto border-l-[1px] border-l-white-400/80 px-3 relative rounded-bl-xl "
          //             )}
          //           >
          //             {agents?.map((agent, idx) => (
          //               <Link
          //                 key={idx}
          //                 to={`/agents/${agent.id}`}
          //                 className="w-full rounded-lg relative "
          //                 onClick={() => {
          //                   setActiveAgentPage(agent.id);
          //                 }}
          //               >
          //                 <FlexRowStart
          //                   className={cn(
          //                     "w-full before:content-[''] before:absolute before:top-[2px] before:-left-[12px] before:w-[14px] before:h-[10px] before:bg-none before:border-b-[.5px] before:border-b-white-400/80 before:border-t-white-400/80 before:rounded-bl-none",
          //                     "mb-2",
          //                     idx === agents?.length - 1 &&
          //                       "mb-0 before:top-[5px] before:rounded-bl-xl"
          //                   )}
          //                 >
          //                   <span
          //                     className={cn(
          //                       "text-xs translate-x-2 translate-y-1",
          //                       activeAgentPage === agent.id
          //                         ? "font-ppReg text-white-100/60 "
          //                         : "font-ppL font-light text-white-400 "
          //                     )}
          //                   >
          //                     {agent.name}
          //                   </span>
          //                 </FlexRowStart>
          //               </Link>
          //             ))}
          //           </div>
          //         ) : agents?.length === 0 && !getAgentsMutation.isPending ? (
          //           <FlexRowStartCenter className="w-full px-9 gap-2">
          //             {/* <FlexRowStartCenter className="w-full"> */}
          //             <button className="border-none outline-none rounded-lg p-1 flex items-center justify-center bg-gradient-to-b from-purple-103 from-10% to-70% to-purple-102 scale-[.90]">
          //               <Plus size={15} className="stroke-white-100" />
          //             </button>
          //             <span className="text-xs font-ppReg text-white-400">
          //               No agents
          //             </span>
          //             {/* </FlexRowStartCenter> */}
          //           </FlexRowStartCenter>
          //         ) : null
          //       ) : null}
          //     </FlexColStart>
          //   );
          // } else {
          //   navItem = (
          //     <Link
          //       className="w-full"
          //       to={route.path}
          //       onClick={() => setActivePage(route.key)}
          //     >
          //       <FlexRowStart
          //         className={cn(
          //           "w-full py-3 px-3 rounded-lg ",
          //           activePage === route.key && ""
          //           //   "bg-gradient-to-b from-purple-103 from-5% to-70% to-purple-102"
          //         )}
          //       >
          //         {renderIcons(route.key, activePage)}
          //         <span
          //           className={cn(
          //             "text-sm",
          //             activePage === route.key
          //               ? "font-ppM text-white-100 "
          //               : "font-ppL font-light text-white-400 "
          //           )}
          //         >
          //           {route.title}
          //         </span>
          //       </FlexRowStart>
          //     </Link>
          //   );
          // }
          return navItem;
        })}
      </FlexColStart>
    </div>
  );
}

function renderIcons(name: string, active: string) {
  const mainStyle = active === name ? "stroke-dark-100" : "stroke-white-300/40";
  let icon = null;

  switch (name) {
    case "dashboard":
      icon = <Home size={20} className={cn(mainStyle, "")} />;
      break;

    case "inbox":
      icon = <Inbox size={20} className={cn(mainStyle, "")} />;
      break;

    case "call-logs":
      icon = <PhoneIncoming size={20} className={cn(mainStyle, "")} />;
      break;

    case "knowledge-base":
      icon = <Library size={20} className={cn(mainStyle, "")} />;
      break;

    case "integration":
      icon = <Package size={20} className={cn(mainStyle, "")} />;
      break;

    case "agents":
      icon = (
        <CPU
          size={20}
          className={cn(
            mainStyle,
            active === name ? "fill-dark-100" : "fill-white-300/40"
          )}
        />
      );
      break;

    default:
      break;
  }
  return icon;
}
