import React, { ReactNode, createContext, useContext, useState } from "react";
import { UserInfo, type IAgents } from "@/types";

interface ContextValuesType {
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  globalLoadingState: boolean;
  setGlobalLoadingState: React.Dispatch<React.SetStateAction<boolean>>;
  agents: IAgents[];
  setAgents: React.Dispatch<React.SetStateAction<IAgents[]>>;
}

export const DataContext = createContext<ContextValuesType>(
  {} as ContextValuesType
);

function DataContextProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<IAgents[]>([]);

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
