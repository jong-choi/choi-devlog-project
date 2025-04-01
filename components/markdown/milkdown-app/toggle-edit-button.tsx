"use client";
import { cn } from "@/lib/utils";
import { useAutosave } from "@/providers/autosave-store-provider";
import { Switch } from "@ui/switch";

export default function ToggleEditButton() {
  const isEditMode = useAutosave((state) => state.isEditMode);
  const setIsEditMode = useAutosave((state) => state.setIsEditMode);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <form className="flex items-center gap-2">
      <label htmlFor="edit-mode" className={cn(isEditMode && "text-shadow")}>
        수정모드
      </label>
      <Switch
        onClick={toggleEditMode}
        checked={isEditMode}
        id="edit-mode"
        className={cn(
          "data-[state=checked]:bg-lime-200 data-[state=checked]:shadow-glass"
        )}
      />
    </form>
  );
}
