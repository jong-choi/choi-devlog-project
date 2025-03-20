"use client";

import { useEffect, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { Loader2, CheckCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/date";
import { useIndexedDB } from "@/hooks/use-indexeddb";
import { UploadingDialogTrigger } from "@/components/post/main/post-controller/post-uploading-dialog";

export default function AutosaveIndicator() {
  const deleteByPostId = useIndexedDB().deleteByPostId;
  const selectedPostId = useAutosave((state) => state.selectedPostId);
  const setBeforeModification = useAutosave(
    (state) => state.setBeforeModification
  );
  const isAutoSaving = useAutosave((state) => state.isAutoSaving);
  const isAutoSaved = useAutosave((state) => state.isAutoSaved);
  const isUploading = useAutosave((state) => state.isUploading);
  const isUploaded = useAutosave((state) => state.isUploaded);
  const isLocalDBChecked = useAutosave((state) => state.isLocalDBChecked);
  const recentAutoSavedData = useAutosave((state) => state.recentAutoSavedData);
  const setIsLoadingDraftBody = useAutosave(
    (state) => state.setIsLoadingDraftBody
  );
  const setIsLoadingDraftTitle = useAutosave(
    (state) => state.setIsLoadingDraftTitle
  );
  const setBeforeUploading = useAutosave((state) => state.setBeforeUploading);

  const onApplyTemp = () => {
    setIsLoadingDraftBody(true);
    setIsLoadingDraftTitle(true);
    setBeforeUploading();
    // setBeforeModification();
  };

  const onDeleteTemp = async () => {
    if (!selectedPostId) return;
    await deleteByPostId(selectedPostId);
    setBeforeModification();
  };

  const [uploadedRecently, setUploadedRecently] = useState(false);

  useEffect(() => {
    if (isUploaded) {
      setUploadedRecently(true);
      const timer = setTimeout(() => setUploadedRecently(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUploaded]);

  return (
    <div className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      <>{JSON.stringify(recentAutoSavedData?.timestamp)}</>
      {isLocalDBChecked ? (
        <div className="group underline-offset-4 cursor-pointer opacity-75 hover:opacity-100 justify-items-end">
          <span>임시 저장된 데이터가 있습니다</span>
          <div className="flex gap-2">
            <span className="group-hover:hidden text-blue-300">
              ({formatKoreanDate(recentAutoSavedData?.timestamp)})
            </span>
            <span
              className="hidden group-hover:inline-block text-gray-300 hover:text-gray-500 hover:underline decoration-sky-300 transition"
              onClick={onApplyTemp}
            >
              불러오기
            </span>
            <span
              className="hidden group-hover:inline-block text-gray-300 hover:text-gray-500 hover:underline decoration-rose-200 transition"
              onClick={onDeleteTemp}
            >
              삭제하기
            </span>
          </div>
        </div>
      ) : isAutoSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>자동 저장 중...</span>
        </>
      ) : isUploading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>업로드 중...</span>
        </>
      ) : uploadedRecently ? (
        <>
          <CheckCircle className="w-4 h-4 text-blue-500" />
          <span>업로드 완료</span>
        </>
      ) : isAutoSaved ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>임시 저장됨</span>
          <UploadingDialogTrigger />
        </>
      ) : (
        <span></span>
      )}
    </div>
  );
}
