"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { MilkdownProvider } from "@milkdown/react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { AiInlineStoreProvider } from "@/providers/ai-inline-store-provider";
import { useAuthStore } from "@/providers/auth-provider";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useLayoutStore } from "@/providers/layout-store-provider";

const DynamicMilkdownEditor = dynamic(
  () => import("@/components/markdown/milkdown-app/milkdown-app"),
  {
    ssr: false,
  },
);

const DynamicMarkdownRawEditor = dynamic(
  () =>
    import("@/components/markdown/milkdown-app/markdown-raw-editor").then(
      (mod) => mod.MarkdownRawEditor,
    ),
  {
    ssr: false,
  },
);

export default function MilkdownWrapper({ markdown }: { markdown: string }) {
  const [body, setBody] = useState<string>(markdown);
  const debouncedBody = useDebounce(body);
  const [focused, setFocused] = useState<"milkdown" | "codemirror" | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState<string>();
  const [isMilkdownLoaded, setMilkdownLoaded] = useState(false);
  const [isRawEditorLoaded, setRawEditorLoaded] = useState(false);

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
    })),
  );

  const { isMilkdownOn, isRawOn } = useLayoutStore(
    useShallow((state) => ({
      isMilkdownOn: state.isMilkdownOn,
      isRawOn: state.isRawOn,
    })),
  );

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    })),
  );

  useEffect(() => {
    if (isMilkdownOn) setMilkdownLoaded(true);
  }, [isMilkdownOn]);

  useEffect(() => {
    if (isRawOn) setRawEditorLoaded(true);
  }, [isRawOn]);

  useEffect(() => {
    if (!isLoadingDraftBody) return;
    if (recentAutoSavedBody) {
      setFocused(null);
      setBody(recentAutoSavedBody);
    }
    setIsLoadingDraftBody(false);
  }, [isLoadingDraftBody, setIsLoadingDraftBody, recentAutoSavedBody]);

  useEffect(() => {
    if (!debouncedBody) return;
    if (snapshot === undefined) return setSnapshot(debouncedBody);
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
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      return url;
    },
    [isValid],
  );

  return (
    <AiInlineStoreProvider>
      <MilkdownProvider>
        <div
          className={cn(
            isMilkdownOn && isRawOn && "w-full grid grid-cols-2  left-0",
          )}
        >
          <div
            className={cn(
              !isMilkdownOn &&
                isRawOn &&
                "h-0 w-0 opacity-0 overflow-hidden pointer-events-none",
            )}
            aria-hidden={!isMilkdownOn && isRawOn}
            onFocus={() => {
              setFocused("milkdown");
              setMilkdownLoaded(true);
            }}
          >
            {isMilkdownLoaded && (
              <DynamicMilkdownEditor
                setMarkdown={setBody}
                markdown={body}
                onImageUpload={imageUploadHandler}
                isFocused={focused === "milkdown"}
              />
            )}
          </div>
          <div
            className={cn(
              isMilkdownOn &&
                !isRawOn &&
                "h-0 w-0 opacity-0 overflow-hidden pointer-events-none",
            )}
            aria-hidden={isMilkdownOn && !isRawOn}
            onFocus={() => {
              setFocused("codemirror");
              setRawEditorLoaded(true);
            }}
          >
            {isRawEditorLoaded && (
              <DynamicMarkdownRawEditor
                value={body}
                onChange={setBody}
                isFocused={focused === "codemirror"}
              />
            )}
          </div>
        </div>
      </MilkdownProvider>
    </AiInlineStoreProvider>
  );
}

async function fileToBlob(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => resolve(reader.result as string);
  });
}
