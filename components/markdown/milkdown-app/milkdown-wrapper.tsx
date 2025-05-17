"use client";
import { useCallback, useEffect, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/providers/auth-provider";
import MilkdownEditor from "@/components/markdown/milkdown-app/milkdown-app";
import { MilkdownProvider } from "@milkdown/react";
import { MarkdownRawEditor } from "@/components/markdown/milkdown-app/markdown-raw-editor";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function MilkdownWrapper({ markdown }: { markdown: string }) {
  const [body, setBody] = useState<string>(markdown);
  const debouncedBody = useDebounce(body);
  const [focused, setFocused] = useState<"milkdown" | "codemirror" | null>(
    null
  );
  const [snapshot, setSnapshot] = useState<string>();

  const {
    isLoadingDraftBody,
    recentAutoSavedBody,
    selectedPostId,
    postId,
    setIsLoadingDraftBody,
    setIsAutoSaving,
    setRecentAutoSavedData,
  } = useAutosave(
    useShallow((state) => ({
      isLoadingDraftBody: state.isLoadingDraftBody,
      recentAutoSavedBody: state.recentAutoSavedData?.body || "",
      selectedPostId: state.selectedPostId,
      postId: state.postId,
      setIsLoadingDraftBody: state.setIsLoadingDraftBody,
      setIsAutoSaving: state.setIsAutoSaving,
      setRecentAutoSavedData: state.setRecentAutoSavedData,
    }))
  );

  const { isMilkdownOn, isRawOn } = useLayoutStore(
    useShallow((state) => ({
      isMilkdownOn: state.isMilkdownOn,
      isRawOn: state.isRawOn,
    }))
  );

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    }))
  );

  // '자동저장된 파일을 반영하기'가 트리거 됐을 때 useEffect
  useEffect(() => {
    if (!isLoadingDraftBody) return;
    // '자동저장된 파일을 반영하기'를 적용하고 트리거를 false로
    if (recentAutoSavedBody) {
      setFocused(null);
      setBody(recentAutoSavedBody);
    }
    setIsLoadingDraftBody(false);
  }, [isLoadingDraftBody, setIsLoadingDraftBody, recentAutoSavedBody]);

  useEffect(() => {
    // 밀크다운 최초 파싱 전
    if (!debouncedBody) return;
    // 밀크다운 최초 파싱 직후
    if (snapshot === undefined) return setSnapshot(debouncedBody);
    // 밀크다운 수정사항 발생
    if (debouncedBody !== snapshot && postId === selectedPostId) {
      setRecentAutoSavedData({ body: debouncedBody });
      setIsAutoSaving(true);
    }
  }, [
    debouncedBody,
    snapshot,
    markdown,
    postId,
    selectedPostId,
    setRecentAutoSavedData,
    setIsAutoSaving,
  ]);

  const imageUploadHandler = useCallback(
    async (image: File) => {
      if (!isValid) {
        return await fileToBlob(image);
      }

      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/uploads`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      return url;
    },
    [isValid]
  );

  return (
    <MilkdownProvider>
      <div
        className={cn(
          isMilkdownOn && isRawOn && "w-full grid grid-cols-2 absolute left-0"
        )}
      >
        <div
          className={cn(
            !isMilkdownOn &&
              isRawOn &&
              "h-0 w-0 opacity-0 overflow-hidden pointer-events-none"
          )}
          aria-hidden={!isMilkdownOn && isRawOn}
          onFocus={() => setFocused("milkdown")}
        >
          <MilkdownEditor
            setMarkdown={setBody}
            markdown={body}
            onImageUpload={imageUploadHandler}
            isFocused={focused === "milkdown"}
          />
        </div>
        <div
          className={cn(
            isMilkdownOn &&
              !isRawOn &&
              "h-0 w-0 opacity-0 overflow-hidden pointer-events-none"
          )}
          aria-hidden={isMilkdownOn && !isRawOn}
          onFocus={() => setFocused("codemirror")}
        >
          <MarkdownRawEditor
            value={body}
            onChange={setBody}
            isFocused={focused === "codemirror"}
          />
        </div>
      </div>
    </MilkdownProvider>
  );
}

async function fileToBlob(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Base64 변환
    reader.onloadend = () => resolve(reader.result as string);
  });
}
