"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { useAutosave } from "@/providers/autosave-store-provider";
import { EditableDiv } from "@ui/editable-div";
import { usePostId } from "@/hooks/use-postId";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function TitleEditor({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const { postId } = usePostId();
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
    <h2
      data-component-name="main-post-title"
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
    >
      <EditableDiv value={value} onInput={onInput} />
      {/* serverAction에서 받아올 값을 input hidden으로 */}
      <input type="hidden" name="title" value={value} />
    </h2>
  );
}
