"use client";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Button } from "@ui/button";
import { PanelLeftIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { sidebarRightCollapsed, setSidebarRightCollapsed } = useLayoutStore(
    useShallow((state) => ({
      sidebarRightCollapsed: state.sidebarRightCollapsed,
      setSidebarRightCollapsed: state.setSidebarRightCollapsed,
    }))
  );

  const { toggleMobileOpen } = useSidebarStore(
    useShallow((state) => ({
      toggleMobileOpen: state.toggleMobileOpen,
    }))
  );
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleMobileOpen();
        setSidebarRightCollapsed(!sidebarRightCollapsed);
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
