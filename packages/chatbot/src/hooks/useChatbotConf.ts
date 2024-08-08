import { useDataCtx } from "@/context/DataCtx";
import { getChatbotConfig } from "@/http/requests";
import { sendMessageToParentIframe } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

export default async function useChatbotConf() {
  const { agent_id, setChatbotConf, chatbotConf } = useDataCtx();
  const getChatbotConfMut = useMutation({
    mutationFn: (agentId: string) => getChatbotConfig(agentId),
    onSuccess: (data) => {
      const resp = data.data;
      setChatbotConf(resp);

      // send message to iframe
      sendMessageToParentIframe({
        type: "chatbot-conf",
        data: resp,
      });
    },
    onError: (error) => {
      console.error(`Invalid chatbot config: ${error}`);
    },
  });

  const getChatbotConf = useCallback(() => {
    if (agent_id && !chatbotConf) {
      getChatbotConfMut.mutate(agent_id);
    }
  }, [agent_id, chatbotConf]);

  useEffect(() => {
    getChatbotConf();
  }, [getChatbotConf]);

  return { getChatbotConfMut, getChatbotConf, chatbotConf };
}
