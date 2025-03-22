"use client";
import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export function LeftSidebar() {
  const leftOpen = useLayoutStore((s) => s.leftOpen);
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#1b1b1b] border-r border-border shadow-sm",
        leftOpen ? "w-64" : "w-0"
      )}
    >
      {leftOpen && <SidebarApp />}
    </aside>
  );
}
