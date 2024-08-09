import AgentSidebar from "@/components/agents/sidebar";
import {
  FlexColCenter,
  FlexRowCenter,
  FlexRowCenterBtw,
  FlexRowStart,
} from "@/components/Flex";
import type { AgentType } from "@/types";
import { useEffect, useState } from "react";
import GeneralPage from "./general";
import type { AgentActiveTabs, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { activateAgent, getAgent } from "@/http/requests";
import { Spinner } from "@/components/Spinner";
import toast from "react-hot-toast";
import SettingsPage from "./settings";
import Integrations from "./integrations";
import KnowledgeBase from "@/components/agents/knowledge-base";
import Appearance from "./appearance";

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
  activated: boolean;
}

export default function SelectedAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search.split("=");
  const query = search[search.length - 1];
  const [activeTab, setActiveTab] = useState<AgentActiveTabs>(
    (query as AgentActiveTabs) ?? "general"
  );
  const params = useParams();
  const agentId = params.id;
  const [error, setError] = useState<string | null>(null);
  const [agentInfo, setAgentInfo] = useState<IAgentInfo | null>(null);
  const [pageloading, setPageLoading] = useState(true);
  const [_, setActivatingAgent] = useState(false);
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
    <>
      {!agentInfo?.activated && (
        <FlexRowCenterBtw className="w-full top-0 left-0 bg-yellow-100 py-1 px-3 font-ppReg text-xs text-dark-100">
          <span>
            ⚠️ Your agent is currently inactive. Activate it to start receiving
            calls.
          </span>
          <button
            className="w-[90px] h-[30px] bg-dark-100 px-3 text-xs font-ppReg drop-shadow disabled:bg-dark-100/50 disabled:text-white-100 enableBounceEffect outline-none border-none text-white-100 rounded-md"
            disabled={agentInfo?.activated}
            onClick={() => {
              setActivatingAgent(true);
              toast.promise(activateAgent(agentId!), {
                loading: "Activating agent..",
                success: () => {
                  setActivatingAgent(false);
                  getAgentQuery.mutate(agentId!);
                  return "Agent activated";
                },
                error: (error: any) => {
                  setActivatingAgent(false);
                  const err = error.response.data as ResponseData;
                  return err.message ?? "Failed to activate agent";
                },
              });
            }}
          >
            Activate
          </button>
        </FlexRowCenterBtw>
      )}
      <FlexRowStart className="w-full h-full bg-white-200/20  overflow-y-hidden p-0 m-0 gap-0">
        {/* sidebar */}
        <AgentSidebar
          agent_info={agentInfo!}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* main content */}
        <div className="w-full h-full overflow-auto relative">
          {activeTab === "general" && <GeneralPage />}
          {activeTab === "settings" && (
            <SettingsPage agent_id={agentId!} type={agentInfo.type!} />
          )}
          {activeTab === "appearance" && (
            <Appearance agent_id={agentId!} type={agentInfo.type!} />
          )}
          {activeTab === "knowledge-base" && (
            <KnowledgeBase
              refetchAgentInfo={() => {
                getAgentQuery.mutate(agentId!);
              }}
            />
          )}
          {activeTab === "integrations" && <Integrations />}
        </div>
      </FlexRowStart>
    </>
  );
}
