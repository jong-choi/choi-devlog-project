"use client";

import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { SidebarToggle } from "@ui/sidebar-toggle";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export function RightPanelWrapper({ children }: { children: ReactNode }) {
  const { rightPanelOpen, setRightPanelOpen } = useLayoutStore(
    useShallow((state) => ({
      rightPanelOpen: state.rightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    })),
  );
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden md:flex flex-col flex-shrink-0 bg-slate-50 dark:bg-slate-900 xl:bg-transparent dark:xl:bg-transparent md:backdrop-blur-sm border-l border-border shadow-sm ",
        rightPanelOpen ? "w-64 2xl:w-96" : "w-10",
        "md:absolute md:top-0 md:right-0 md:z-50 xl:static xl:z-auto",
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
