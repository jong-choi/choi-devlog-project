"use client";

import { ReactNode, useState } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import dynamic from "next/dynamic";

const CreatePopoverApp = dynamic(
  () => import("@/components/popover/create-popover/create-popover-app"),
  { ssr: false }
);

type CreatePopoverProps = {
  title?: string;
  children: (props: { onClose: () => void }) => ReactNode;
};

export function CreatePopover({ title, children }: CreatePopoverProps) {
  const [open, setOpen] = useState(false);
  const isSortable = useSidebarStore((state) => state.isSortable);

  if (!isSortable) return <div />;
  return (
    <CreatePopoverApp title={title} open={open} onOpenChange={setOpen}>
      {children({ onClose: () => setOpen(false) })}
    </CreatePopoverApp>
  );
}
