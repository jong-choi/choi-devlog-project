"use client";

import { useEffect, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { Loader2, CheckCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/date";
import { useIndexedDB } from "@/hooks/use-indexeddb";
import { UploadingDialogTrigger } from "@/components/post/post-controller/post-uploading-dialog";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function AutosaveIndicator() {
  const deleteByPostId = useIndexedDB().deleteByPostId;
  const {
    selectedPostId,
    setBeforeModification,
    isAutoSaved,
    isUploading,
    isUploaded,
    isLocalDBChecked,
    recentAutoSavedData,
    setIsLoadingDraftBody,
    setIsLoadingDraftTitle,
    setBeforeUploading,
  } = useAutosave(
    useShallow((state) => ({
      selectedPostId: state.selectedPostId,
      setBeforeModification: state.setBeforeModification,
      isAutoSaved: state.isAutoSaved,
      isUploading: state.isUploading,
      isUploaded: state.isUploaded,
      isLocalDBChecked: state.isLocalDBChecked,
      recentAutoSavedData: state.recentAutoSavedData,
      setIsLoadingDraftBody: state.setIsLoadingDraftBody,
      setIsLoadingDraftTitle: state.setIsLoadingDraftTitle,
      setBeforeUploading: state.setBeforeUploading,
    }))
  );
  const { setIsEditMode, isEditting, setIsMilkdown } = useLayoutStore(
    useShallow((state) => ({
      setIsEditMode: state.setIsEditMode,
      isEditting: state.isMilkdownOn || state.isRawOn,
      setIsMilkdown: state.setIsMilkdown,
    }))
  );

  const onApplyTemp = () => {
    setIsLoadingDraftBody(true);
    setIsLoadingDraftTitle(true);
    setIsEditMode(true);
    if (!isEditting) {
      setIsMilkdown(true);
    }
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

  if (!isLocalDBChecked && !isUploading && !uploadedRecently && !isAutoSaved) {
    return <></>;
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-100 text-sm px-6 py-3 border-b border-border justify-between items-center hidden md:flex">
      {isLocalDBChecked ? (
        <>
          <div className="flex gap-2">
            <span>임시 저장된 데이터가 있습니다.</span>
            <span className="text-blue-300">
              ({formatKoreanDate(recentAutoSavedData?.timestamp)})
            </span>
          </div>
          <div className="flex gap-4">
            <div
              role="button"
              className="text-gray-600 dark:text-indigo-300 px-2 rounded-md transition-colors duration-200 hover:bg-sky-300/30"
              onClick={onApplyTemp}
            >
              불러오기
            </div>
            <div
              role="button"
              className="text-gray-600 dark:text-indigo-300 px-2 rounded-md transition-colors duration-200 hover:bg-rose-200/30"
              onClick={onDeleteTemp}
            >
              삭제하기
            </div>
          </div>
        </>
      ) : isUploading ? (
        <div className="flex gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>업로드 중...</span>
        </div>
      ) : isAutoSaved ? (
        <>
          <div className="flex gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>임시 저장됨</span>
          </div>
          <UploadingDialogTrigger />
        </>
      ) : (
        <span></span>
      )}
    </div>
  );
}
