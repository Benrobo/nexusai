import AgentSidebar from "@/components/agents/sidebar";
import { FlexRowStart } from "@/components/Flex";
import type { AgentType } from "@nexusai/shared/types";
import { useState } from "react";
import GeneralPage from "./general";

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

export default function SelectedAgent() {
  const [agentInfo, setAgentInfo] = useState<IAgentInfo | null>({
    type: "ANTI_THEFT",
    name: "Baaymax",
  });

  return (
    <FlexRowStart className="w-full bg-white-200/20">
      {/* sidebar */}
      <AgentSidebar agent_info={agentInfo!} activeTab={"general"} />

      {/* main content */}
      <GeneralPage />
    </FlexRowStart>
  );
}
