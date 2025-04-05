"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import CreateNewTrigger from "@/components/popover/create-popover/create-new-trigger";

type CreatePopoverAppProps = {
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export default function CreatePopoverApp({
  title,
  open,
  onOpenChange,
  children,
}: CreatePopoverAppProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 px-1 text-color-muted hover:bg-glass-bg-60"
        >
          <CreateNewTrigger title={title} />
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
