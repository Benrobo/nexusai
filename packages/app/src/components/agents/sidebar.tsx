import React from "react";
import { FlexColCenter, FlexColStart, FlexRowStart } from "../Flex";
import type { AgentType } from "@nexusai/shared/types";
import { agentTypes } from "@/data/agent";

interface IAgentSidebarProps {
  agent_info: {
    name?: string;
    type?: AgentType;
  };
}

export default function AgentSidebar({ agent_info }: IAgentSidebarProps) {
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
