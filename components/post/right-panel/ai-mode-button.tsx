import { cn } from "@/lib/utils"; // 유틸 임포트는 네 기존 구조 기준
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function AIModeButton() {
  const mode = useLayoutStore((state) => state.rightPanelMode);
  const setMode = useLayoutStore((state) => state.setRightPanelMode);

  return (
    <div className="grid grid-cols-2 divide-x overflow-hidden rounded-full border text-xs font-medium">
      <button
        onClick={() => setMode("summary")}
        className={cn(
          "text-center transition-colors",
          mode === "summary"
            ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
            : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700"
        )}
      >
        AI 요약
      </button>
      <button
        onClick={() => setMode("recommend")}
        className={cn(
          "text-center transition-colors",
          mode === "recommend"
            ? "bg-lime-200 dark:bg-white dark:text-neutral-900"
            : "hover:bg-slate-100 text-color-base dark:hover:bg-neutral-700"
        )}
      >
        추천 게시글
      </button>
    </div>
  );
}
