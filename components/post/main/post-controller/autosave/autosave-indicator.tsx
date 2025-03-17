"use client";

import { useEffect, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { Loader2, CheckCircle } from "lucide-react";

export default function AutosaveIndicator() {
  const isAutoSaving = useAutosave((state) => state.isAutoSaving);
  const isAutoSaved = useAutosave((state) => state.isAutoSaved);
  const isUploading = useAutosave((state) => state.isUploading);
  const isUploaded = useAutosave((state) => state.isUploaded);
  const recentAutoSavedData = useAutosave((state) => state.recentAutoSavedData);

  const [uploadedRecently, setUploadedRecently] = useState(false);

  useEffect(() => {
    if (isUploaded) {
      setUploadedRecently(true);
      const timer = setTimeout(() => setUploadedRecently(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUploaded]);

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      <>{JSON.stringify(recentAutoSavedData?.timestamp)}</>
      {isAutoSaving ? (
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
          <span>업로드됨</span>
        </>
      ) : isAutoSaved ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>자동 저장됨</span>
        </>
      ) : (
        <span></span>
      )}
    </div>
  );
}
