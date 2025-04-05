"use client";

import { useState, ReactNode } from "react";
import dynamic from "next/dynamic";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";

const UpdatePopoverApp = dynamic(
  () => import("@/components/popover/update-popover/update-popover-app"),
  { ssr: false }
);

type UpdatePopoverProps = {
  children: (props: { onClose: () => void }) => ReactNode;
};

export function UpdatePopover({ children }: UpdatePopoverProps) {
  const [open, setOpen] = useState(false);

  const { isSortable } = useSidebarStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  if (!isSortable) return null;
  return (
    <UpdatePopoverApp open={open} onOpenChange={setOpen}>
      {children({ onClose: () => setOpen(false) })}
    </UpdatePopoverApp>
  );
}
