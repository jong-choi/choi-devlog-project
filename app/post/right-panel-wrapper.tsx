"use client";
import { SidebarToggle } from "@/app/post/sidebar-togle";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { ReactNode } from "react";

export function RightPanelWrapper({ children }: { children: ReactNode }) {
  const rightOpen = useLayoutStore((state) => state.rightOpen);
  const setRightOpen = useLayoutStore((state) => state.setRightOpen);
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#1b1b1b] border-l border-border shadow-sm",
        rightOpen ? "w-64" : "w-10"
      )}
    >
      {!rightOpen && (
        <SidebarToggle onClick={() => setRightOpen(true)} reverse />
      )}
      {rightOpen && <>{children}</>}
    </aside>
  );
}
