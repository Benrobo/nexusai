import React from "react";
import { FlexColCenter, FlexColStart, FlexRowStart } from "../Flex";
import type { AgentType } from "@nexusai/shared/types";
import { agentTypes } from "@/data/agent";
import { cn } from "@/lib/utils";
import { Box, Cog, ShieldCheck, UnPlug } from "../icons";
import type { AgentActiveTabs } from "@/types";

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
    name: "General",
    key: "general",
  },
  {
    name: "Integrations",
    key: "integrations",
  },
  {
    name: "Protected Numbers",
    key: "protected_numbers",
  },
  {
    name: "Settings",
    key: "settings",
  },
] as { name: string; key: AgentActiveTabs }[];

interface IAgentInfo {
  id?: string;
  name?: string;
  date?: Date;
  type?: AgentType;
  protected_numbers?: {
    id: string;
    phone: string;
    dial_code: string;
    country: string;
  }[];
  integrations?: number;
  contact_number?: string;
  created_at?: Date;
}

export default function AgentSidebar({
  agent_info,
  activeTab,
  setActiveTab,
}: IAgentSidebarProps) {
  if (!agent_info) return null;

  return (
    <FlexColStart className="w-full h-screen max-w-[250px] bg-white-300/80 border-[.5px] border-white-400/40">
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

          if (
            item.key === "protected_numbers" &&
            agent_info.type !== "ANTI_THEFT"
          )
            return null;

          return (
            <button
              key={item.key}
              className="w-full"
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
            </button>
          );
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

function renderIcons(name: string, active: string) {
  const mainStyle = active === name ? "stroke-dark-100" : "stroke-dark-300/80";
  let icon = null;

  switch (name) {
    case "general":
      icon = <Box size={15} className={mainStyle} />;
      break;

    case "integrations":
      icon = <UnPlug size={15} className={mainStyle} />;
      break;

    case "protected_numbers":
      icon = <ShieldCheck size={15} className={mainStyle} />;
      break;

    case "settings":
      icon = <Cog size={15} className={mainStyle} />;
      break;
    default:
      break;
  }
  return icon;
}
