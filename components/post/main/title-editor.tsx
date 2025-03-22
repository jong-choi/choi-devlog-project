"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { useAutosave } from "@/providers/autosave-store-provider";
import { EditableDiv } from "@ui/editable-div";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function TitleEditor({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const postId = useAutosave((state) => state.postId);
  const [value, setValue] = useState(defaultValue);
  const [hasChanged, setHasChanged] = useState(false);
  const onInput: (value: string) => void = (value) => {
    setValue(value);
    setHasChanged(true);
  };
  const debouncedTitle = useDebounce(value);

  const {
    selectedPostId,
    recentAutoSavedDataTitle,
    isLoadingDraftTitle,
    setIsLoadingDraftTitle,
    setIsAutoSaving,
    setRecentAutoSavedData,
  } = useAutosave(
    useShallow((state) => ({
      selectedPostId: state.selectedPostId,
      recentAutoSavedDataTitle: state.recentAutoSavedData?.title,
      isLoadingDraftTitle: state.isLoadingDraftTitle,
      setIsLoadingDraftTitle: state.setIsLoadingDraftTitle,
      setIsAutoSaving: state.setIsAutoSaving,
      setRecentAutoSavedData: state.setRecentAutoSavedData,
    }))
  );

  useEffect(() => {
    if (!hasChanged) return;
    if (typeof postId !== "string") return;
    if (postId !== selectedPostId) return;
    setRecentAutoSavedData({ title: debouncedTitle });
    setIsAutoSaving(true);
  }, [
    debouncedTitle,
    hasChanged,
    postId,
    selectedPostId,
    setIsAutoSaving,
    setRecentAutoSavedData,
  ]);

  useEffect(() => {
    if (!isLoadingDraftTitle) return;
    if (typeof postId !== "string" || postId !== selectedPostId) return;
    setValue(recentAutoSavedDataTitle || "");
    setIsLoadingDraftTitle(false);
  }, [
    isLoadingDraftTitle,
    postId,
    recentAutoSavedDataTitle,
    selectedPostId,
    setIsLoadingDraftTitle,
  ]);

  return (
    <div className="m-2 mb-6">
      <h2
        data-component-name="main-post-title"
        className="p-1 font-semibold tracking-tight first:mt-1"
      >
        <EditableDiv value={value} onInput={onInput} />
      </h2>
    </div>
  );
}
