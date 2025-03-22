"use client";
import { SidebarSection } from "@/app/post/sidebar-section";
import { SidebarToggle } from "@/app/post/sidebar-togle";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export function LeftSidebar() {
  const leftOpen = useLayoutStore((s) => s.leftOpen);
  const setLeftOpen = useLayoutStore((s) => s.setLeftOpen);
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#1b1b1b] border-r border-border shadow-sm",
        leftOpen ? "w-64" : "w-10"
      )}
    >
      {leftOpen ? (
        <SidebarSection
          title="Topics"
          items={[
            "✨ Trending",
            "📘 Web Dev",
            "🧠 AI & ML",
            "⚡ Productivity",
            "🔧 Tools",
          ]}
        />
      ) : (
        <SidebarToggle onClick={() => setLeftOpen(true)} />
      )}
    </aside>
  );
}
