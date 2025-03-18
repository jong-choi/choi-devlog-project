"use client";
import { useAutosave } from "@/providers/autosave-store-provider";
import dynamic from "next/dynamic";

// AutoSaveWrapper를 다이나믹 임포트
const AutoSaveWrapper = dynamic(
  () =>
    import("@/components/post/main/post-controller/autosave/autosave-wrapper"),
  { ssr: false, loading: () => <p>로딩중...</p> }
);

export default function AutosaveLoader() {
  const postId = useAutosave((state) => state.postId);
  if (typeof postId !== "string") return <></>;
  return <AutoSaveWrapper postId={postId} />;
}
