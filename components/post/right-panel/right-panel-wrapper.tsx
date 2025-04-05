"use client";

import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { SidebarToggle } from "@ui/sidebar-toggle";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

export function RightPanelWrapper({ children }: { children: ReactNode }) {
  const { rightPanelOpen, setRightPanelOpen } = useLayoutStore(
    useShallow((state) => ({
      rightPanelOpen: state.rightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col flex-shrink-0 bg-slate-50 dark:bg-slate-900 xl:bg-glass-bg dark:xl:bg-transparent lg:backdrop-blur-sm border-l border-border shadow-sm ",
        rightPanelOpen ? "w-64 2xl:w-96" : "w-10",
        "lg:absolute lg:top-0 lg:right-0 lg:z-50 xl:static xl:z-auto"
      )}
    >
      {!rightPanelOpen && (
        <>
          <SidebarToggle onClick={() => setRightPanelOpen(true)} reverse />
        </>
      )}
      {rightPanelOpen && <>{children}</>}
    </aside>
  );
}
