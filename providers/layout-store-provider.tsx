"use client";

import { createLayoutStore, LayoutState } from "@/hooks/use-layout-store";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type LayoutStoreApi = ReturnType<typeof createLayoutStore>;

const LayoutStoreContext = createContext<LayoutStoreApi | undefined>(undefined);

interface LayoutStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<LayoutState>;
}

export const LayoutStoreProvider = ({
  children,
  initialState, // provider에 초기값 넣을 수 있도록 설정.
}: LayoutStoreProviderProps) => {
  const storeRef = useRef<LayoutStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createLayoutStore(initialState);
  }

  return (
    <LayoutStoreContext.Provider value={storeRef.current}>
      {children}
    </LayoutStoreContext.Provider>
  );
};

export const useLayoutStore = <T,>(selector: (store: LayoutState) => T): T => {
  const layoutStoreContext = useContext(LayoutStoreContext);

  if (!layoutStoreContext) {
    throw new Error("useLayoutStore must be used within LayoutStoreProvider");
  }

  return useStore(layoutStoreContext, selector);
};
