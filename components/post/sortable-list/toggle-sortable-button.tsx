"use client";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@ui/label";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function ToggleSortableButton() {
  const { isSortable, toggleIsSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
      toggleIsSortable: state.toggleIsSortable,
    }))
  );

  return (
    <div className="flex items-center gap-1 py-1">
      <Label
        htmlFor="sortable-switch"
        className="text-[12px] font-semibold text-color-muted cursor-pointer"
      >
        {isSortable ? "편집 모드" : "편집 꺼짐"}
      </Label>
      <Switch
        id="sortable-switch"
        checked={isSortable}
        onCheckedChange={toggleIsSortable}
        className={cn(
          "h-4 w-7 border border-color-muted/60", // switch 전체 크기 줄이기
          "data-[state=checked]:bg-lime-200",
          "dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-neutral-900"
        )}
        thumbClassName={cn(
          "h-3 w-3  dark:border dark:border-color-muted", // thumb 사이즈 조정 (선택)
          "data-[state=checked]:translate-x-3.5",
          "transition-none"
        )}
      />
    </div>
  );
}
