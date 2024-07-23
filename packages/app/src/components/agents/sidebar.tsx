import { FlexColCenter, FlexColStart, FlexRowStart } from "../Flex";
import type { AgentType } from "@/types";
import { agentTypes } from "@/data/agent";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Box,
  Cog,
  Library,
  Pallete,
  ShieldCheck,
  UnPlug,
} from "../icons";
import type { AgentActiveTabs } from "@/types";
import { Link, useLocation } from "react-router-dom";

interface IAgentSidebarProps {
  agent_info: {
    name?: string;
    type?: AgentType;
  };
  activeTab: AgentActiveTabs;
  setActiveTab: (tab: AgentActiveTabs) => void;
}

const sidebarItems = [
  {
    name: "Integrations",
    key: "integrations",
  },
  {
    name: "Knowledge Base",
    key: "knowledge-base",
  },
  {
    name: "Appearance",
    key: "appearance",
  },
  {
    name: "Settings",
    key: "settings",
  },
] satisfies { name: string; key: AgentActiveTabs }[];

export default function AgentSidebar({
  agent_info,
  activeTab,
  setActiveTab,
}: IAgentSidebarProps) {
  if (!agent_info) return null;

  return (
    <FlexColStart className="w-full h-screen max-w-[250px] bg-white-300/80 border-[.5px] border-white-400/40 gap-0">
      <Link to="/agents" className="mt-2 px-4">
        <ArrowLeft size={20} color="#000" />
      </Link>
      <FlexRowStart className="w-auto px-3 py-4 border-b-[1px] border-b-white-400/30 bg-white-300">
        <FlexColCenter className="w-auto border-[1px] border-white-400 bg-white-100 rounded-full p-1 relative">
          {renderMiniAgentIcon(agent_info?.type!)}
        </FlexColCenter>
        <FlexColStart className="w-auto gap-0 ml-1">
          <h1 className="text-md font-ppB font-light text-dark-100">
            {agent_info?.name!}
          </h1>
          <p className="text-[10px] font-ppReg font-light text-white-400">
            {agentTypes.find((ag) => ag.type === agent_info?.type!)?.desc}
          </p>
        </FlexColStart>
      </FlexRowStart>

      <FlexColStart className="w-full h-full px-3 py-2">
        {sidebarItems.map((item) => {
          if (item.key === "integrations" && agent_info.type === "ANTI_THEFT")
            return null;

          const location = useLocation();
          const search = location.search;
          const param = new URLSearchParams(search);

          param.delete("tab");
          param.set("tab", item.key);

          const url = `${location.pathname}?${param.toString()}`;

          let tabComp: React.ReactNode | null = null;

          // No knowledge base is needed for anti-theft agent's
          if (
            agent_info.type === "ANTI_THEFT" &&
            item.key === "knowledge-base"
          ) {
            tabComp = null;
          } else if (
            agent_info.type !== "CHATBOT" &&
            item.key === "appearance"
          ) {
            tabComp = null;
          } else {
            tabComp = (
              <Link
                key={item.key}
                className="w-full"
                to={url}
                onClick={() => setActiveTab(item.key)}
              >
                <FlexRowStart
                  className={cn(
                    "w-full py-3 px-3 rounded-lg ",
                    activeTab === item.key &&
                      "bg-white-200/50 text-dark-100 stroke-dark-100"
                  )}
                >
                  {renderIcons(item.key, activeTab)}
                  <span
                    className={cn(
                      "text-xs",
                      activeTab === item.key
                        ? "font-ppL font-bold text-dark-100 "
                        : "font-ppL font-light text-dark-300/80 "
                    )}
                  >
                    {item.name}
                  </span>
                </FlexRowStart>
              </Link>
            );
          }

          return tabComp;
        })}
      </FlexColStart>
    </FlexColStart>
  );
}

function renderMiniAgentIcon(type: AgentType) {
  const url = agentTypes.find((ag) => ag.type === type)?.img;

  if (!url) return null;

  return (
    <img
      src={url}
      className="rounded-full scale-[.90] bg-white-100"
      alt={"agent-avatar"}
      width={40}
      height={40}
    />
  );
}

function renderIcons(name: AgentActiveTabs, active: string) {
  const mainStyle = active === name ? "stroke-dark-100" : "stroke-dark-300/80";
  let icon = null;

  switch (name) {
    case "general":
      icon = <Box size={15} className={mainStyle} />;
      break;

    case "integrations":
      icon = <UnPlug size={15} className={mainStyle} />;
      break;

    case "appearance":
      icon = <Pallete size={15} className={mainStyle} />;
      break;

    case "protected-numbers":
      icon = <ShieldCheck size={15} className={mainStyle} />;
      break;

    case "knowledge-base":
      icon = <Library size={15} className={mainStyle} />;
      break;

    case "settings":
      icon = <Cog size={15} className={mainStyle} />;
      break;
    default:
      break;
  }
  return icon;
}
