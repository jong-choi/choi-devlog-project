import React, { useCallback, useEffect, useRef, useState } from "react";
import { Ctx } from "@milkdown/kit/ctx";
import { cn } from "@/lib/utils";

interface AiInlineDockProps {
  open: boolean;
  x: number;
  y: number;
  ctx: Ctx | null;
  onClose: () => void;
  onSubmit: (prompt: string, ctx: Ctx) => void;
}

export default function AiInlineDock({
  open,
  x,
  y,
  ctx,
  onClose,
  onSubmit,
}: AiInlineDockProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  // 바깥 클릭으로 닫기
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = useCallback(() => {
    if (!ctx) return;
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed, ctx);
    setPrompt("");
  }, [ctx, onSubmit, prompt]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute z-50 w-[320px] max-w-[80vw] rounded-xl border border-neutral-200 bg-white p-3 shadow-xl",
        "dark:border-neutral-800 dark:bg-neutral-900",
      )}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, calc(-100% - 8px))", // 기준점 위쪽에 살짝 띄우기
      }}
      aria-label="AI 인라인 편집 독"
      role="dialog"
    >
      <div className="flex items-center gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={cn(
            "flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm",
            "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400",
            "dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:ring-neutral-600",
          )}
          placeholder="프롬프트를 입력하세요..."
        />
        <button
          type="button"
          disabled={!ctx || !prompt.trim()}
          onClick={handleSubmit}
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
            "bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-white dark:text-black dark:hover:bg-neutral-200",
          )}
        >
          전송
        </button>
      </div>
    </div>
  );
}
