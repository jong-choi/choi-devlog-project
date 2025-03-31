"use client";

import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";
import {
  createSummaryStore,
  SummaryState,
} from "@/hooks/zustand/use-summary-store";

export type SummaryApi = ReturnType<typeof createSummaryStore>;

const SummaryContext = createContext<SummaryApi | undefined>(undefined);

interface SummaryProviderProps {
  children: ReactNode;
  initialState?: Partial<SummaryState>;
}

export const SummaryProvider = ({
  children,
  initialState,
}: SummaryProviderProps) => {
  const storeRef = useRef<SummaryApi>(null);

  if (!storeRef.current) {
    storeRef.current = createSummaryStore(initialState);
  }

  return (
    <SummaryContext.Provider value={storeRef.current}>
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummary = <T,>(selector: (store: SummaryState) => T): T => {
  const summaryContext = useContext(SummaryContext);

  if (!summaryContext) {
    throw new Error("useSummary must be used within SummaryProvider");
  }

  return useStore(summaryContext, selector);
};
