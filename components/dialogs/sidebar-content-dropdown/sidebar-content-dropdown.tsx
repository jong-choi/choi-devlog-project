"use client";
import { useState, ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import SidabarContentDropdownApp from "@/components/dialogs/sidebar-content-dropdown/sidabar-content-dropdown-app";

type SidebarContentDropdownProps = {
  children: (props: { onClose: () => void }) => ReactNode;
};

export function SidebarContentDropdown({
  children,
}: SidebarContentDropdownProps) {
  const [updateOpen, setUpdateOpen] = useState(false);

  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );
  useEffect(() => {
    console.log(updateOpen);
  }, [updateOpen]);

  useEffect(() => {
    // 다이알로그가 pointer-events: none을 넣는 것을 수동으로 클린업
    if (!updateOpen) {
      document.body.style.pointerEvents = "auto";
      document.body.removeAttribute("inert");
    }
  }, [updateOpen]);

  if (!isSortable) return null;
  return (
    <>
      <SidabarContentDropdownApp
        setUpdateOpen={() => setUpdateOpen(true)}
        setDeleteOpen={() => setUpdateOpen(true)}
      />
      {updateOpen && (
        <Dialog defaultOpen={true} onOpenChange={setUpdateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>수정</DialogTitle>
            </DialogHeader>
            {children({ onClose: () => setUpdateOpen(false) })}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
