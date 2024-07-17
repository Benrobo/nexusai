import type { ChatBotAgentConfig } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const DataCtx = createContext<DataCtxValueType>({} as DataCtxValueType);

interface DataCtxValueType {
  agent_id: string | null;
  chatbotConfig: ChatBotAgentConfig | null;
  setChatbotConfig: (config: ChatBotAgentConfig) => void;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  authVisible: boolean;
  setAuthVisible: (visible: boolean) => void;
}

export default function DataCtxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const agent_id_query = searchParams.get("agent_id");
  const [agent_id, setAgentId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false); // remember to update this
  const [chatbotConfig, setChatbotConfig] = useState<ChatBotAgentConfig | null>(
    null
  );
  const [authVisible, setAuthVisible] = useState<boolean>(false);

  useEffect(() => {
    if (agent_id_query) {
      setAgentId(agent_id_query);
    }
  }, [agent_id_query]);

  useEffect(() => {
    // window.addEventListener("message", (ev) => {
    //   console.log({ ev });
    // });
    // return () => {
    //   window.removeEventListener("message", () => {});
    // };
  }, []);

  const ctxValues = {
    agent_id,
    chatbotConfig,
    setChatbotConfig,
    pageLoading,
    setPageLoading,
    authVisible,
    setAuthVisible,
  } satisfies DataCtxValueType;

  return <DataCtx.Provider value={ctxValues}>{children}</DataCtx.Provider>;
}

export function useDataCtx() {
  return useContext(DataCtx);
}
