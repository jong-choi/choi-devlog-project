"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

type UpdatePopoverAppProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export default function UpdatePopoverApp({
  open,
  onOpenChange,
  children,
}: UpdatePopoverAppProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex-1 max-w-4 p-0 -mr-2 text-color-muted hover:bg-glass-bg-60"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="p-2 shadow-xl bg-color-bg"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
