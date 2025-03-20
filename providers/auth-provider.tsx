"use client";

import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";
import { createAuthStore, AuthState } from "@/hooks/use-auth-store";

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

interface AuthStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AuthState>;
}

export const AuthStoreProvider = ({
  children,
  initialState, // provider에 초기값 넣을 수 있도록 설정.
}: AuthStoreProviderProps) => {
  const storeRef = useRef<AuthStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createAuthStore(initialState);
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

export const useAuthStore = <T,>(selector: (store: AuthState) => T): T => {
  const authStoreContext = useContext(AuthStoreContext);

  if (!authStoreContext) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }

  return useStore(authStoreContext, selector);
};
