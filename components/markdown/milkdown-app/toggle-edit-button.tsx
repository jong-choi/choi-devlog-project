"use client";
import { cn } from "@/lib/utils";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { Columns2 } from "lucide-react";

export default function ToggleEditButton() {
  const isEditMode = useAutosave((state) => state.isEditMode);
  const setIsEditMode = useAutosave((state) => state.setIsEditMode);

  const isMarkdownOn = useAutosave((state) => state.isMarkdownOn);
  const setIsMarkdownOn = useAutosave((state) => state.setIsMarkdown);
  const isRawOn = useAutosave((state) => state.isRawOn);
  const setIsRawOn = useAutosave((state) => state.setIsRaw);
  const layoutSnapshot = useAutosave((state) => state.layoutSnapshot);
  const setLayoutSnaphot = useAutosave((state) => state.setLayoutSnaphot);

  const { setLeftCollapsed, setRightCollapsed, leftCollapsed, rightCollapsed } =
    useSidebarStore(useShallow((state) => state));
  const setRightOpen = useLayoutStore((state) => state.setRightOpen);
  const rightOpen = useLayoutStore((state) => state.rightOpen);

  useEffect(() => {
    if (!isEditMode) return;
    if (isMarkdownOn && isRawOn) {
      if (layoutSnapshot.length) return;
      setLayoutSnaphot([leftCollapsed, rightCollapsed, rightOpen]);
      setLeftCollapsed(true);
      setRightCollapsed(true);
      setRightOpen(false);
    } else if (layoutSnapshot.length) {
      const [prevLeft, prevRight, prevOpen] = layoutSnapshot;
      setLeftCollapsed(prevLeft);
      setRightCollapsed(prevRight);
      setRightOpen(prevOpen);
      setLayoutSnaphot([]);
    }
  }, [
    isEditMode,
    isMarkdownOn,
    isRawOn,
    layoutSnapshot,
    leftCollapsed,
    rightCollapsed,
    rightOpen,
    setLayoutSnaphot,
    setLeftCollapsed,
    setRightCollapsed,
    setRightOpen,
  ]);

  useEffect(() => {
    if (!isEditMode && layoutSnapshot.length) {
      const [prevLeft, prevRight, prevOpen] = layoutSnapshot;
      setLeftCollapsed(prevLeft);
      setRightCollapsed(prevRight);
      setRightOpen(prevOpen);
      setLayoutSnaphot([]);
    }
  }, [
    isEditMode,
    layoutSnapshot,
    setLayoutSnaphot,
    setLeftCollapsed,
    setRightCollapsed,
    setRightOpen,
  ]);

  useEffect(() => {
    if (isMarkdownOn || isRawOn) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [isMarkdownOn, isRawOn, setIsEditMode]);

  return (
    <div className="flex items-center gap-1">
      <div className="text-[12px] font-semibold hidden md:flex">
        {isEditMode ? "편집 모드" : "편집 꺼짐"}
      </div>
      <div className="flex divide-x overflow-hidden rounded-full border text-[8px] font-medium">
        <button
          onClick={() => {
            if (isMarkdownOn) return setIsMarkdownOn(false);
            setIsMarkdownOn(true);
            setIsRawOn(false);
          }}
          className={cn(
            "w-12 md:w-6 text-center transition-colors",
            isMarkdownOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700"
          )}
        >
          MD
        </button>
        <button
          onClick={() => {
            if (isRawOn) return setIsRawOn(false);
            setIsRawOn(true);
            setIsMarkdownOn(false);
          }}
          className={cn(
            "w-6 text-center transition-colors hidden md:block",
            isRawOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700"
          )}
        >
          RAW
        </button>
        <button
          onClick={() => {
            if (isRawOn && isMarkdownOn) {
              setIsRawOn(false);
              setIsMarkdownOn(false);
            } else {
              setIsRawOn(true);
              setIsMarkdownOn(true);
            }
          }}
          className={cn(
            "w-6 transition-colors hidden md:flex items-center justify-center",
            isRawOn && isMarkdownOn
              ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
              : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700"
          )}
        >
          <Columns2 className="w-3 h-3 mr-1" />
        </button>
      </div>
    </div>
  );
}
