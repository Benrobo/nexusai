import AgentSidebar from "@/components/agents/sidebar";
import { FlexColCenter, FlexRowCenter, FlexRowStart } from "@/components/Flex";
import type { AgentType } from "@nexusai/shared/types";
import { useEffect, useState } from "react";
import GeneralPage from "./general";
import type { AgentActiveTabs, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getAgent } from "@/http/requests";
import { Spinner } from "@/components/Spinner";
import toast from "react-hot-toast";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AgentActiveTabs>("general");
  const params = useParams();
  const agentId = params.id;
  const [error, setError] = useState<string | null>(null);
  const [agentInfo, setAgentInfo] = useState<IAgentInfo | null>(null);
  const [pageloading, setPageLoading] = useState(true);
  const getAgentQuery = useMutation({
    mutationFn: async (agentId: string) => await getAgent(agentId!),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAgentInfo(resp.data);
      setPageLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      setError(err.message);
      setPageLoading(false);
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (agentId) getAgentQuery.mutate(agentId!);
  }, [agentId]);

  if (getAgentQuery.isPending || pageloading) {
    return (
      <FlexRowCenter className="w-full h-full">
        <Spinner color="#000" />
      </FlexRowCenter>
    );
  }

  if (!agentInfo || error) {
    return (
      <FlexColCenter className="w-full h-full">
        <p className="text-dark-100 font-ppReg">No agent found</p>
        <button
          onClick={() => navigate(-1)}
          className="w-auto px-5 py-2 scale-[.90] rounded-md bg-dark-100 text-white-100 font-ppReg text-xs"
        >
          Go back
        </button>
      </FlexColCenter>
    );
  }

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
