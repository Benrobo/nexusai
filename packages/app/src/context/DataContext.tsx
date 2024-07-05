import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserInfo, type IAgents, type ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { getUnreadLogs } from "@/http/requests";

interface ContextValuesType {
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  globalLoadingState: boolean;
  setGlobalLoadingState: React.Dispatch<React.SetStateAction<boolean>>;
  agents: IAgents[];
  setAgents: React.Dispatch<React.SetStateAction<IAgents[]>>;
  unreadLogs: string[];
  setUnreadLogs: React.Dispatch<React.SetStateAction<string[]>>;
  refetchUnreadlogs: () => void;
}

export const DataContext = createContext<ContextValuesType>(
  {} as ContextValuesType
);

function DataContextProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<IAgents[]>([]);
  const [unreadLogs, setUnreadLogs] = useState<string[]>([]);
  const getUnreadLogsQuery = useMutation({
    mutationFn: async () => getUnreadLogs(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setUnreadLogs(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.error("Error fetching unread logs", err);
    },
  });

  useEffect(() => {
    getUnreadLogsQuery.mutate();
  }, []);

  const refetchUnreadlogs = () => {
    getUnreadLogsQuery.mutate();
  };

  // this should be used for global loading state (e.g. when fetching data) that
  // should be used across the app/pages or pages that depends on this state.
  const [globalLoadingState, setGlobalLoadingState] = useState(false);

  const contextValues: ContextValuesType = {
    userInfo,
    setUserInfo,
    sidebarOpen,
    setSidebarOpen,
    setGlobalLoadingState,
    globalLoadingState,
    agents,
    setAgents,
    unreadLogs,
    setUnreadLogs,
    refetchUnreadlogs,
  };

  return (
    <DataContext.Provider value={contextValues}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContextProvider;

export function useDataContext() {
  return useContext(DataContext);
}
