"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import CreateNewTrigger from "@/components/dialogs/create-dialog/create-new-trigger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";

type CreateDialogAppProps = {
  buttonTitle?: string;
  dialogTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export default function CreateDialogApp({
  buttonTitle,
  dialogTitle,
  open,
  onOpenChange,
  children,
}: CreateDialogAppProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 px-1 text-color-muted hover:bg-glass-bg-60"
        >
          <CreateNewTrigger title={buttonTitle} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 {dialogTitle}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
