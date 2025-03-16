"use client";
import dynamic from "next/dynamic";

// AutosaveWrapper를 다이나믹 임포트
const AutosaveWrapper = dynamic(
  () =>
    import("@/components/post/main/post-controller/autosave/autosave-wrapper"),
  { ssr: false, loading: () => <p>로딩중...</p> }
);

export default function AutosaveLoader() {
  return <AutosaveWrapper />;
}
