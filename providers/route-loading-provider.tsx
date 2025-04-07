"use client";

import {
  createRouteLoadingStore,
  RouteLoadingState,
} from "@/hooks/zustand/use-route-loading-store";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type RouteLoadingApi = ReturnType<typeof createRouteLoadingStore>;

const RouteLoadingContext = createContext<RouteLoadingApi | undefined>(
  undefined
);

interface RouteLoadingProviderProps {
  children: ReactNode;
  initialState?: Partial<RouteLoadingState>;
}

export const RouteLoadingProvider = ({
  children,
  initialState,
}: RouteLoadingProviderProps) => {
  const storeRef = useRef<RouteLoadingApi>(null);

  if (!storeRef.current) {
    storeRef.current = createRouteLoadingStore(initialState);
  }

  return (
    <RouteLoadingContext.Provider value={storeRef.current}>
      {children}
    </RouteLoadingContext.Provider>
  );
};

export const useRouteLoadingStore = <T,>(
  selector: (store: RouteLoadingState) => T
): T => {
  const routeLoadingContext = useContext(RouteLoadingContext);

  if (!routeLoadingContext) {
    throw new Error(
      "useRouteLoadingStore must be used within RouteLoadingProvider"
    );
  }

  return useStore(routeLoadingContext, selector);
};
