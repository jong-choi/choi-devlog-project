"use client";

import { ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";
import CreateDialogApp from "@/components/dialogs/create-dialog/create-dialog-app";

type CreateDialogProps = {
  buttonTitle?: string;
  dialogTitle: string;
  children: (props: { onClose: () => void }) => ReactNode;
};

export function CreateDialog({
  buttonTitle,
  dialogTitle,
  children,
}: CreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  if (!isSortable) return <div />;
  return (
    <CreateDialogApp
      buttonTitle={buttonTitle}
      dialogTitle={dialogTitle}
      open={open}
      onOpenChange={setOpen}
    >
      {children({ onClose: () => setOpen(false) })}
    </CreateDialogApp>
  );
}
