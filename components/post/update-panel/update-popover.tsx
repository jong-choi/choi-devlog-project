"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { MouseEventHandler } from "react";

type UpdatePopoverProps = {
  children?: React.ReactNode;
  onContentClick?: MouseEventHandler<HTMLDivElement>;
};

export function UpdatePopover({
  children,
  onContentClick,
}: UpdatePopoverProps) {
  return (
    <Popover>
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
        className="p-2 shadow-xl bg-glass-bg backdrop-blur-sm"
        onClick={(e) => onContentClick && onContentClick(e)}
      >
        {children ?? <div className="flex flex-col gap-1">팝 오버 열림</div>}
      </PopoverContent>
    </Popover>
  );
}
