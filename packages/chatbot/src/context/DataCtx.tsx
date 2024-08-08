import MessageEventHandlers from "@/helpers/eventHandlers";
import type { AccountInfo } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useMatch } from "react-router-dom";

export const DataCtx = createContext<DataCtxValueType>({} as DataCtxValueType);

interface DataCtxValueType {
  agent_id: string | null;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  authVisible: boolean;
  setAuthVisible: (visible: boolean) => void;
  account: AccountInfo | null;
  setAccount: (account: AccountInfo) => void;
  setChatbotConf: React.Dispatch<React.SetStateAction<IChatbotConf | null>>;
  chatbotConf: IChatbotConf | null;
}

interface IChatbotConf {
  brand_name: string;
  brand_color: string;
  text_color: string;
}

export default function DataCtxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const match = useMatch("/:agent_id/*");
  const params = match?.params;
  const [agent_id, setAgentId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false); // remember to update this
  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [chatbotConf, setChatbotConf] = useState<IChatbotConf | null>(null);

  useEffect(() => {
    if (params?.agent_id) {
      setAgentId(params?.agent_id);
      localStorage.setItem("nexus_agent_id", params?.agent_id);
    }
  }, [params?.agent_id]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // @ts-ignore
      MessageEventHandlers[event.data.type as any](event);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  const ctxValues = {
    agent_id,
    pageLoading,
    setPageLoading,
    authVisible,
    setAuthVisible,
    account,
    setAccount,
    setChatbotConf,
    chatbotConf,
  } satisfies DataCtxValueType;

  return <DataCtx.Provider value={ctxValues}>{children}</DataCtx.Provider>;
}

export function useDataCtx() {
  return useContext(DataCtx);
}
