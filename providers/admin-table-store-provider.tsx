"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";
import {
  type AdminTableState,
  createAdminTableStore,
} from "@/hooks/zustand/use-admin-table-store";

export const AdminTableStoreContext =
  createContext<StoreApi<AdminTableState> | null>(null);

export interface AdminTableStoreProviderProps {
  children: ReactNode;
}

export const AdminTableStoreProvider = ({
  children,
}: AdminTableStoreProviderProps) => {
  const storeRef = useRef<StoreApi<AdminTableState>>(null);
  if (!storeRef.current) {
    storeRef.current = createAdminTableStore();
  }

  return (
    <AdminTableStoreContext.Provider value={storeRef.current}>
      {children}
    </AdminTableStoreContext.Provider>
  );
};

export const useAdminTableStore = <T,>(
  selector: (store: AdminTableState) => T,
): T => {
  const adminTableStoreContext = useContext(AdminTableStoreContext);

  if (!adminTableStoreContext) {
    throw new Error(
      `useAdminTableStore must be used within a AdminTableProvider`,
    );
  }

  return useStore(adminTableStoreContext, selector);
};
