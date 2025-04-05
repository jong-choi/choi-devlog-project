import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode, useState } from "react";
import CreateNewTrigger from "@/components/post/create-panel/create-new-trigger";
import { Button } from "@ui/button";

type CreatePopoverProps = {
  title?: string;
  children: (props: { onClose: () => void }) => ReactNode;
};

export function CreatePopover({ title, children }: CreatePopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {children({ onClose: () => setOpen(false) })}
      </PopoverContent>
    </Popover>
  );
}
