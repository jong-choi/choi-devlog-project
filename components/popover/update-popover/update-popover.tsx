"use client";

import { useState, ReactNode } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

const UpdatePopoverApp = dynamic(
  () => import("@/components/popover/update-popover/update-popover-app")
);

type UpdatePopoverProps = {
  children: (props: { onClose: () => void }) => ReactNode;
};

export function UpdatePopover({ children }: UpdatePopoverProps) {
  const [open, setOpen] = useState(false);

  const { isSortable } = useLayoutStore(
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
