"use client";
import { Logo } from "@/app/top-bar";
import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export function LeftSidebar() {
  const leftOpen = useLayoutStore((s) => s.leftOpen);
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full flex flex-col flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-[#1b1b1b] border-border shadow-sm -mt-1",
        leftOpen ? "w-0 lg:w-64" : "w-[calc(100vw-50px)] md:w-64 lg:w-0"
      )}
    >
      <div className="w-[calc(100vw-50px)] md:w-64 flex-shrink-0 h-full">
        <div className="flex h-[51px] p-2 items-center justify-center">
          <Logo />
        </div>
        <SidebarApp />
      </div>
    </aside>
  );
}
