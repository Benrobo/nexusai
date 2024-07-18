import { useDataCtx } from "@/context/DataCtx";
import { getChatbotConfig } from "@/http/requests";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";

type ChatbotConfig = {
  id: string;
  agentId: string;
  brand_name: string | null;
  logo: string | null;
  brand_color: string | null;
  text_color: string | null;
  welcome_message: string | null;
  suggested_questions: string | null;
};

export default function useChatbotConfig() {
  const { agent_id } = useDataCtx();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<ChatbotConfig | null>(null);
  const getChatbotConfigMut = useMutation({
    mutationFn: async (id: string) => await getChatbotConfig(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setConfig(resp.data as ChatbotConfig);
      setLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.error(err.message);
      setLoading(false);
    },
  });

  React.useEffect(() => {
    if (agent_id) {
      setLoading(true);
      getChatbotConfigMut.mutate(agent_id);
    }
  }, [agent_id, loading]);

  return {
    loading,
    config,
  };
}
