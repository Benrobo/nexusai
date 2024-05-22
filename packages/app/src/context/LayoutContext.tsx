"use client";
import React, { createContext, useContext, useState } from "react";

interface LayoutContextValuesProps {
  setActivePage: (page: string) => void;
  activePage: string;
}

export const LayoutContext = createContext<LayoutContextValuesProps>(
  {} as LayoutContextValuesProps
);

function LayoutContextProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState("");
  const providerValues: LayoutContextValuesProps = {
    setActivePage,
    activePage,
  };

  return (
    <LayoutContext.Provider value={providerValues}>
      {children}
    </LayoutContext.Provider>
  );
}

export default LayoutContextProvider;

export function useLayoutContext() {
  return useContext(LayoutContext);
}
