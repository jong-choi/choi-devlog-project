"use client";

import {
  createAiInlineStore,
  AiInlineState,
} from "@/hooks/zustand/use-ai-inline-store";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type AiInlineStoreApi = ReturnType<typeof createAiInlineStore>;

const AiInlineStoreContext = createContext<AiInlineStoreApi | undefined>(undefined);

interface AiInlineStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AiInlineState>;
}

export const AiInlineStoreProvider = ({
  children,
  initialState,
}: AiInlineStoreProviderProps) => {
  const storeRef = useRef<AiInlineStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createAiInlineStore(initialState);
  }

  return (
    <AiInlineStoreContext.Provider value={storeRef.current}>
      {children}
    </AiInlineStoreContext.Provider>
  );
};

export const useAiInlineStore = <T,>(
  selector: (store: AiInlineState) => T
): T => {
  const aiInlineStoreContext = useContext(AiInlineStoreContext);

  if (!aiInlineStoreContext) {
    throw new Error("useAiInlineStore must be used within AiInlineStoreProvider");
  }

  return useStore(aiInlineStoreContext, selector);
};