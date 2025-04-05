"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Button } from "@ui/button";
import { PanelLeftIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const {
    leftCollapsed,
    setLeftCollapsed,
    rightCollapsed,
    setRightCollapsed,
    toggleMobileOpen,
  } = useSidebarStore(useShallow((state) => state));
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
        if (leftCollapsed && rightCollapsed) {
          setRightCollapsed(false);
          setLeftCollapsed(false);
        } else {
          setRightCollapsed(true);
          setLeftCollapsed(true);
        }
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
