"use client";

import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";
import {
  createSidebarStore,
  SidebarState,
} from "@/hooks/zustand/use-sidebar-store";

export type SidebarStoreApi = ReturnType<typeof createSidebarStore>;

const SidebarStoreContext = createContext<SidebarStoreApi | undefined>(
  undefined
);

interface SidebarStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<SidebarState>;
}

export const SidebarStoreProvider = ({
  children,
  initialState, // provider에 초기값 넣을 수 있도록 설정.
}: SidebarStoreProviderProps) => {
  const storeRef = useRef<SidebarStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createSidebarStore(initialState);
  }

  return (
    <SidebarStoreContext.Provider value={storeRef.current}>
      {children}
    </SidebarStoreContext.Provider>
  );
};

export const useSidebarStore = <T,>(
  selector: (store: SidebarState) => T
): T => {
  const sidebarStoreContext = useContext(SidebarStoreContext);

  if (!sidebarStoreContext) {
    throw new Error("useSidebarStore must be used within SidebarStoreProvider");
  }

  return useStore(sidebarStoreContext, selector);
};
