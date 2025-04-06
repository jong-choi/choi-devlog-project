"use client";

import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

const CreatePopoverApp = dynamic(
  () => import("@/components/popover/create-popover/create-popover-app")
);

type CreatePopoverProps = {
  title?: string;
  children: (props: { onClose: () => void }) => ReactNode;
};

export function CreatePopover({ title, children }: CreatePopoverProps) {
  const [open, setOpen] = useState(false);
  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  if (!isSortable) return <div />;
  return (
    <CreatePopoverApp title={title} open={open} onOpenChange={setOpen}>
      {children({ onClose: () => setOpen(false) })}
    </CreatePopoverApp>
  );
}
