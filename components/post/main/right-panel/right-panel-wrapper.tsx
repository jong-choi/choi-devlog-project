"use client";

import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { SidebarToggle } from "@ui/sidebar-toggle";
import { ReactNode } from "react";

export function RightPanelWrapper({ children }: { children: ReactNode }) {
  const rightOpen = useLayoutStore((state) => state.rightOpen);
  const setRightOpen = useLayoutStore((state) => state.setRightOpen);
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#1b1b1b] border-l border-border shadow-sm",
        rightOpen ? "w-64 2xl:w-96" : "w-10",
        "lg:absolute lg:top-0 lg:right-0 lg:z-50 xl:static xl:z-auto"
      )}
    >
      {!rightOpen && (
        <SidebarToggle onClick={() => setRightOpen(true)} reverse />
      )}
      {rightOpen && <>{children}</>}
    </aside>
  );
}
