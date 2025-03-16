"use client";

import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";
import { createAutosaveStore, AutosaveState } from "@/hooks/use-autosave";

export type AutosaveApi = ReturnType<typeof createAutosaveStore>;

const AutosaveContext = createContext<AutosaveApi | undefined>(undefined);

interface AutosaveProviderProps {
  children: ReactNode;
  initialState?: Partial<AutosaveState>;
}

export const AutosaveProvider = ({
  children,
  initialState,
}: AutosaveProviderProps) => {
  const storeRef = useRef<AutosaveApi>(null);

  if (!storeRef.current) {
    storeRef.current = createAutosaveStore(initialState);
  }

  return (
    <AutosaveContext.Provider value={storeRef.current}>
      {children}
    </AutosaveContext.Provider>
  );
};

export const useAutosave = <T,>(selector: (store: AutosaveState) => T): T => {
  const autosaveContext = useContext(AutosaveContext);

  if (!autosaveContext) {
    throw new Error("useAutosave must be used within AutosaveProvider");
  }

  return useStore(autosaveContext, selector);
};
