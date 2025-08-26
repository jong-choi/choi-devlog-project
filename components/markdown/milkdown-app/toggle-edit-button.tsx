"use client";

import { useEffect } from "react";
import { Columns2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-provider";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function ToggleEditButton() {
  const { layoutSnapshot, setLayoutSnaphot } = useAutosave(
    useShallow((state) => ({
      layoutSnapshot: state.layoutSnapshot,
      setLayoutSnaphot: state.setLayoutSnaphot,
    })),
  );

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    })),
  );

  const {
    isEditMode,
    isMilkdownOn,
    isRawOn,
    setIsEditMode,
    setIsMilkdown: setisMilkdownOn,
    setIsRaw: setIsRawOn,
  } = useLayoutStore(
    useShallow((state) => ({
      isEditMode: state.isEditMode,
      isMilkdownOn: state.isMilkdownOn,
      isRawOn: state.isRawOn,
      setIsEditMode: state.setIsEditMode,
      setIsMilkdown: state.setIsMilkdown,
      setIsRaw: state.setIsRaw,
    })),
  );

  const {
    setSidebarLeftCollapsed,
    setSidebarRightCollapsed,
    setRightPanelOpen,
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    rightPanelOpen,
  } = useLayoutStore(
    useShallow((state) => ({
      setSidebarLeftCollapsed: state.setSidebarLeftCollapsed,
      setSidebarRightCollapsed: state.setSidebarRightCollapsed,
      setRightPanelOpen: state.setRightPanelOpen,
      sidebarLeftCollapsed: state.sidebarLeftCollapsed,
      sidebarRightCollapsed: state.sidebarRightCollapsed,
      rightPanelOpen: state.rightPanelOpen,
    })),
  );

  useEffect(() => {
    if (!isEditMode) return;
    if (isMilkdownOn && isRawOn) {
      if (layoutSnapshot.length) return;
      setLayoutSnaphot([
        sidebarLeftCollapsed,
        sidebarRightCollapsed,
        rightPanelOpen,
      ]);
      setSidebarLeftCollapsed(true);
      setSidebarRightCollapsed(true);
      setRightPanelOpen(false);
    } else if (layoutSnapshot.length) {
      const [prevLeft, prevRight, prevOpen] = layoutSnapshot;
      setSidebarLeftCollapsed(prevLeft);
      setSidebarRightCollapsed(prevRight);
      setRightPanelOpen(prevOpen);
      setLayoutSnaphot([]);
    }
  }, [
    isEditMode,
    isMilkdownOn,
    isRawOn,
    layoutSnapshot,
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    rightPanelOpen,
    setLayoutSnaphot,
    setSidebarLeftCollapsed,
    setSidebarRightCollapsed,
    setRightPanelOpen,
  ]);

  useEffect(() => {
    if (!isEditMode && layoutSnapshot.length) {
      const [prevLeft, prevRight, prevOpen] = layoutSnapshot;
      setSidebarLeftCollapsed(prevLeft);
      setSidebarRightCollapsed(prevRight);
      setRightPanelOpen(prevOpen);
      setLayoutSnaphot([]);
    }
  }, [
    isEditMode,
    layoutSnapshot,
    setLayoutSnaphot,
    setSidebarLeftCollapsed,
    setSidebarRightCollapsed,
    setRightPanelOpen,
  ]);

  useEffect(() => {
    if (isMilkdownOn || isRawOn) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [isMilkdownOn, isRawOn, setIsEditMode]);

  const editLabel = isValid ? "편집 모드" : "게스트 모드";

  return (
    <div className="flex items-center gap-1 flex-shrink-0 sm:mr-7 lg:mr-0">
      <div className="text-[12px] font-semibold hidden lg:flex flex-shrink-0">
        {isEditMode ? editLabel : "편집 꺼짐"}
      </div>
      <div className="flex divide-x overflow-hidden rounded-full border text-[8px] font-medium">
        <button
          onClick={() => {
            if (isMilkdownOn) return setisMilkdownOn(false);
            setisMilkdownOn(true);
            setIsRawOn(false);
          }}
          className={cn(
            "w-12 md:w-6 text-center transition-colors",
            isMilkdownOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700",
          )}
        >
          MD
        </button>
        <button
          onClick={() => {
            if (isRawOn) return setIsRawOn(false);
            setIsRawOn(true);
            setisMilkdownOn(false);
          }}
          className={cn(
            "w-6 text-center transition-colors hidden md:block",
            isRawOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700",
          )}
        >
          RAW
        </button>
        <button
          onClick={() => {
            if (isRawOn && isMilkdownOn) {
              setIsRawOn(false);
              setisMilkdownOn(false);
            } else {
              setIsRawOn(true);
              setisMilkdownOn(true);
            }
          }}
          className={cn(
            "w-6 transition-colors hidden md:flex items-center justify-center",
            isRawOn && isMilkdownOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700",
          )}
        >
          <Columns2 className="w-3 h-3 mr-1" />
        </button>
      </div>
    </div>
  );
}
