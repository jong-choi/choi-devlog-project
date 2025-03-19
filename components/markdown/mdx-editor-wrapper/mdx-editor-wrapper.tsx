import { imagePlugin, MDXEditor, MDXEditorMethods } from "@mdxeditor/editor";
import { ALL_PLUGINS } from "@/components/markdown/mdx-editor-wrapper/mdx-editor-boilerplate";
import "@mdxeditor/editor/style.css";
import "@/components/markdown/mdx-editor-wrapper/mdx-editor-wrapper.module.css";
import { useEffect, useRef, useState } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function MdxEditorWrapper({ markdown }: { markdown: string }) {
  const [body, setBody] = useState<string>(markdown);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const mdxEditorRef = useRef<MDXEditorMethods | null>(null);

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
      mdxEditorRef.current?.setMarkdown(recentAutoSavedBody);
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

  // debouncedBody가 수정되면 이를 반영하고 setIsAutoSaving을 트리거
  useEffect(() => {
    if (!hasChanged) return;
    if (postId === selectedPostId) {
      setRecentAutoSavedData({ body: debouncedBody });
      setIsAutoSaving(true);
    }
  }, [
    debouncedBody,
    hasChanged,
    postId,
    selectedPostId,
    setIsAutoSaving,
    setRecentAutoSavedData,
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

  return (
    <>
      <MDXEditor
        className="mdxeditor"
        markdown={markdown}
        spellCheck={false}
        ref={mdxEditorRef}
        onChange={(md, initialMarkdownNormalize) => {
          if (!initialMarkdownNormalize) {
            setBody(md);
            if (!hasChanged) setTimeout(() => setHasChanged(true), 2000);
          }
        }}
        plugins={[...ALL_PLUGINS, imagePlugin({ imageUploadHandler })]}
      />
      {/* serverAction에서 받아올 값을 input hidden으로 */}
      <input type="hidden" name="body" value={body} />
    </>
  );
}
