import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { ReactNode, useState } from "react";

type UpdatePopoverProps = {
  children: (props: { onClose: () => void }) => ReactNode;
};

export function UpdatePopover({ children }: UpdatePopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {children({ onClose: () => setOpen(false) })}
      </PopoverContent>
    </Popover>
  );
}
