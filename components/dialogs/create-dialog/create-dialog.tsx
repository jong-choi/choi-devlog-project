"use client";

import { ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";
import CreateDialogApp from "@/components/dialogs/create-dialog/create-dialog-app";

type CreateDialogProps = {
  title?: string;
  children: (props: { onClose: () => void }) => ReactNode;
};

export function CreateDialog({ title, children }: CreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  if (!isSortable) return <div />;
  return (
    <CreateDialogApp title={title} open={open} onOpenChange={setOpen}>
      {children({ onClose: () => setOpen(false) })}
    </CreateDialogApp>
  );
}
