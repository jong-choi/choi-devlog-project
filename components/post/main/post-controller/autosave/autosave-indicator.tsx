"use client";

import { useAutosave } from "@/providers/autosave-store-provider";
import { Loader2, CheckCircle } from "lucide-react";

export default function AutosaveIndicator() {
  const isAutoSaving = useAutosave((state) => state.isAutoSaving);
  const isAutoSaved = useAutosave((state) => state.isAutoSaved);

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      {isAutoSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>자동 저장 중...</span>
        </>
      ) : isAutoSaved ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>자동 저장됨</span>
        </>
      ) : (
        <span>자동 저장 대기 중...</span>
      )}
    </div>
  );
}
