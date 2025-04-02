"use client";
import { useEffect, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/providers/auth-provider";
import MilkdownEditor from "@/components/markdown/milkdown-app/milkdown-app";
import { MilkdownProvider } from "@milkdown/react";
import { MarkdownRawEditor } from "@/components/markdown/milkdown-app/markdown-raw-editor";
import { cn } from "@/lib/utils";

export default function MilkdownWrapper({ markdown }: { markdown: string }) {
  const [body, setBody] = useState<string>(markdown);
  const [focused, setFocused] = useState<"milkdown" | "codemirror">("milkdown");
  const [snapshot, setSnapshot] = useState("");

  const { isLoadingDraftBody, setIsLoadingDraftBody, recentAutoSavedBody } =
    useAutosave(
      useShallow((state) => ({
        isLoadingDraftBody: state.isLoadingDraftBody,
        recentAutoSavedBody: state.recentAutoSavedData?.body || "",
        setIsLoadingDraftBody: state.setIsLoadingDraftBody,
      }))
    );

  // '자동저장된 파일을 반영하기'가 트리거 됐을 때 useEffect
  useEffect(() => {
    if (!isLoadingDraftBody) return;
    // '자동저장된 파일을 반영하기'를 적용하고 트리거를 false로
    if (recentAutoSavedBody) {
      setBody(recentAutoSavedBody);
    }
    setIsLoadingDraftBody(false);
  }, [isLoadingDraftBody, setIsLoadingDraftBody, recentAutoSavedBody]);

  const postId = useAutosave((state) => state.postId);

  const { selectedPostId, setIsAutoSaving, setRecentAutoSavedData } =
    useAutosave(
      useShallow((state) => ({
        selectedPostId: state.selectedPostId,
        setIsAutoSaving: state.setIsAutoSaving,
        setRecentAutoSavedData: state.setRecentAutoSavedData,
      }))
    );

  const debouncedBody = useDebounce(body);

  // 최초 로딩시에 milkdown이 markdown을 자동으로 파싱하면서 업데이트가 발생하는 문제.
  // 디바운스의 원리를 이용하여 파싱이 끝난 직후의 debouncedbody를 snapshot으로 남겨둠
  useEffect(() => {
    if (snapshot) return;
    if (!debouncedBody) return;
    if (debouncedBody !== markdown) {
      setSnapshot(debouncedBody);
    }
  }, [debouncedBody, snapshot, markdown]);

  // (초기로딩 제외한) 업데이트가 발생하여 debouncedBody가 수정되면 이를 반영하고 setIsAutoSaving을 트리거
  useEffect(() => {
    if (!snapshot) return;
    if (debouncedBody === snapshot) return;
    if (postId === selectedPostId) {
      setRecentAutoSavedData({ body: debouncedBody });
      setIsAutoSaving(true);
    }
  }, [
    debouncedBody,
    body,
    postId,
    selectedPostId,
    setIsAutoSaving,
    setRecentAutoSavedData,
    snapshot,
  ]);

  const isValid = useAuthStore((state) => state.isValid);

  async function imageUploadHandler(image: File) {
    if (!isValid) {
      // 로그아웃 상태에서는 Blob으로 이미지를 반환
      return await fileToBlob(image);
    }
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const { url } = await response.json();
    return url;
  }
  async function fileToBlob(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Base64 변환
      reader.onloadend = () => resolve(reader.result as string);
    });
  }

  const isMarkdownOn = useAutosave((state) => state.isMarkdownOn);
  const isRawOn = useAutosave((state) => state.isRawOn);

  return (
    <MilkdownProvider>
      <div
        className={cn(
          isMarkdownOn && isRawOn && "grid grid-cols-2 absolute left-0"
        )}
      >
        <div
          className={cn(isMarkdownOn ? "block" : "hidden")}
          onClick={() => setFocused("milkdown")}
        >
          <MilkdownEditor
            setMarkdown={setBody}
            markdown={body}
            onImageUpload={imageUploadHandler}
            isFocused={focused === "milkdown"}
          />
        </div>
        <div
          className={cn(isRawOn ? "block" : "hidden")}
          onClick={() => setFocused("codemirror")}
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
