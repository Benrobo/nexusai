import AgentSidebar from "@/components/agents/sidebar";
import { FlexRowStart } from "@/components/Flex";
import type { AgentType } from "@nexusai/shared/types";
import { useState } from "react";
import GeneralPage from "./general";
import type { AgentActiveTabs } from "@/types";

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
  const [activeTab, setActiveTab] = useState<AgentActiveTabs>("general");
  const [agentInfo, setAgentInfo] = useState<IAgentInfo | null>({
    type: "ANTI_THEFT",
    name: "Baaymax",
  });

  return (
    <FlexRowStart className="w-full bg-white-200/20">
      {/* sidebar */}
      <AgentSidebar
        agent_info={agentInfo!}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* main content */}
      {activeTab === "general" && <GeneralPage />}
    </FlexRowStart>
  );
}
