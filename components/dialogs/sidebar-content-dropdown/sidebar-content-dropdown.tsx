"use client";
import { useState, ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import SidabarContentDropdownApp from "@/components/dialogs/sidebar-content-dropdown/sidabar-content-dropdown-app";

type SidebarContentDropdownProps = {
  deleteDisabled?: boolean;
  slots: {
    update: (props: { onClose: () => void }) => ReactNode;
    delete: (props: { onClose: () => void }) => ReactNode;
  };
};
type Mode = keyof SidebarContentDropdownProps["slots"];
const modeLabels: Record<Mode, string> = {
  update: "수정",
  delete: "삭제",
};

export function SidebarContentDropdown({
  deleteDisabled = false,
  slots,
}: SidebarContentDropdownProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("update");
  const setUpdateOpen = () => {
    setDialogOpen(true);
    setMode("update");
  };
  const setDeleteOpen = () => {
    setDialogOpen(true);
    setMode("delete");
  };

  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  useEffect(() => {
    // 다이알로그가 pointer-events: none을 넣는 것을 수동으로 클린업
    if (!dialogOpen) {
      document.body.style.pointerEvents = "auto";
      document.body.removeAttribute("inert");
    }
  }, [dialogOpen]);

  if (!isSortable) return null;
  return (
    <>
      <SidabarContentDropdownApp
        setUpdateOpen={setUpdateOpen}
        setDeleteOpen={setDeleteOpen}
        deleteDisabled={deleteDisabled}
      />
      {dialogOpen && (
        <Dialog defaultOpen={true} onOpenChange={setDialogOpen}>
          <DialogContent aria-describedby="sidebar-dropdown">
            <DialogHeader>
              <DialogTitle>{modeLabels[mode]}</DialogTitle>
            </DialogHeader>
            {slots[mode]({ onClose: () => setDialogOpen(false) })}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
