"use client";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { Button } from "@ui/button";
import { PanelLeftIcon } from "lucide-react";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const toggleLeftOpen = useLayoutStore((state) => state.toggleLeftOpen);
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleLeftOpen();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
